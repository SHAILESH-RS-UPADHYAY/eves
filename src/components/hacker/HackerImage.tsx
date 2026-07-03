import { useState } from 'react'

export function HackerImage({ src, alt, label, topLabel, height = '180px' }: {
  src: string
  alt: string
  label?: string
  topLabel?: string
  height?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div style={{
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid rgba(0, 245, 255, 0.15)',
      height,
      background: 'rgba(0, 0, 0, 0.6)',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.4)'
      e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 245, 255, 0.15)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.15)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      {/* Corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <div key={pos} style={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          borderColor: 'rgba(0, 245, 255, 0.5)',
          zIndex: 5,
          ...(pos.includes('t') ? { top: '4px' } : { bottom: '4px' }),
          ...(pos.includes('l') ? {
            left: '4px',
            borderTop: pos.includes('t') ? '2px solid' : 'none',
            borderBottom: pos.includes('b') ? '2px solid' : 'none',
            borderLeft: '2px solid'
          } : {
            right: '4px',
            borderTop: pos.includes('t') ? '2px solid' : 'none',
            borderBottom: pos.includes('b') ? '2px solid' : 'none',
            borderRight: '2px solid'
          }),
        }} />
      ))}

      {/* Image */}
      {!error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 0.85 : 0,
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            filter: 'contrast(1.2) brightness(1.0) saturate(1.4) hue-rotate(10deg)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        />
      )}

      {/* Loading state */}
      {!loaded && !error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0, 245, 255, 0.3)',
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          LOADING...
        </div>
      )}

      {/* Error fallback - cyberpunk grid */}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0a0a14 0%, #1a0033 30%, #0a1a0a 60%, #0a0a14 100%)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(0, 245, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 110, 0.06) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(0, 245, 255, 0.06) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(255, 0, 110, 0.05) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 50%)',
          }} />
        </div>
      )}

      {/* Hacker color overlay tint (cyan → magenta → yellow gradient) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.08) 0%, rgba(255, 0, 110, 0.05) 50%, rgba(245, 158, 11, 0.05) 100%)',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Scanlines on image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 245, 255, 0.025) 2px, rgba(245, 158, 11, 0.01) 3px)',
        pointerEvents: 'none',
        zIndex: 3
      }} />

      {/* Top label */}
      {topLabel && (
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '20px',
          fontSize: '8px',
          fontFamily: '"Courier New", monospace',
          color: 'rgba(0, 245, 255, 0.6)',
          letterSpacing: '1px',
          zIndex: 4
        }}>
          {topLabel}
        </div>
      )}

      {/* Bottom label */}
      {label && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          right: '12px',
          zIndex: 4
        }}>
          <div style={{
            fontSize: '11px',
            fontFamily: '"Courier New", monospace',
            color: '#00F5FF',
            fontWeight: 700,
            textShadow: '0 0 8px rgba(0, 245, 255, 0.5)',
            letterSpacing: '0.5px'
          }}>
            {label}
          </div>
        </div>
      )}
    </div>
  )
}
