import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../store/settings.store'
import { useUIStore } from '../store/ui.store'
import { deepgramUrl, toPcm16 } from '../lib/stt'

interface Live {
  ws: WebSocket
  ctx: AudioContext
  stream: MediaStream
  said: string
}

/**
 * Click-to-talk dictation for the brain composer (Deepgram live, Hinglish-aware).
 * `onDone` receives the final text when the user stops talking.
 */
export function useVoiceInput(onDone: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const live = useRef<Live | null>(null)
  const done = useRef(onDone)
  done.current = onDone

  const teardown = () => {
    const l = live.current
    live.current = null
    if (!l) return ''
    l.ctx.close().catch(() => {})
    l.stream.getTracks().forEach((t) => t.stop())
    if (l.ws.readyState === WebSocket.OPEN) l.ws.close()
    return l.said.trim()
  }

  const start = useCallback(async () => {
    const { deepgramApiKey, defaultLanguage } = useSettingsStore.getState().settings
    if (!deepgramApiKey) {
      useUIStore.getState().addToast({ type: 'error', title: 'Voice needs Deepgram', message: 'Add your Deepgram key in Settings → API Keys' })
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext({ sampleRate: 16000 })
      const ws = new WebSocket(deepgramUrl({ language: defaultLanguage, keyterms: ['Codex', 'Claude', 'Cursor', 'EVES'] }), ['token', deepgramApiKey])
      const l: Live = { ws, ctx, stream, said: '' }
      live.current = l

      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processor.onaudioprocess = (e) => { if (ws.readyState === WebSocket.OPEN) ws.send(toPcm16(e.inputBuffer.getChannelData(0))) }
      ctx.createMediaStreamSource(stream).connect(processor)
      processor.connect(ctx.destination)

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        const text: string = data.channel?.alternatives?.[0]?.transcript ?? ''
        if (!text) return
        if (data.is_final) l.said += ' ' + text
        setInterim((data.is_final ? l.said : `${l.said} ${text}`).trim())
      }
      ws.onerror = () => {
        useUIStore.getState().addToast({ type: 'error', title: 'Voice input failed', message: 'Deepgram refused the connection — check the key' })
        teardown()
        setListening(false)
      }
      setInterim('')
      setListening(true)
    } catch (err) {
      teardown()
      useUIStore.getState().addToast({ type: 'error', title: 'Microphone unavailable', message: err instanceof Error ? err.message : String(err) })
    }
  }, [])

  /** CloseStream flushes the last words; give it a moment before hanging up. */
  const stop = useCallback(async () => {
    const l = live.current
    if (!l) return
    setListening(false)
    if (l.ws.readyState === WebSocket.OPEN) {
      l.ws.send('{"type":"CloseStream"}')
      await new Promise<void>((resolve) => {
        l.ws.addEventListener('close', () => resolve(), { once: true })
        setTimeout(resolve, 1500)
      })
    }
    const text = teardown()
    setInterim('')
    if (text) done.current(text)
  }, [])

  useEffect(() => () => { teardown() }, [])

  return { listening, interim, toggle: () => (live.current ? stop() : start()) }
}
