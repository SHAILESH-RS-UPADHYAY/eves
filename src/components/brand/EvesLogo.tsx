/**
 * EvesLogo — the EVES mark (same as shailesh-ai.codes): one cyan stroke,
 * speech decaying into a waiting cursor. Self-contained SVG, soft neon glow.
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
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: showWordmark ? '11px' : 0 }}>
      <svg width={size} height={size} viewBox="-1.1 0 24 24" style={{ display: 'block', flexShrink: 0 }}
        fill="none" stroke="#22d3ee" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <filter id="eves-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g filter="url(#eves-glow)">
          <path strokeWidth="2.1" pathLength={1} strokeDasharray="1" d="M2.5 12C4 4.4 5.9 4.4 7.4 12C8.5 17.2 9.9 17.2 11 12C11.7 9.2 12.7 9.2 13.4 12H15.2">
            {animated && <animate attributeName="stroke-dashoffset" values="1;0;0" keyTimes="0;0.35;1" dur="4s" repeatCount="indefinite" />}
          </path>
          <rect x="17.2" y="6.5" width="3.2" height="11" rx="0.5" fill="#22d3ee" stroke="none">
            {animated && <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" repeatCount="indefinite" />}
          </rect>
        </g>
      </svg>

      {showWordmark && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span className="eves-word" style={{ fontSize: `${Math.round(size * 0.5)}px`, color: '#e6edf3', textShadow: '0 0 10px rgba(34,211,238,0.35)' }}>
            {'EVES'.split('').map((c, i) => <span key={i} className="ew" style={{ ['--i' as string]: i }}>{c}</span>)}
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
