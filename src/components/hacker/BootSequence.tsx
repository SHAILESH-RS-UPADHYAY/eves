import { useEffect, useState } from 'react'

const bootLines: { text: string; type: 'ok' | 'info' | 'warn' | 'cmd' }[] = [
  { text: 'EVES Neural Core v2.1.0 — Meeting Intelligence System', type: 'info' },
  { text: 'Copyright (c) 2026 EVES Systems. All rights reserved.', type: 'info' },
  { text: '', type: 'info' },
  { text: 'Initializing neural processing unit......... [OK]', type: 'ok' },
  { text: 'Loading Deepgram nova-2 transcription model.. [OK]', type: 'ok' },
  { text: 'Loading Groq LLaMA-3 70B inference engine.... [OK]', type: 'ok' },
  { text: 'Mounting audio capture drivers............... [OK]', type: 'ok' },
  { text: '  └─ Loopback (system audio)................. [READY]', type: 'ok' },
  { text: '  └─ Microphone (external input)............. [READY]', type: 'ok' },
  { text: 'Activating stealth module.................... [OK]', type: 'ok' },
  { text: '  └─ SetWindowDisplayAffinity = EXCLUDEFROMCAPTURE', type: 'ok' },
  { text: '  └─ Taskbar visibility = HIDDEN', type: 'ok' },
  { text: '  └─ Alt+Tab exclusion = ENABLED', type: 'ok' },
  { text: 'Establishing IPC bridge...................... [OK]', type: 'ok' },
  { text: '  └─ Dashboard <-> Overlay channel........... [CONNECTED]', type: 'ok' },
  { text: 'Registering global shortcuts................. [OK]', type: 'ok' },
  { text: '  └─ 8 keybindings active', type: 'ok' },
  { text: 'Checking API credentials..................... [OK]', type: 'ok' },
  { text: '  └─ Deepgram API key......................... [FOUND]', type: 'ok' },
  { text: '  └─ Groq API key............................. [FOUND]', type: 'ok' },
  { text: '', type: 'info' },
  { text: '> All systems operational.', type: 'cmd' },
  { text: '> EVES ready. Awaiting commands.', type: 'cmd' },
  { text: '>', type: 'cmd' },
]

export function BootSequence({ onComplete }: { onComplete?: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [fadingOut, setFadingOut] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setVisibleLines(i + 1)
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setFadingOut(true), 600)
        setTimeout(() => {
          setHidden(true)
          onComplete?.()
        }, 1200)
      }
    }, 90)
    return () => clearInterval(interval)
  }, [onComplete])

  if (hidden) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#06060c',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Courier New", "Consolas", monospace',
      opacity: fadingOut ? 0 : 1,
      transition: 'opacity 0.6s ease',
      pointerEvents: fadingOut ? 'none' : 'auto',
      overflow: 'hidden'
    }}>
      {/* Scanlines on boot screen */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 245, 255, 0.02) 2px, rgba(0, 245, 255, 0.02) 3px)',
        pointerEvents: 'none'
      }} />

      {/* Faint grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '680px',
        maxWidth: '90%',
        padding: '0 24px'
      }}>
        {/* ASCII art header */}
        <pre style={{
          color: '#00F5FF',
          fontSize: '10px',
          lineHeight: 1.2,
          textShadow: '0 0 10px rgba(0, 245, 255, 0.5)',
          marginBottom: '20px',
          whiteSpace: 'pre'
        }}>{` ______   ______   ______   ______   ______   ______  
|______  |_____| |_____| |_____| |_____| |______  
|______| |       |       |       |       |______|`}</pre>

        <div style={{ marginBottom: '16px' }}>
          <span style={{ color: '#00F5FF', fontSize: '13px' }}>evessys@localhost</span>
          <span style={{ color: '#666', fontSize: '13px' }}>:</span>
          <span style={{ color: '#A78BFA', fontSize: '13px' }}>~</span>
          <span style={{ color: '#666', fontSize: '13px' }}>$ </span>
          <span style={{ color: '#10B981', fontSize: '13px' }}>./eves --init --stealth</span>
        </div>

        {bootLines.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{
            fontSize: '12px',
            marginBottom: '1px',
            lineHeight: 1.55,
            color: line.type === 'ok' ? '#10B981' : line.type === 'cmd' ? '#00F5FF' : line.type === 'warn' ? '#F59E0B' : '#888',
            textShadow: line.type === 'ok' || line.type === 'cmd' ? '0 0 6px currentColor' : 'none',
            whiteSpace: 'pre-wrap',
            animation: 'bootLineIn 0.15s ease-out'
          }}>
            {line.text}
            {i === visibleLines - 1 && <span style={{ animation: 'cursorBlink 1s step-end infinite' }}>▊</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
