import { useEffect, useState } from 'react'

interface Blip {
  id: number
  x: number
  y: number
  born: number
}

export function RadarSweep() {
  const [blips, setBlips] = useState<Blip[]>([])

  useEffect(() => {
    let id = 0
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const angle = Math.random() * Math.PI * 2
        const dist = 20 + Math.random() * 60
        setBlips(prev => [...prev.slice(-5), {
          id: id++,
          x: 50 + Math.cos(angle) * dist,
          y: 50 + Math.sin(angle) * dist,
          born: Date.now()
        }])
      }
    }, 1500)
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
        fontSize: '10px',
        color: '#00F5FF',
        fontWeight: 700,
        letterSpacing: '1px',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(0, 245, 255, 0.08)'
      }}>
        ▌ AUDIO RADAR
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1',
        margin: '0 auto'
      }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {/* Range rings */}
          {[20, 40, 60, 80].map(r => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(0, 245, 255, 0.08)" strokeWidth="0.5" />
          ))}
          {/* Crosshair */}
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0, 245, 255, 0.08)" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0, 245, 255, 0.08)" strokeWidth="0.5" />
          {/* Center dot */}
          <circle cx="50" cy="50" r="1.5" fill="#00F5FF" />

          {/* Sweep line */}
          <g style={{ transformOrigin: '50px 50px', animation: 'radarSweep 4s linear infinite' }}>
            <defs>
              <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(0, 245, 255, 0)" />
                <stop offset="100%" stopColor="rgba(0, 245, 255, 0.4)" />
              </linearGradient>
            </defs>
            <path d="M50,50 L100,50 A50,50 0 0,0 85,15 Z" fill="url(#sweepGrad)" />
            <line x1="50" y1="50" x2="100" y2="50" stroke="rgba(0, 245, 255, 0.5)" strokeWidth="0.5" />
          </g>

          {/* Blips */}
          {blips.map(blip => {
            const age = (Date.now() - blip.born) / 4000
            if (age > 1) return null
            return (
              <circle
                key={blip.id}
                cx={blip.x}
                cy={blip.y}
                r={2}
                fill="#10B981"
                opacity={1 - age}
                style={{ filter: 'drop-shadow(0 0 3px #10B981)' }}
              />
            )
          })}
        </svg>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
        fontSize: '8px',
        color: 'rgba(255,255,255,0.3)'
      }}>
        <span>RANGE: 50m</span>
        <span>CONTACTS: {blips.filter(b => Date.now() - b.born < 4000).length}</span>
      </div>
    </div>
  )
}
