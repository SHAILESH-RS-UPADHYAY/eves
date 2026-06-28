(function () {
  'use strict'

  // ─── State ──────────────────────────────────────────────────
  let isListening = false
  let currentSource = 'internal'
  let selectedDeviceId = ''
  let audioContext = null
  let mediaStream = null
  let processor = null
  let analyser = null
  let animationFrameId = null
  let sessionStartTime = null
  let sessionTranscript = ''
  let elapsedTimer = null
  let elapsedSeconds = 0
  let sessionHistory = []

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
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })

    if (!mediaStream) throw new Error('Screen capture cancelled')

    const audioTrack = mediaStream.getAudioTracks()[0]
    if (!audioTrack) {
      mediaStream.getTracks().forEach(t => t.stop())
      throw new Error('No audio track in loopback stream')
    }

    // Stop video track — we only need audio
    mediaStream.getVideoTracks().forEach(t => t.stop())

    return mediaStream
  }

  // ─── Audio Capture: External (microphone) ──────────────────
  async function startExternalCapture() {
    const constraints = {
      audio: selectedDeviceId
        ? { deviceId: { exact: selectedDeviceId } }
        : true
    }

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

    if (!mediaStream || !mediaStream.getAudioTracks()[0]) {
      throw new Error('No audio track from external device')
    }

    return mediaStream
  }

  // ─── Process Audio Stream ───────────────────────────────────
  function processStream(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    })

    const source = audioContext.createMediaStreamSource(stream)
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256

    processor = audioContext.createScriptProcessor(4096, 1, 1)

    processor.onaudioprocess = function (e) {
      const input = e.inputBuffer.getChannelData(0)

      // Convert float32 to int16 PCM (same as Acemate)
      const pcm = new Int16Array(input.length)
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]))
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }

      // ── Placeholder: send pcm.buffer to Deepgram via IPC ──
      // window.eves?.transcribe({ audioBlob: pcm.buffer, apiKey: ... })
      // For now, we just measure audio level for the orb animation
    }

    source.connect(processor)
    processor.connect(audioContext.destination)
    source.connect(analyser)

    // Audio level animation
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    function animateLevel() {
      if (!isListening) return
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
  }

  // ─── Stop Capture ───────────────────────────────────────────
  function stopCapture() {
    if (processor) { processor.disconnect(); processor = null }
    if (audioContext) { audioContext.close().catch(() => {}); audioContext = null }
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null }
    if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null }
    if (analyser) { analyser = null }
  }

  // ─── Start Listening ────────────────────────────────────────
  async function startListening() {
    try {
      statusLabel.textContent = 'CONNECTING...'

      const stream = currentSource === 'internal'
        ? await startInternalCapture()
        : await startExternalCapture()

      processStream(stream)
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

      // Notify main process
      if (window.eves) {
        // IPC notification if needed
      }
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
  function stopListening() {
    stopCapture()
    isListening = false

    if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }

    listenBtn.classList.remove('active')
    statusOrb.classList.remove('listening')
    btnText.textContent = '▶ EXECUTE_LISTEN'
    statusLabel.textContent = 'STANDBY'
    statusTime.textContent = '00:00'

    // Reset orb core scale
    const orbCore = document.getElementById('orb-core')
    if (orbCore) orbCore.style.transform = 'scale(1)'
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
  function switchSource(source) {
    const wasListening = isListening
    if (wasListening) stopListening()

    currentSource = source

    sourceBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.source === source)
    })

    if (source === 'external') {
      deviceSelect.classList.remove('hidden')
      enumerateDevices()
    } else {
      deviceSelect.classList.add('hidden')
    }

    if (wasListening) {
      setTimeout(() => startListening(), 300)
    }
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
  function saveSession() {
    if (!sessionStartTime || elapsedSeconds === 0) {
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
    elapsedSeconds = 0
    statusTime.textContent = '00:00'
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

    // Save session from hotkey
    if (window.eves.onSaveSession) {
      window.eves.onSaveSession(() => {
        saveSession()
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
