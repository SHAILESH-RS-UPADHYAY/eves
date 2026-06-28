import { useEffect, useState, useRef } from 'react'

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  const points = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '24px' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
      <polyline points={`${points} 100,100 0,100`} fill={color} opacity="0.08" />
    </svg>
  )
}

function StatBar({ label, value, max = 100, color, unit }: {
  label: string
  value: number
  max?: number
  color: string
  unit?: string
}) {
  const pct = (value / max) * 100
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: '9px', color, fontFamily: 'monospace', fontWeight: 700 }}>{Math.round(value)}{unit || '%'}</span>
      </div>
      <div style={{
        height: '4px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: '2px',
          transition: 'width 0.8s ease',
          boxShadow: `0 0 8px ${color}66`
        }} />
      </div>
    </div>
  )
}

export function SystemStatus() {
  const [stats, setStats] = useState({
    cpu: 23,
    mem: 48,
    net: 12,
    latency: 42,
    audio: 0,
  })
  const [history, setHistory] = useState<{
    cpu: number[]
    net: number[]
    audio: number[]
  }>({
    cpu: Array(30).fill(20),
    net: Array(30).fill(10),
    audio: Array(30).fill(0),
  })
  const audioRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const newCpu = clamp(prev.cpu + (Math.random() - 0.45) * 12, 5, 95)
        const newNet = clamp(prev.net + (Math.random() - 0.45) * 20, 0, 100)
        const newAudio = Math.random() * 80
        const newLatency = clamp(prev.latency + (Math.random() - 0.5) * 15, 20, 90)
        const newMem = clamp(prev.mem + (Math.random() - 0.5) * 3, 30, 75)

        audioRef.current = newAudio

        setHistory(h => ({
          cpu: [...h.cpu.slice(1), newCpu],
          net: [...h.net.slice(1), newNet],
          audio: [...h.audio.slice(1), newAudio],
        }))

        return { cpu: newCpu, mem: newMem, net: newNet, latency: newLatency, audio: newAudio }
      })
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(0, 245, 255, 0.12)',
      borderRadius: '8px',
      padding: '14px',
      fontFamily: '"Courier New", monospace',
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
        marginBottom: '14px',
        paddingBottom: '8px',
        borderBottom: '1px solid rgba(0, 245, 255, 0.08)'
      }}>
        <span style={{ fontSize: '10px', color: '#00F5FF', fontWeight: 700, letterSpacing: '1px' }}>
          ▌ SYSTEM STATUS
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 6px #10B981',
            animation: 'pulseDot 1.5s ease-in-out infinite'
          }} />
          <span style={{ fontSize: '8px', color: '#10B981', fontWeight: 600 }}>ONLINE</span>
        </div>
      </div>

      <StatBar label="CPU USAGE" value={stats.cpu} color="#00F5FF" />
      <div style={{ marginBottom: '8px' }}><Sparkline values={history.cpu} color="#00F5FF" /></div>

      <StatBar label="MEMORY" value={stats.mem} color="#A78BFA" />
      <div style={{ marginBottom: '8px' }}><Sparkline values={history.net} color="#A78BFA" /></div>

      <StatBar label="NETWORK I/O" value={stats.net} color="#F59E0B" />
      <StatBar label="LATENCY" value={stats.latency} max={100} color="#F43F5E" unit="ms" />

      {/* Audio equalizer */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>AUDIO INPUT</span>
          <span style={{ fontSize: '9px', color: '#10B981', fontFamily: 'monospace', fontWeight: 700 }}>{Math.round(stats.audio)}dB</span>
        </div>
        <div style={{ display: 'flex', gap: '2px', height: '20px', alignItems: 'flex-end' }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const h = Math.max(2, (history.audio[(i + history.audio.length - 24) % history.audio.length] || 0) * 0.25)
            return (
              <div key={i} style={{
                flex: 1,
                height: `${h}px`,
                background: `linear-gradient(180deg, #10B981, #10B98144)`,
                borderRadius: '1px',
                transition: 'height 0.3s ease',
                boxShadow: h > 10 ? '0 0 4px #10B98166' : 'none'
              }} />
            )
          })}
        </div>
      </div>
    </div>
  )
}
