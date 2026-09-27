// EVES popup — capture, live transcript and recording for meetings that run for
// hours. Everything per audio block / per transcript message is O(1): the live
// feed renders only the tail, peaks are folded as they arrive, time is wall-clock.

import { deepgramUrl, toPcm16 } from '../src/lib/stt.ts'

const eves = window.eves
const $ = (id) => document.getElementById(id)

const SOURCES = ['internal', 'external', 'both']
const COLORS = ['color-cyan', 'color-green', 'color-white', 'color-amber', 'color-red']
const FEED_WORDS = 90        // live feed shows the tail of the meeting only
const PEAK_WINDOW = 8000     // samples @16 kHz → two waveform peaks per second
const MERGE_GAP = 2          // seconds: same speaker within this gap = same utterance

const ui = {
  popup: $('popup'),
  listenBtn: $('listen-btn'),
  btnText: $('btn-text'),
  orb: $('status-orb'),
  orbCore: $('orb-core'),
  label: $('status-label'),
  time: $('status-time'),
  rec: $('rec-chip'),
  feed: $('transcript-text'),
  preview: $('transcript-preview'),
  words: $('word-count'),
  notice: $('notice'),
  sourceBtns: [...document.querySelectorAll('.source-btn')],
  glider: $('source-glider'),
  device: $('device-select'),
  wave: $('wave'),
  drawer: $('log-drawer'),
  historyBtn: $('history-arrow'),
  history: $('history-list'),
  resize: $('resize-handle')
}

let source = 'internal'
let deviceId = ''
let listening = false
let busy = false          // start/stop are async — ignore toggles mid-transition
let session = null        // the meeting being captured
let audio = null          // { ctx, streams, processor, analyser }
let recorder = null       // { rec, id, flushed }
let socket = null         // { ws, offset, keepAlive }
let reconnectDelay = 2000
let clock = null
const history = []

const r2 = (n) => Math.round((n || 0) * 100) / 100
const elapsed = (s = session) => (s ? (Date.now() - s.startedAt) / 1000 : 0)

function fmt(total) {
  const s = Math.floor(total)
  const h = Math.floor(s / 3600)
  const m = Math.floor(s / 60) % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}

// ─── Capture ────────────────────────────────────────────────
async function captureSystem() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
  const hasAudio = stream.getAudioTracks().length > 0
  stream.getVideoTracks().forEach((t) => t.stop()) // only the loopback audio is used
  if (!hasAudio) {
    stream.getTracks().forEach((t) => t.stop())
    throw new Error('No system audio in the loopback stream')
  }
  return stream
}

async function captureMic() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true })
  if (!stream.getAudioTracks().length) throw new Error('No audio from the microphone')
  return stream
}

// BOTH = them (system loopback) + you (mic). If the mic fails we keep the system
// audio rather than losing the meeting — the other side is what you can't redo.
async function captureStreams() {
  if (source === 'internal') return [await captureSystem()]
  if (source === 'external') return [await captureMic()]
  const streams = [await captureSystem()]
  try {
    streams.push(await captureMic())
  } catch (err) {
    console.warn('BOTH: mic unavailable, recording system audio only:', err)
    notify('WARN: mic unavailable — recording system audio only', 'amber')
  }
  return streams
}

/** One graph for every source: summed into the recorder, the STT socket and the meter. */
function startAudio(streams) {
  const ctx = new AudioContext({ sampleRate: 16000 })
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 128
  const processor = ctx.createScriptProcessor(4096, 1, 1)
  const mix = ctx.createMediaStreamDestination()
  for (const s of streams) {
    const src = ctx.createMediaStreamSource(s)
    src.connect(processor)
    src.connect(analyser)
    src.connect(mix)
  }
  processor.onaudioprocess = (e) => onAudioBlock(e.inputBuffer.getChannelData(0))
  processor.connect(ctx.destination)
  audio = { ctx, streams, processor, analyser }
  return mix.stream
}

function stopAudio() {
  if (!audio) return
  audio.processor.disconnect()
  audio.ctx.close().catch(() => {})
  audio.streams.forEach((s) => s.getTracks().forEach((t) => t.stop()))
  audio = null
}

function onAudioBlock(input) {
  if (socket?.ws.readyState === WebSocket.OPEN) socket.ws.send(toPcm16(input))
  let max = 0
  for (let i = 0; i < input.length; i++) max = Math.max(max, Math.abs(input[i]))

  if (!session) return
  session.peakMax = Math.max(session.peakMax, max)
  session.peakN += input.length
  if (session.peakN >= PEAK_WINDOW) {
    session.peaks.push(Math.round(session.peakMax * 1000) / 1000)
    session.peakMax = 0
    session.peakN -= PEAK_WINDOW
  }
}

// ─── Recording to disk ──────────────────────────────────────
// Chunks are appended as they arrive: a crash or power cut mid-meeting costs at
// most the last 5 seconds. 32 kbps Opus is transparent for speech and keeps a
// 2-hour meeting near 30 MB.
function startRecorder(stream, id) {
  const rec = new MediaRecorder(new MediaStream(stream.getAudioTracks()), {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: 32000
  })
  let chain = Promise.resolve()
  rec.ondataavailable = (e) => {
    if (!e.data?.size) return
    // Serialized: arrayBuffer() is async, so unchained writes could reorder
    chain = chain
      .then(() => e.data.arrayBuffer())
      .then((data) => eves?.appendRecording({ id, data }))
      .catch((err) => console.error('Chunk write failed:', err))
  }
  rec.start(5000)
  recorder = { rec, id, flushed: () => chain }
}

/** Flush pending chunks and close the file. Resolves { path, url } or null. */
function stopRecorder() {
  return new Promise((resolve) => {
    const current = recorder
    if (!current || current.rec.state === 'inactive') return resolve(null)
    recorder = null
    current.rec.onstop = async () => {
      try {
        await current.flushed()
        const res = await eves?.finishRecording(current.id)
        resolve(res?.success ? res.data : null)
      } catch (err) {
        console.error('Recording save failed:', err)
        resolve(null)
      }
    }
    current.rec.stop()
  })
}

// ─── Deepgram live transcription ────────────────────────────
async function connect() {
  const settings = await eves?.getSettings()
  if (!settings?.deepgramApiKey) throw new Error('ERR_DG_NOKEY: add your Deepgram key in the dashboard → api_keys')

  return new Promise((resolve, reject) => {
    const url = deepgramUrl({ language: settings.defaultLanguage, diarize: settings.enableDiarization !== false })
    const ws = new WebSocket(url, ['token', settings.deepgramApiKey])
    const conn = { ws, offset: 0, keepAlive: null, purposeful: false }
    const timeout = setTimeout(() => { ws.close(); reject(new Error('ERR_DG_TIMEOUT: Deepgram did not answer in 10s')) }, 10000)

    ws.onopen = () => {
      clearTimeout(timeout)
      // Deepgram restarts its clock at 0 for every socket — pin this one to the recording's clock
      conn.offset = elapsed()
      conn.keepAlive = setInterval(() => ws.readyState === WebSocket.OPEN && ws.send('{"type":"KeepAlive"}'), 5000)
      socket = conn
      reconnectDelay = 2000
      resolve()
    }
    ws.onmessage = (e) => {
      try { onTranscript(JSON.parse(e.data), conn.offset) } catch (err) { console.warn('STT parse error', err) }
    }
    ws.onerror = () => {
      clearTimeout(timeout)
      if (socket !== conn) reject(new Error('ERR_DG_CONNECT: Deepgram refused the connection — check the key'))
    }
    ws.onclose = (ev) => {
      clearTimeout(timeout)
      clearInterval(conn.keepAlive)
      if (socket === conn) socket = null
      // Meetings run long — a dropped socket must not silently end the transcript.
      // The recording never stops either way.
      if (listening && !conn.purposeful && ev.code !== 1000) scheduleReconnect()
    }
  })
}

function scheduleReconnect() {
  setStatus('RECONNECTING...')
  const delay = reconnectDelay
  reconnectDelay = Math.min(reconnectDelay * 2, 15000)
  setTimeout(() => {
    if (!listening || socket) return
    connect()
      .then(() => setStatus('LISTENING'))
      .catch(() => {
        setStatus('REC / NO_STT')
        if (listening) scheduleReconnect()
      })
  }, delay)
}

/** CloseStream makes Deepgram flush the last words before it hangs up. */
function closeSocket() {
  const conn = socket
  socket = null // no more audio goes out after CloseStream
  if (!conn) return Promise.resolve()
  conn.purposeful = true
  clearInterval(conn.keepAlive)
  return new Promise((resolve) => {
    conn.ws.addEventListener('close', () => resolve(), { once: true })
    setTimeout(() => { conn.ws.close(); resolve() }, 2500)
    if (conn.ws.readyState === WebSocket.OPEN) conn.ws.send('{"type":"CloseStream"}')
    else conn.ws.close()
  })
}

function onTranscript(data, offset) {
  if (data.type !== 'Results' || !session) return
  const alt = data.channel?.alternatives?.[0]
  const text = alt?.transcript
  if (!text) return
  if (!data.is_final) return renderFeed(text)

  let words = (alt.words || []).map((w) => ({
    word: w.word,
    punctuated_word: w.punctuated_word ?? w.word,
    speaker: w.speaker ?? 0,
    start: r2(w.start + offset),
    end: r2(w.end + offset),
    confidence: r2(w.confidence)
  }))
  if (!words.length) {
    const start = r2((data.start ?? 0) + offset)
    words = [{ word: text, punctuated_word: text, speaker: 0, start, end: r2(start + (data.duration ?? 0)), confidence: 0 }]
  }
  addWords(words)
  renderFeed('')
}

/** Group words into speaker turns; a speaker's consecutive segments merge into one utterance. */
function addWords(words) {
  const turns = session.utterances
  for (const w of words) {
    const last = turns[turns.length - 1]
    if (last && last.speaker === w.speaker && w.start - last.end < MERGE_GAP && last.end - last.start < 60) {
      last.words.push(w)
      last.end = w.end
      last.transcript += ' ' + w.punctuated_word
    } else {
      turns.push({ speaker: w.speaker, start: w.start, end: w.end, transcript: w.punctuated_word, words: [w] })
    }
    session.tail.push(w.punctuated_word)
  }
  session.wordCount += words.length
  if (session.tail.length > FEED_WORDS) session.tail.splice(0, session.tail.length - FEED_WORDS)
}

const span = (text, className) => Object.assign(document.createElement('span'), { className, textContent: text })

/** Tail-only render — constant cost however long the meeting runs. */
function renderFeed(interim) {
  if (!session) return
  const frag = document.createDocumentFragment()
  const base = session.wordCount - session.tail.length // absolute index keeps colours stable
  session.tail.forEach((w, i) => frag.append(span(w, COLORS[(base + i) % COLORS.length]), ' '))
  if (interim) {
    interim.split(' ').forEach((w, j) => frag.append(span(w, COLORS[(session.wordCount + j) % COLORS.length] + ' interim'), ' '))
  }
  ui.feed.replaceChildren(frag)
  ui.preview.scrollTop = ui.preview.scrollHeight
  ui.words.textContent = session.wordCount ? ` · ${session.wordCount} words` : ''
}

// ─── Listen lifecycle ───────────────────────────────────────
async function start() {
  if (listening || busy) return
  busy = true
  setStatus('CONNECTING...')
  try {
    const streams = await captureStreams()
    session = {
      id: 'rec-' + Date.now(),
      startedAt: Date.now(),
      source,
      utterances: [],
      tail: [],
      wordCount: 0,
      peaks: [],
      peakMax: 0,
      peakN: 0
    }
    // Recording starts before transcription and never depends on it — a bad key
    // or a dead network must not cost you the meeting audio.
    startRecorder(startAudio(streams), session.id)
    listening = true
    setListeningUI(true)
    ui.feed.replaceChildren()
    ui.words.textContent = ''
    clock = setInterval(() => { ui.time.textContent = fmt(elapsed()) }, 1000)
    setStatus('LISTENING')

    connect().catch((err) => {
      console.error('STT failed:', err)
      notify(err.message, 'red')
      setStatus('REC / NO_STT')
      if (listening && !err.message.startsWith('ERR_DG_NOKEY')) scheduleReconnect()
    })
  } catch (err) {
    console.error('Capture failed:', err)
    stopAudio()
    session = null
    setStatus('ERROR')
    notify(err.message || 'Audio capture failed', 'red')
  } finally {
    busy = false
  }
}

async function stop() {
  if (!listening || busy) return
  busy = true
  listening = false
  setStatus('SAVING...')
  const closing = closeSocket()          // last words flush while the file does
  const recording = await stopRecorder() // must flush before the tracks die
  await closing
  stopAudio()
  clearInterval(clock)
  setListeningUI(false)
  await save(recording)
  busy = false
}

const toggle = () => (listening ? stop() : start())

async function save(recording) {
  const s = session
  session = null
  ui.time.textContent = '00:00'
  setStatus('STANDBY')
  if (!s) return
  if (!recording && !s.utterances.length) {
    notify('Nothing captured — no audio reached EVES', 'amber')
    return
  }

  const duration = Math.round(elapsed(s))
  const when = new Date(s.startedAt)
  const meeting = {
    id: s.id,
    title: 'Meeting ' + when.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    date: when.toISOString(),
    duration,
    source: s.source,
    transcript: s.utterances.map((u) => u.transcript).join(' '),
    utterances: s.utterances,
    audioPath: recording?.path || '',
    audioUrl: recording?.url || '',
    peaks: s.peaks
  }

  const res = await eves?.saveSession(meeting)
  history.unshift({ id: meeting.id, title: meeting.title, duration, source: meeting.source })
  renderHistory()
  if (res?.success) {
    notify(`[OK] ${fmt(duration)} · ${s.wordCount} words saved`, 'green', {
      label: 'OPEN IN BRAIN ›',
      run: () => eves.showDashboard({ page: 'brain', meetingId: meeting.id })
    })
  } else {
    notify('ERR: session could not be saved — audio is still on disk and will be recovered on restart', 'red')
  }
}

// ─── Source switching ───────────────────────────────────────
// Switching mid-meeting closes the current recording and starts a new one —
// a different source can't be spliced into one file.
async function switchSource(next) {
  if (busy || next === source) return
  const was = listening
  if (was) await stop()
  source = next
  ui.sourceBtns.forEach((btn, i) => {
    const on = btn.dataset.source === next
    btn.classList.toggle('active', on)
    if (on) ui.glider.style.transform = `translateX(${i * 100}%)`
  })
  ui.device.classList.toggle('hidden', next === 'internal')
  if (next !== 'internal') listDevices()
  if (was) start()
}

async function listDevices() {
  try {
    const inputs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput')
    const options = [new Option('Default microphone', '')]
    inputs.forEach((d) => options.push(new Option(d.label || `Microphone (${d.deviceId.slice(0, 8)}…)`, d.deviceId)))
    ui.device.replaceChildren(...options)
    ui.device.value = deviceId
  } catch (err) {
    console.error('Device enumeration failed:', err)
  }
}

// ─── UI helpers ─────────────────────────────────────────────
function setStatus(text) {
  ui.label.textContent = text
}

function setListeningUI(on) {
  ui.listenBtn.classList.toggle('active', on)
  ui.orb.classList.toggle('listening', on)
  ui.popup.classList.toggle('listening', on)
  ui.rec.classList.toggle('hidden', !on)
  ui.btnText.textContent = on ? '⏹ ABORT_LISTEN' : '▶ EXECUTE_LISTEN'
}

let noticeTimer = null
function notify(text, tone = 'cyan', action = null) {
  ui.notice.className = `tone-${tone}`
  ui.notice.replaceChildren(text)
  if (action) {
    const btn = document.createElement('button')
    btn.textContent = action.label
    btn.onclick = action.run
    ui.notice.append(btn)
  }
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => ui.notice.classList.add('hidden'), action ? 15000 : 6000)
}

function renderHistory() {
  if (!history.length) {
    ui.history.innerHTML = '<div class="history-empty">$ No sessions yet.<br>$ Alt+L to start, Alt+Space to save.<br><span class="cursor-blink">▊</span></div>'
    return
  }
  ui.history.replaceChildren(...history.map((h) => {
    const item = document.createElement('div')
    item.className = 'history-item'
    item.title = 'Open in EVES brain'
    item.onclick = () => eves?.showDashboard({ page: 'brain', meetingId: h.id })
    const meta = document.createElement('div')
    meta.className = 'history-item-meta'
    meta.append(span(h.source, `history-item-source ${h.source}`), span(fmt(h.duration), ''))
    item.append(span(h.title, 'history-item-title'), meta)
    return item
  }))
}

function toggleDrawer() {
  const open = ui.drawer.classList.toggle('open')
  ui.historyBtn.classList.toggle('active', open)
  ui.drawer.setAttribute('aria-hidden', String(!open))
}

// ─── Live meter (≈30 fps) ───────────────────────────────────
const meter = ui.wave.getContext('2d')
const bins = new Uint8Array(64)
let lastFrame = 0

function drawMeter(t) {
  requestAnimationFrame(drawMeter)
  if (t - lastFrame < 33) return
  lastFrame = t
  const dpr = window.devicePixelRatio || 1
  const w = Math.round(ui.wave.clientWidth * dpr)
  const h = Math.round(ui.wave.clientHeight * dpr)
  if (ui.wave.width !== w || ui.wave.height !== h) Object.assign(ui.wave, { width: w, height: h })
  meter.clearRect(0, 0, w, h)

  if (audio) audio.analyser.getByteFrequencyData(bins)
  const n = 26
  const gap = 2 * dpr
  const bw = (w - gap * (n - 1)) / n
  let level = 0
  for (let i = 0; i < n; i++) {
    const v = audio ? bins[Math.floor((i / n) * bins.length * 0.75)] / 255 : (Math.sin(t / 650 + i / 2.4) + 1) * 0.05
    level = Math.max(level, v)
    const bh = Math.max(2 * dpr, v * h)
    meter.fillStyle = i % 7 === 3
      ? (listening ? '#00F5FF' : '#22D68C')
      : listening ? `rgba(34, 214, 140, ${0.35 + v * 0.65})` : `rgba(0, 245, 255, ${0.3 + v * 0.7})`
    meter.fillRect(i * (bw + gap), (h - bh) / 2, bw, bh)
  }
  ui.orbCore.style.transform = `scale(${1 + level * 0.35})`
}
requestAnimationFrame(drawMeter)

// ─── Resize grip (transparent windows have no native resize border) ─────
ui.resize.addEventListener('pointerdown', (e) => {
  ui.resize.setPointerCapture(e.pointerId)
  const from = { x: e.screenX, y: e.screenY, w: window.outerWidth, h: window.outerHeight }
  let last = e
  let queued = false
  const send = () => eves?.resizePopup({ width: from.w + last.screenX - from.x, height: from.h + last.screenY - from.y })
  const move = (ev) => {
    last = ev
    if (queued) return
    queued = true
    requestAnimationFrame(() => { queued = false; send() })
  }
  const up = () => {
    send()
    ui.resize.removeEventListener('pointermove', move)
    ui.resize.removeEventListener('pointerup', up)
  }
  ui.resize.addEventListener('pointermove', move)
  ui.resize.addEventListener('pointerup', up)
})

// ─── Wiring ─────────────────────────────────────────────────
ui.listenBtn.addEventListener('click', toggle)
ui.sourceBtns.forEach((btn) => btn.addEventListener('click', () => switchSource(btn.dataset.source)))
ui.device.addEventListener('change', () => { deviceId = ui.device.value })
ui.historyBtn.addEventListener('click', toggleDrawer)
$('history-close').addEventListener('click', toggleDrawer)
$('btn-dashboard').addEventListener('click', () => eves?.showDashboard())
$('btn-hide').addEventListener('click', () => eves?.hidePopup())

eves?.onToggleListening(toggle)
eves?.onCycleSource(() => switchSource(SOURCES[(SOURCES.indexOf(source) + 1) % SOURCES.length]))
eves?.onSaveSession(() => (listening ? stop() : notify('Not recording — nothing to save', 'amber')))
eves?.onClickThroughChanged((on) => ui.popup.classList.toggle('click-through', on))

renderHistory()
