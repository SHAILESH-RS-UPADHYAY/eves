import { useState } from 'react'
import { CyberArt, type CyberVariant } from './CyberArt'

export function HackerImage({ src, alt, label, topLabel, height = '180px', variant, accent = '#22d3ee' }: {
  src?: string
  alt?: string
  label?: string
  topLabel?: string
  height?: string
  /** When set, renders self-contained animated SVG art instead of a network image. */
  variant?: CyberVariant
  accent?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div style={{
      position: 'relative',
      borderRadius: '10px',
      overflow: 'hidden',
      border: '1px solid rgba(171, 178, 191, 0.14)',
      height,
      background: '#16181d',
      cursor: 'pointer',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `${accent}66`
      e.currentTarget.style.boxShadow = `0 0 26px ${accent}22`
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(171, 178, 191, 0.14)'
      e.currentTarget.style.boxShadow = 'none'
    }}
    >
      {/* Corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map(pos => (
        <div key={pos} style={{
          position: 'absolute',
          width: '12px',
          height: '12px',
          borderColor: `${accent}99`,
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

      {/* ── Procedural animated art (preferred, always renders) ── */}
      {variant && <CyberArt variant={variant} accent={accent} />}

      {/* ── Optional network image (legacy path) ── */}
      {!variant && !error && src && (
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
            filter: 'contrast(1.15) brightness(1.0) saturate(1.25)',
          }}
        />
      )}

      {/* Loading state */}
      {!variant && !loaded && !error && src && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: `${accent}66`,
          fontSize: '10px',
          fontFamily: 'monospace'
        }}>
          LOADING...
        </div>
      )}

      {/* Atom-dark fallback (was ugly purple; now charcoal + green/cyan grid) */}
      {!variant && (error || !src) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #282c34 0%, #21252b 55%, #16181d 100%)',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(126, 231, 135, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)',
            backgroundSize: '22px 22px'
          }} />
        </div>
      )}

      {/* Subtle Atom color tint (cyan → green, no more magenta) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05) 0%, transparent 55%, rgba(126, 231, 135, 0.04) 100%)',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(171, 178, 191, 0.03) 2px, rgba(171, 178, 191, 0.01) 3px)',
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
          color: `${accent}cc`,
          letterSpacing: '1px',
          zIndex: 4,
          textShadow: `0 0 6px ${accent}55`
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
            color: accent,
            fontWeight: 700,
            textShadow: `0 0 8px ${accent}88`,
            letterSpacing: '0.5px'
          }}>
            {label}
          </div>
        </div>
      )}
    </div>
  )
}
