(function () {
  'use strict'

  // ─── State ──────────────────────────────────────────────────
  let isListening = false
  let currentSource = 'internal'
  let selectedDeviceId = ''
  let audioContext = null
  let mediaStreams = []
  let mediaRecorder = null
  let recordingId = null
  let writeChain = Promise.resolve()
  let sessionUtterances = []
  let processor = null
  let analyser = null
  let animationFrameId = null
  let sessionStartTime = null
  let sessionTranscript = ''
  let elapsedTimer = null
  let elapsedSeconds = 0
  let sessionHistory = []
  let deepgramSocket = null
  let deepgramTranscript = ''
  let deepgramKeepAlive = null
  let deepgramConnected = false

  // ─── DOM ────────────────────────────────────────────────────
  const listenBtn = document.getElementById('listen-btn')
  const btnText = document.getElementById('btn-text')
  const statusOrb = document.getElementById('status-orb')
  const statusLabel = document.getElementById('status-label')
  const statusTime = document.getElementById('status-time')
  const sourceBtns = document.querySelectorAll('.source-btn')
  const deviceSelect = document.getElementById('device-select')
  const transcriptText = document.getElementById('transcript-text')
  const stealthIndicator = document.getElementById('stealth-indicator')
  const historyArrow = document.getElementById('history-arrow')
  const historyPanel = document.getElementById('history-panel')
  const historyClose = document.getElementById('history-close')
  const historyList = document.getElementById('history-list')
  const overlay = document.getElementById('overlay')

  // ─── Audio Capture: Internal (system loopback) ─────────────
  // Same technique as Acemate: getDisplayMedia + audio:'loopback'
  async function startInternalCapture() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })

    if (!stream) throw new Error('Screen capture cancelled')

    const audioTrack = stream.getAudioTracks()[0]
    if (!audioTrack) {
      stream.getTracks().forEach(t => t.stop())
      throw new Error('No audio track in loopback stream')
    }

    // Stop video track — we only need audio
    stream.getVideoTracks().forEach(t => t.stop())

    return stream
  }

  // ─── Audio Capture: External (microphone) ──────────────────
  async function startExternalCapture() {
    const constraints = {
      audio: selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : true
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    if (!stream || !stream.getAudioTracks()[0]) {
      throw new Error('No audio track from external device')
    }

    return stream
  }

  // BOTH = them (system loopback) + you (mic), summed into one recording.
  // If the mic fails in BOTH mode we keep the system audio rather than losing
  // the whole meeting — the other side is the part you can't reconstruct.
  async function startCapture() {
    if (currentSource === 'internal') return [await startInternalCapture()]
    if (currentSource === 'external') return [await startExternalCapture()]

    const streams = [await startInternalCapture()]
    try {
      streams.push(await startExternalCapture())
    } catch (err) {
      console.warn('BOTH: mic unavailable, recording system audio only:', err)
      transcriptText.innerHTML = '<span class="color-amber">WARN: mic unavailable — system audio only</span>'
    }
    return streams
  }

  // ─── Process Audio Stream ───────────────────────────────────
  // Returns the summed stream that gets recorded — one mixed file whether the
  // source is INT, EXT, or BOTH.
  function processStream(streams) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    })

    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256

    processor = audioContext.createScriptProcessor(4096, 1, 1)

    const recordDest = audioContext.createMediaStreamDestination()

    streams.forEach(function (s) {
      const source = audioContext.createMediaStreamSource(s)
      source.connect(processor)
      source.connect(analyser)
      source.connect(recordDest)
    })

    processor.onaudioprocess = function (e) {
      const input = e.inputBuffer.getChannelData(0)

      // Convert float32 to int16 PCM (same as Acemate)
      const pcm = new Int16Array(input.length)
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]))
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }

      // ── Stream PCM data to Deepgram WebSocket ──
      if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
        deepgramSocket.send(pcm.buffer)
      }
    }

    processor.connect(audioContext.destination)

    // Audio level animation
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    // Gate on the analyser, not isListening — this starts before the flag is set
    function animateLevel() {
      if (!analyser) return
      analyser.getByteTimeDomainData(dataArray)

      // Update orb intensity based on audio level
      let max = 0
      for (let i = 0; i < dataArray.length; i++) {
        const v = Math.abs(dataArray[i] - 128)
        if (v > max) max = v
      }

      const intensity = max / 128
      const orbCore = document.getElementById('orb-core')
      if (orbCore) {
        const scale = 1 + intensity * 0.3
        orbCore.style.transform = 'scale(' + scale + ')'
      }

      animationFrameId = requestAnimationFrame(animateLevel)
    }
    animateLevel()

    return recordDest.stream
  }

  // ─── Recording to disk ──────────────────────────────────────
  // Chunks are appended to the file as they arrive, so a crash, a power cut or
  // Ctrl+Shift+X mid-meeting costs at most the last 5 seconds — not the meeting.
  function startRecorder(stream) {
    recordingId = 'rec-' + Date.now()
    writeChain = Promise.resolve()

    // Audio-only clone: the loopback stream still carries a (stopped) video track
    mediaRecorder = new MediaRecorder(new MediaStream(stream.getAudioTracks()), {
      mimeType: 'audio/webm;codecs=opus'
    })

    mediaRecorder.ondataavailable = function (e) {
      if (!e.data || e.data.size === 0) return
      const id = recordingId
      // Serialized: arrayBuffer() is async, so unchained writes could reorder
      writeChain = writeChain
        .then(function () { return e.data.arrayBuffer() })
        .then(function (buf) { return window.eves?.appendRecording({ id: id, data: buf }) })
        .catch(function (err) { console.error('Chunk write failed:', err) })
    }

    mediaRecorder.start(5000)
  }

  // Flush pending chunks and close out the file. Returns { path, url } or null.
  function stopRecorder() {
    return new Promise(function (resolve) {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') return resolve(null)
      const id = recordingId

      mediaRecorder.onstop = async function () {
        mediaRecorder = null
        try {
          await writeChain
          const res = await window.eves?.finishRecording(id)
          resolve(res && res.success ? res.data : null)
        } catch (err) {
          console.error('Recording save failed:', err)
          resolve(null)
        }
      }
      mediaRecorder.stop()
    })
  }

  // ─── Stop Capture ───────────────────────────────────────────
  function stopCapture() {
    if (processor) { processor.disconnect(); processor = null }
    if (audioContext) { audioContext.close().catch(() => {}); audioContext = null }
    mediaStreams.forEach(function (s) { s.getTracks().forEach(function (t) { t.stop() }) })
    mediaStreams = []
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null }
    if (analyser) { analyser = null }
  }

  // ─── Deepgram WebSocket (Real-time Streaming) ─────────────
  // language 'multi' = nova-3 code-switching (Hindi <-> English in one sentence).
  // 'en' on nova-2 forces English decoding, which is what mangles Hinglish.
  function buildDeepgramUrl(language) {
    var lang = language || 'multi'
    var p = new URLSearchParams({
      encoding: 'linear16',
      sample_rate: '16000',
      channels: '1',
      model: lang === 'multi' ? 'nova-3' : 'nova-2',
      smart_format: 'true',
      interim_results: 'true',
      diarize: 'true',
      language: lang,
      endpointing: '200'
    })
    return 'wss://api.deepgram.com/v1/listen?' + p.toString()
  }

  function sendKeepAlive() {
    if (deepgramSocket && deepgramSocket.readyState === WebSocket.OPEN) {
      deepgramSocket.send(JSON.stringify({ type: 'KeepAlive' }))
    }
  }

  var transcriptColors = ['color-cyan', 'color-green', 'color-white', 'color-amber', 'color-red']

  function colorizeText(text) {
    if (!text) return ''
    var words = text.split(' ')
    var result = ''
    for (var i = 0; i < words.length; i++) {
      var c = transcriptColors[i % transcriptColors.length]
      result += '<span class="' + c + '">' + words[i] + '</span> '
    }
    return result.trim()
  }

  function handleDeepgramMessage(data) {
    if (data.type !== 'Results') return

    var alt = data.channel?.alternatives?.[0]
    var transcript = alt?.transcript || ''
    var isFinal = data.is_final || false

    if (!transcript) return

    if (isFinal) {
      deepgramTranscript += (deepgramTranscript ? ' ' : '') + transcript
      sessionTranscript += (sessionTranscript ? ' ' : '') + transcript
      // Keep timing + speaker so the saved meeting has a seekable transcript
      var words = alt.words || []
      sessionUtterances.push({
        speaker: words[0]?.speaker ?? 0,
        start: data.start ?? words[0]?.start ?? 0,
        end: (data.start ?? 0) + (data.duration ?? 0),
        transcript: transcript,
        words: words
      })
      transcriptText.innerHTML = colorizeText(deepgramTranscript)
    } else {
      var displayText = deepgramTranscript
        ? deepgramTranscript + ' ' + transcript
        : transcript
      transcriptText.innerHTML = colorizeText(displayText)
    }

    var preview = document.getElementById('transcript-preview')
    if (preview) preview.scrollTop = preview.scrollHeight
  }

  async function connectDeepgram() {
    var settings = await window.eves?.getSettings()
    var apiKey = settings?.deepgramApiKey

    if (!apiKey) {
      throw new Error('ERR_DG_NOKEY: No Deepgram API key — open Settings → api_keys')
    }

    return new Promise(function (resolve, reject) {
      var timeout = setTimeout(function () {
        reject(new Error('ERR_DG_TIMEOUT: Deepgram connection timed out (10s)'))
      }, 10000)

      var ws = new WebSocket(buildDeepgramUrl(settings?.defaultLanguage), ['token', apiKey])

      ws.onopen = function () {
        clearTimeout(timeout)
        deepgramKeepAlive = setInterval(sendKeepAlive, 5000)
        deepgramConnected = true
        resolve()
      }

      ws.onmessage = function (e) {
        try {
          handleDeepgramMessage(JSON.parse(e.data))
        } catch (parseErr) {
          console.warn('DG: parse error', parseErr)
        }
      }

      ws.onerror = function () {
        clearTimeout(timeout)
        if (!deepgramConnected) {
          reject(new Error('ERR_DG_CONNECT: Deepgram connection failed. Check API key.'))
        } else {
          transcriptText.innerHTML = '<span class="color-red">ERR_DG_STREAM: Connection lost</span>'
          statusLabel.textContent = 'ERROR'
        }
      }

      ws.onclose = function (ev) {
        clearTimeout(timeout)
        if (deepgramKeepAlive) { clearInterval(deepgramKeepAlive); deepgramKeepAlive = null }
        deepgramSocket = null
        deepgramConnected = false
        // Meetings run long — a dropped socket must not silently end the transcript.
        // Audio keeps recording either way.
        if (isListening && ev.code !== 1000) {
          statusLabel.textContent = 'RECONNECTING...'
          setTimeout(function () {
            if (!isListening) return
            connectDeepgram()
              .then(function () { statusLabel.textContent = 'LISTENING' })
              .catch(function () { statusLabel.textContent = 'REC (NO STT)' })
          }, 2000)
        }
      }

      deepgramSocket = ws
    })
  }

  function disconnectDeepgram() {
    if (deepgramSocket) {
      if (deepgramSocket.readyState === WebSocket.OPEN) {
        deepgramSocket.send(JSON.stringify({ type: 'CloseStream' }))
      }
      deepgramSocket.close()
      deepgramSocket = null
    }
    if (deepgramKeepAlive) { clearInterval(deepgramKeepAlive); deepgramKeepAlive = null }
    deepgramConnected = false
  }

  // ─── Start Listening ────────────────────────────────────────
  async function startListening() {
    if (isListening) return
    try {
      statusLabel.textContent = 'CONNECTING...'

      mediaStreams = await startCapture()

      // Recording starts before transcription and never depends on it — a bad
      // API key or a dead network must not cost you the meeting audio.
      startRecorder(processStream(mediaStreams))

      isListening = true
      sessionStartTime = Date.now()
      elapsedSeconds = 0

      // Update UI
      listenBtn.classList.add('active')
      statusOrb.classList.add('listening')
      btnText.textContent = '⏹ ABORT_LISTEN'
      statusLabel.textContent = 'LISTENING'

      // Start elapsed timer
      elapsedTimer = setInterval(() => {
        elapsedSeconds++
        const m = Math.floor(elapsedSeconds / 60)
        const s = elapsedSeconds % 60
        statusTime.textContent = m + ':' + s.toString().padStart(2, '0')
      }, 1000)

      // Live transcript is best-effort on top of a recording that is already running
      deepgramTranscript = ''
      sessionUtterances = []
      connectDeepgram().catch(function (err) {
        console.error('Deepgram failed:', err)
        transcriptText.innerHTML = '<span class="color-red">' + err.message + '</span>'
        statusLabel.textContent = 'REC / NO_STT'
      })
    } catch (err) {
      console.error('Capture failed:', err)
      statusLabel.textContent = 'ERROR'
      transcriptText.textContent = err.message
      stopCapture()
      isListening = false
      updateListenUI()
    }
  }

  // ─── Stop Listening ─────────────────────────────────────────
  async function stopListening() {
    if (!isListening) return
    isListening = false
    disconnectDeepgram()
    deepgramTranscript = ''

    statusLabel.textContent = 'SAVING...'
    const recording = await stopRecorder()   // must flush before tracks die
    stopCapture()

    if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }

    listenBtn.classList.remove('active')
    statusOrb.classList.remove('listening')
    btnText.textContent = '▶ EXECUTE_LISTEN'
    statusTime.textContent = '00:00'

    // Reset orb core scale
    const orbCore = document.getElementById('orb-core')
    if (orbCore) orbCore.style.transform = 'scale(1)'

    // Auto-save — the whole point is not losing what was said
    saveSession(recording)
  }

  // ─── Toggle Listening ───────────────────────────────────────
  function toggleListening() {
    if (isListening) stopListening()
    else startListening()
  }

  function updateListenUI() {
    if (isListening) {
      listenBtn.classList.add('active')
      statusOrb.classList.add('listening')
      btnText.textContent = '⏹ ABORT_LISTEN'
      statusLabel.textContent = 'LISTENING'
    } else {
      listenBtn.classList.remove('active')
      statusOrb.classList.remove('listening')
      btnText.textContent = '▶ EXECUTE_LISTEN'
      statusLabel.textContent = 'STANDBY'
    }
  }

  // ─── Switch Source ──────────────────────────────────────────
  // Switching mid-meeting closes the current recording and starts a new one —
  // you can't splice a different source into one file.
  async function switchSource(source) {
    const wasListening = isListening
    if (wasListening) await stopListening()

    currentSource = source

    sourceBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.source === source)
    })

    if (source === 'external' || source === 'both') {
      deviceSelect.classList.remove('hidden')
      enumerateDevices()
    } else {
      deviceSelect.classList.add('hidden')
    }

    if (wasListening) startListening()
  }

  // ─── Device Enumeration ─────────────────────────────────────
  async function enumerateDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices.filter(d => d.kind === 'audioinput')

      deviceSelect.innerHTML = ''
      const defaultOpt = document.createElement('option')
      defaultOpt.value = ''
      defaultOpt.textContent = 'Default microphone'
      deviceSelect.appendChild(defaultOpt)

      audioInputs.forEach(device => {
        const opt = document.createElement('option')
        opt.value = device.deviceId
        opt.textContent = device.label || 'Microphone (' + device.deviceId.slice(0, 8) + '...)'
        deviceSelect.appendChild(opt)
      })

      if (selectedDeviceId) deviceSelect.value = selectedDeviceId
    } catch (err) {
      console.error('Device enumeration failed:', err)
    }
  }

  // ─── Save Session ───────────────────────────────────────────
  function saveSession(recording) {
    if (!sessionStartTime || elapsedSeconds === 0) {
      statusLabel.textContent = isListening ? 'LISTENING' : 'STANDBY'
      transcriptText.textContent = 'Nothing to save — start listening first'
      setTimeout(() => { if (!isListening) transcriptText.textContent = '' }, 3000)
      return
    }

    const session = {
      id: 'session-' + Date.now(),
      title: 'Session ' + new Date().toLocaleTimeString(),
      date: new Date().toISOString(),
      duration: elapsedSeconds,
      source: currentSource,
      transcript: sessionTranscript || '(no transcript captured yet)',
      utterances: sessionUtterances,
      audioPath: recording ? recording.path : '',
      audioUrl: recording ? recording.url : '',
      timestamp: Date.now()
    }

    sessionHistory.unshift(session)
    renderHistory()

    // Send to dashboard via IPC
    if (window.eves) {
      window.eves.saveSession(session)
    }

    // Visual feedback
      transcriptText.textContent = '[OK] Session saved to dashboard'
    setTimeout(() => {
      if (!isListening) transcriptText.textContent = ''
    }, 3000)

    // Reset session
    sessionTranscript = ''
    sessionUtterances = []
    elapsedSeconds = 0
    sessionStartTime = null
    statusTime.textContent = '00:00'
    statusLabel.textContent = isListening ? 'LISTENING' : 'STANDBY'
  }

  // ─── Render History ─────────────────────────────────────────
  function renderHistory() {
    if (sessionHistory.length === 0) {
      historyList.innerHTML = '<div class="history-empty">$ No sessions found.<br>$ Press Ctrl+Space to save.<br><span class="cursor-blink">▊</span></div>'
      return
    }

    historyList.innerHTML = ''
    sessionHistory.forEach(session => {
      const item = document.createElement('div')
      item.className = 'history-item'
      item.title = 'Open in dashboard'
      item.addEventListener('click', function () { window.eves?.showDashboard() })
      const m = Math.floor(session.duration / 60)
      const s = session.duration % 60
      item.innerHTML = `
        <div class="history-item-title">${session.title}</div>
        <div class="history-item-meta">
          <span class="history-item-source ${session.source}">${session.source}</span>
          <span>${m}:${s.toString().padStart(2, '0')}</span>
        </div>
      `
      historyList.appendChild(item)
    })
  }

  // ─── History Panel Toggle ───────────────────────────────────
  function toggleHistoryPanel() {
    historyPanel.classList.toggle('open')
    historyArrow.classList.toggle('active')
  }

  // ─── Event Bindings ─────────────────────────────────────────

  // Listen button click
  listenBtn.addEventListener('click', () => toggleListening())

  // Source buttons
  sourceBtns.forEach(btn => {
    btn.addEventListener('click', () => switchSource(btn.dataset.source))
  })

  // Device select
  deviceSelect.addEventListener('change', () => {
    selectedDeviceId = deviceSelect.value
  })

  // History arrow
  historyArrow.addEventListener('click', toggleHistoryPanel)
  historyClose.addEventListener('click', toggleHistoryPanel)

  // ─── IPC from main process (hotkey triggers) ────────────────
  if (window.eves) {
    // Toggle listening from hotkey
    if (window.eves.onToggleListening) {
      window.eves.onToggleListening((state) => {
        if (state) startListening()
        else stopListening()
      })
    }

    // Source changed from hotkey
    if (window.eves.onSourceChanged) {
      window.eves.onSourceChanged((source) => {
        switchSource(source)
      })
    }

    // Save session from hotkey — while listening this stops + saves (audio included)
    if (window.eves.onSaveSession) {
      window.eves.onSaveSession(() => {
        if (isListening) stopListening()
        else saveSession(null)
      })
    }

    // Visibility changed
    if (window.eves.onVisibilityChanged) {
      window.eves.onVisibilityChanged((visible) => {
        // Update any UI if needed
      })
    }

    // Click-through changed
    if (window.eves.onClickThroughChanged) {
      window.eves.onClickThroughChanged((enabled) => {
        overlay.classList.toggle('click-through', enabled)
      })
    }

    // Stealth changed
    if (window.eves.onStealthChanged) {
      window.eves.onStealthChanged((active) => {
        stealthIndicator.classList.toggle('stealth-on', active)
        stealthIndicator.classList.toggle('stealth-off', !active)
      })
    }
  }

  // ─── Init ───────────────────────────────────────────────────
  renderHistory()
  console.log('EVES Overlay ready — Ctrl+Shift+L to start listening')

})()
