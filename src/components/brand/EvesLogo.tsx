/**
 * EvesLogo — original premium hacker sigil.
 * A pointy-top hex whose interior almond reads as both an EYE and an "E".
 * Pupil is a live audio equalizer (meeting intel). A scan line sweeps the hex,
 * a node orbits the rim, cyan→green→purple gradient with soft glow.
 * Fully self-contained SVG. No external assets.
 */

export function EvesLogo({
  size = 40,
  showWordmark = false,
  subtitle = false,
  animated = true,
}: {
  size?: number
  showWordmark?: boolean
  subtitle?: boolean
  animated?: boolean
}) {
  const hex = '24,3 41.18,13.5 41.18,34.5 24,45 6.82,34.5 6.82,13.5'
  const uid = 'eves' // single instance styling is fine app-wide

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: showWordmark ? '11px' : 0 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'block', flexShrink: 0 }}>
        <defs>
          <linearGradient id={`${uid}-stroke`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="52%" stopColor="#7ee787" />
            <stop offset="100%" stopColor="#c678dd" />
          </linearGradient>
          <radialGradient id={`${uid}-fill`} cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="rgba(126,231,135,0.16)" />
            <stop offset="70%" stopColor="rgba(34,211,238,0.05)" />
            <stop offset="100%" stopColor="rgba(20,22,27,0)" />
          </radialGradient>
          <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`${uid}-clip`}>
            <polygon points={hex} />
          </clipPath>
        </defs>

        {/* glass fill */}
        <polygon points={hex} fill={`url(#${uid}-fill)`} />

        {/* sweeping scan line (clipped to hex) */}
        {animated && (
          <g clipPath={`url(#${uid}-clip)`}>
            <rect x="4" width="40" height="2.2" fill="#7ee787" opacity="0.5">
              <animate attributeName="y" values="6;42;6" dur="3.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.05;0.6;0.05" dur="3.4s" repeatCount="indefinite" />
            </rect>
          </g>
        )}

        {/* rotating dashed inner ring */}
        <g style={animated ? { transformOrigin: '24px 24px', animation: 'sweep360 12s linear infinite' } : undefined}>
          <circle cx="24" cy="24" r="14.5" fill="none" stroke="#22d3ee" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.35" />
        </g>

        {/* hex frame */}
        <polygon
          points={hex}
          fill="none"
          stroke={`url(#${uid}-stroke)`}
          strokeWidth="2"
          strokeLinejoin="round"
          filter={`url(#${uid}-glow)`}
        />

        {/* EYE / "E" almond */}
        <path
          d="M12,24 Q24,14.5 36,24 Q24,33.5 12,24 Z"
          fill="none"
          stroke={`url(#${uid}-stroke)`}
          strokeWidth="1.7"
          strokeLinejoin="round"
          filter={`url(#${uid}-glow)`}
        />

        {/* equalizer pupil (meeting audio) */}
        <g filter={`url(#${uid}-glow)`}>
          {[-4, 0, 4].map((dx, i) => (
            <rect
              key={i}
              x={23 + dx - 0.9}
              y="20.5"
              width="1.8"
              height="7"
              rx="0.9"
              fill={['#22d3ee', '#7ee787', '#c678dd'][i]}
              style={animated ? {
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animation: `barEq ${0.8 + i * 0.22}s ease-in-out ${i * 0.12}s infinite`,
              } : undefined}
            />
          ))}
        </g>

        {/* orbiting node */}
        {animated && (
          <circle r="1.7" fill="#7ee787" filter={`url(#${uid}-glow)`}>
            <animateMotion dur="6s" repeatCount="indefinite" path="M24,3 41.18,13.5 41.18,34.5 24,45 6.82,34.5 6.82,13.5 Z" />
          </circle>
        )}

        {/* HUD corner ticks */}
        {[[3, 3, 1, 0, 0, 1], [45, 3, -1, 0, 0, 1], [3, 45, 1, 0, 0, -1], [45, 45, -1, 0, 0, -1]].map((t, i) => (
          <path
            key={i}
            d={`M${t[0] + t[2] * 4},${t[1]} H${t[0]} V${t[1] + t[5] * 4}`}
            stroke="rgba(34,211,238,0.5)"
            strokeWidth="1"
            fill="none"
          />
        ))}
      </svg>

      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            className="rgb-text"
            style={{
              fontFamily: '"Courier New", monospace',
              fontWeight: 800,
              fontSize: `${Math.round(size * 0.42)}px`,
              letterSpacing: '4px',
            }}
          >
            EVES
          </span>
          {subtitle && (
            <span style={{
              fontFamily: '"Courier New", monospace',
              fontSize: `${Math.max(7, Math.round(size * 0.16))}px`,
              letterSpacing: '2.5px',
              color: 'rgba(171,178,191,0.5)',
              marginTop: '3px',
            }}>
              MEETING·INTEL
            </span>
          )}
        </div>
      )}
    </div>
  )
}
