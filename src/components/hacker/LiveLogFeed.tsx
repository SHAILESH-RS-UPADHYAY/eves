import { useEffect, useState, useRef } from 'react'

const logTemplates = [
  { level: 'INFO', msg: 'Deepgram WebSocket connected to wss://api.deepgram.com' },
  { level: 'DEBUG', msg: 'Audio frame received: 1920 bytes @ 16kHz' },
  { level: 'INFO', msg: 'Transcript partial: "hello everyone thanks for"' },
  { level: 'INFO', msg: 'Transcript final: "Hello everyone, thanks for joining"' },
  { level: 'DEBUG', msg: 'PCM stream chunk: 4096 samples buffered' },
  { level: 'INFO', msg: 'Speaker diarization: 2 speakers detected' },
  { level: 'WARN', msg: 'Audio level low on channel 2 — adjusting gain' },
  { level: 'DEBUG', msg: 'Groq inference request queued (token est: 450)' },
  { level: 'INFO', msg: 'Session auto-saved to local store' },
  { level: 'INFO', msg: 'Neural model accuracy: 96.2% confidence' },
  { level: 'DEBUG', msg: 'setIgnoreMouseEvents(true) — clickthrough active' },
  { level: 'INFO', msg: 'Stealth mode: WDA_EXCLUDEFROMCAPTURE confirmed' },
  { level: 'WARN', msg: 'Network latency spike: 78ms — stabilizing' },
  { level: 'DEBUG', msg: 'IPC message: overlay -> main [toggle-listening]' },
  { level: 'INFO', msg: 'Audio source switched: internal -> external' },
  { level: 'INFO', msg: 'Session saved: 14:32:08 / 45min / 2 speakers' },
  { level: 'DEBUG', msg: 'Memory pool: 48.3MB / 512MB — healthy' },
  { level: 'INFO', msg: 'Hotkey registered: Alt+L -> toggle-listening' },
]

function getTimestamp() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

interface LogEntry {
  time: string
  level: string
  msg: string
  id: number
}

export function LiveLogFeed({ maxLines = 12 }: { maxLines?: number }) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function addLog() {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)]
      setLogs(prev => [...prev.slice(-(maxLines - 1)), {
        time: getTimestamp(),
        level: template.level,
        msg: template.msg,
        id: idRef.current++
      }])

      timer = setTimeout(addLog, 800 + Math.random() * 2500)
    }

    timer = setTimeout(addLog, 500)
    return () => clearTimeout(timer)
  }, [maxLines])

  const levelColor = (level: string) => {
    switch (level) {
      case 'INFO': return '#10B981'
      case 'WARN': return '#F59E0B'
      case 'DEBUG': return '#666'
      case 'ERROR': return '#F43F5E'
      default: return '#888'
    }
  }

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.5)',
      border: '1px solid rgba(0, 245, 255, 0.1)',
      borderRadius: '8px',
      padding: '12px',
      fontFamily: '"Courier New", "Consolas", monospace',
      backdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <div key={pos} style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          borderColor: 'rgba(0, 245, 255, 0.3)',
          ...(pos.includes('t') ? { top: 0 } : { bottom: 0 }),
          ...(pos.includes('l') ? { left: 0, borderTop: pos.includes('t') ? '1px solid' : 'none', borderBottom: pos.includes('b') ? '1px solid' : 'none', borderLeft: '1px solid' } : { right: 0, borderTop: pos.includes('t') ? '1px solid' : 'none', borderBottom: pos.includes('b') ? '1px solid' : 'none', borderRight: '1px solid' }),
        }} />
      ))}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(0, 245, 255, 0.08)'
      }}>
        <span style={{ fontSize: '10px', color: '#00F5FF', fontWeight: 700, letterSpacing: '1px' }}>
          ▌ LIVE LOG STREAM
        </span>
        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>tail -f /var/log/eves.log</span>
      </div>

      <div ref={scrollRef} style={{
        fontSize: '10px',
        lineHeight: 1.7,
        height: '280px',
        overflow: 'hidden',
      }}>
        {logs.map((log) => (
          <div key={log.id} style={{
            display: 'flex',
            gap: '6px',
            animation: 'logFadeIn 0.3s ease-out',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{log.time}</span>
            <span style={{ color: levelColor(log.level), fontWeight: 700, flexShrink: 0 }}>[{log.level}]</span>
            <span style={{
              color: log.level === 'DEBUG' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>{log.msg}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ color: '#00F5FF' }}>evessys@localhost</span>
          <span style={{ color: '#666' }}>:$</span>
          <span style={{ animation: 'cursorBlink 1s step-end infinite', color: '#00F5FF' }}>▊</span>
        </div>
      </div>
    </div>
  )
}
