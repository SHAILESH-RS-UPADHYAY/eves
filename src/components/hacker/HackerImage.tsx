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
            opacity: loaded ? 0.6 : 0,
            transition: 'opacity 0.5s ease, transform 0.5s ease',
            filter: 'contrast(1.1) brightness(0.8) saturate(1.2)',
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

      {/* Error fallback - CSS gradient art */}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #0a0a14 100%)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
        </div>
      )}

      {/* Cyan overlay tint */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(0, 245, 255, 0.05) 0%, transparent 30%, rgba(0, 0, 0, 0.6) 100%)',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Scanlines on image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 245, 255, 0.03) 3px, rgba(0, 245, 255, 0.03) 4px)',
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
