import React from 'react'

/**
 * CyberArt — 100% self-contained animated SVG cyber-art.
 * No external images, no network. Always renders. Replaces the old
 * Unsplash-image boxes that fell back to an ugly purple gradient offline.
 *
 * Atom One Dark toned. SMIL + CSS animated. Cheap enough to run 5+ at once.
 */

const C = {
  cyan: '#22d3ee',
  green: '#7ee787',
  red: '#ff5370',
  yellow: '#ffcb6b',
  orange: '#f78c6c',
  blue: '#61afef',
  purple: '#c678dd',
}

export type CyberVariant =
  | 'neural'
  | 'stealth'
  | 'waveform'
  | 'network'
  | 'circuit'
  | 'hexcore'

export function CyberArt({
  variant,
  accent = C.cyan,
  style,
}: {
  variant: CyberVariant
  accent?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', ...style }}
    >
      <defs>
        <linearGradient id="ca-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#282c34" />
          <stop offset="55%" stopColor="#21252b" />
          <stop offset="100%" stopColor="#16181d" />
        </linearGradient>
        <radialGradient id="ca-vig" cx="50%" cy="45%" r="75%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
        </radialGradient>
        <pattern id="ca-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" fill="none" stroke="rgba(171,178,191,0.06)" strokeWidth="1" />
        </pattern>
        <filter id="ca-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* base */}
      <rect width="400" height="240" fill="url(#ca-bg)" />
      <rect width="400" height="240" fill="url(#ca-grid)" />

      {variant === 'neural' && <Neural accent={accent} />}
      {variant === 'stealth' && <Stealth accent={accent} />}
      {variant === 'waveform' && <Waveform accent={accent} />}
      {variant === 'network' && <Network accent={accent} />}
      {variant === 'circuit' && <Circuit accent={accent} />}
      {variant === 'hexcore' && <Hexcore accent={accent} />}

      <rect width="400" height="240" fill="url(#ca-vig)" pointerEvents="none" />
    </svg>
  )
}

/* ══════════════════════════ NEURAL NET ══════════════════════════ */
function Neural({ accent }: { accent: string }) {
  const layers = [
    [70, 60, 120, 180],
    [160, 40, 90, 140, 200],
    [250, 55, 120, 185],
    [330, 90, 150],
  ]
  const nodes = layers.flatMap(([x, ...ys]) => ys.map((y) => ({ x, y })))
  const edges: { a: { x: number; y: number }; b: { x: number; y: number } }[] = []
  for (let l = 0; l < layers.length - 1; l++) {
    const [ax, ...ays] = layers[l]
    const [bx, ...bys] = layers[l + 1]
    ays.forEach((ay) =>
      bys.forEach((by) => edges.push({ a: { x: ax, y: ay }, b: { x: bx, y: by } })),
    )
  }
  const pulses = [
    { a: 0, b: 1, c: C.green, d: '1.8s' },
    { a: 1, b: 5, c: C.cyan, d: '2.4s' },
    { a: 3, b: 6, c: C.yellow, d: '2.1s' },
    { a: 6, b: 9, c: C.purple, d: '2.6s' },
    { a: 8, b: 11, c: C.red, d: '2.2s' },
  ]
  return (
    <g>
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.a.x}
          y1={e.a.y}
          x2={e.b.x}
          y2={e.b.y}
          stroke={accent}
          strokeWidth="0.6"
          opacity={0.14}
        />
      ))}
      {pulses.map((p, i) => (
        <circle key={i} r="2.6" fill={p.c} filter="url(#ca-soft)">
          <animateMotion
            dur={p.d}
            repeatCount="indefinite"
            path={`M${nodes[p.a].x},${nodes[p.a].y} L${nodes[p.b].x},${nodes[p.b].y}`}
          />
        </circle>
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r="6" fill={accent} opacity="0.12" filter="url(#ca-soft)" />
          <circle cx={n.x} cy={n.y} r="3" fill="#0e1116" stroke={accent} strokeWidth="1.2">
            <animate
              attributeName="opacity"
              values="0.55;1;0.55"
              dur={`${1.6 + (i % 4) * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
      <text x="16" y="26" fill={C.green} fontFamily="monospace" fontSize="9" opacity="0.7">
        neural.core
        <animate attributeName="opacity" values="0.35;0.8;0.35" dur="3s" repeatCount="indefinite" />
      </text>
    </g>
  )
}

/* ══════════════════════════ STEALTH RADAR ══════════════════════════ */
function Stealth({ accent }: { accent: string }) {
  const cx = 200
  const cy = 120
  return (
    <g>
      {[30, 60, 90, 120].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="0.8" opacity={0.18} />
      ))}
      <line x1={cx - 130} y1={cy} x2={cx + 130} y2={cy} stroke={accent} strokeWidth="0.5" opacity="0.15" />
      <line x1={cx} y1={cy - 110} x2={cx} y2={cy + 110} stroke={accent} strokeWidth="0.5" opacity="0.15" />
      {/* sweep */}
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'sweep360 4s linear infinite' }}>
        <path d={`M${cx},${cy} L${cx + 120},${cy} A120,120 0 0 1 ${cx + 84},${cy + 84} Z`} fill={accent} opacity="0.10" />
        <line x1={cx} y1={cy} x2={cx + 120} y2={cy} stroke={accent} strokeWidth="1.4" opacity="0.7" />
      </g>
      {/* blips */}
      {[
        { x: 250, y: 90, c: C.red },
        { x: 150, y: 150, c: C.yellow },
        { x: 235, y: 165, c: C.green },
      ].map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="3" fill={b.c} filter="url(#ca-soft)">
          <animate attributeName="opacity" values="0;1;0" dur="4s" begin={`${i * 1.1}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* eye core */}
      <path d={`M${cx - 26},${cy} Q${cx},${cy - 18} ${cx + 26},${cy} Q${cx},${cy + 18} ${cx - 26},${cy} Z`} fill="none" stroke={accent} strokeWidth="1.3" opacity="0.85" />
      <circle cx={cx} cy={cy} r="6" fill={accent} opacity="0.9" filter="url(#ca-soft)" />
      <circle cx={cx} cy={cy} r="2.4" fill="#0e1116" />
      <text x="16" y="26" fill={C.green} fontFamily="monospace" fontSize="9" opacity="0.7">
        scanning...
      </text>
    </g>
  )
}

/* ══════════════════════════ WAVEFORM / EQ ══════════════════════════ */
function Waveform({ accent }: { accent: string }) {
  const bars = Array.from({ length: 34 })
  return (
    <g>
      <line x1="10" y1="120" x2="390" y2="120" stroke={accent} strokeWidth="0.6" opacity="0.2" />
      {bars.map((_, i) => {
        const x = 16 + i * 11
        const cScale = i / bars.length
        const col = cScale < 0.33 ? C.green : cScale < 0.66 ? accent : C.purple
        return (
          <rect
            key={i}
            x={x}
            y="60"
            width="6"
            height="120"
            rx="2"
            fill={col}
            opacity="0.8"
            style={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              animation: `barEq ${0.7 + (i % 5) * 0.18}s ease-in-out ${i * 0.05}s infinite`,
            }}
          />
        )
      })}
      {/* playhead */}
      <line y1="40" y2="200" stroke={C.yellow} strokeWidth="1.4" opacity="0.8">
        <animate attributeName="x1" values="16;390;16" dur="6s" repeatCount="indefinite" />
        <animate attributeName="x2" values="16;390;16" dur="6s" repeatCount="indefinite" />
      </line>
      <text x="16" y="26" fill={C.green} fontFamily="monospace" fontSize="9" opacity="0.7">
        16kHz · PCM
      </text>
    </g>
  )
}

/* ══════════════════════════ NETWORK / THREAT GRAPH ══════════════════════════ */
function Network({ accent }: { accent: string }) {
  const nodes = [
    { x: 60, y: 70 },
    { x: 130, y: 150 },
    { x: 200, y: 60 },
    { x: 210, y: 170 },
    { x: 285, y: 110 },
    { x: 340, y: 60 },
    { x: 350, y: 175 },
    { x: 110, y: 40 },
  ]
  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [4, 5], [4, 6], [2, 7], [1, 4], [0, 7],
  ]
  const pk = [
    { e: 1, c: C.cyan, d: '2.2s' },
    { e: 3, c: C.green, d: '2.6s' },
    { e: 5, c: C.red, d: '1.9s' },
    { e: 8, c: C.yellow, d: '2.4s' },
  ]
  return (
    <g>
      {/* concentric scan pulse from hub */}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx="285" cy="110" r="8" fill="none" stroke={accent} strokeWidth="1">
          <animate attributeName="r" values="8;70" dur="3s" begin={`${i}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="3s" begin={`${i}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {edges.map((e, i) => (
        <line
          key={i}
          x1={nodes[e[0]].x}
          y1={nodes[e[0]].y}
          x2={nodes[e[1]].x}
          y2={nodes[e[1]].y}
          stroke={accent}
          strokeWidth="0.8"
          opacity="0.2"
        />
      ))}
      {pk.map((p, i) => {
        const e = edges[p.e]
        return (
          <circle key={i} r="2.8" fill={p.c} filter="url(#ca-soft)">
            <animateMotion
              dur={p.d}
              repeatCount="indefinite"
              path={`M${nodes[e[0]].x},${nodes[e[0]].y} L${nodes[e[1]].x},${nodes[e[1]].y}`}
            />
          </circle>
        )
      })}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={i === 4 ? 8 : 5} fill={accent} opacity="0.14" filter="url(#ca-soft)" />
          <circle cx={n.x} cy={n.y} r={i === 4 ? 4 : 2.6} fill="#0e1116" stroke={i === 4 ? C.green : accent} strokeWidth="1.2">
            <animate attributeName="opacity" values="0.6;1;0.6" dur={`${1.8 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      <text x="16" y="26" fill={C.green} fontFamily="monospace" fontSize="9" opacity="0.75">
        net.trace · 8 hops
      </text>
    </g>
  )
}

/* ══════════════════════════ CIRCUIT / PCB ══════════════════════════ */
function Circuit({ accent }: { accent: string }) {
  const traces = [
    'M20,40 H120 V90 H200',
    'M20,120 H80 V180 H180',
    'M380,60 H300 V120 H230',
    'M380,150 H320 V60 H260',
    'M40,200 H160 V150 H260 V110',
  ]
  const pads = [
    { x: 200, y: 90 }, { x: 180, y: 180 }, { x: 230, y: 120 },
    { x: 260, y: 60 }, { x: 260, y: 110 }, { x: 20, y: 40 }, { x: 380, y: 150 },
  ]
  return (
    <g>
      {traces.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke={accent} strokeWidth="1.4" opacity="0.28" />
          <path
            d={d}
            fill="none"
            stroke={i % 2 ? C.green : accent}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="6 180"
            opacity="0.9"
            style={{ animation: `dashFlow ${4 + i}s linear infinite` }}
          />
        </g>
      ))}
      {pads.map((p, i) => (
        <g key={i}>
          <rect x={p.x - 4} y={p.y - 4} width="8" height="8" rx="1.5" fill="#0e1116" stroke={accent} strokeWidth="1.2" opacity="0.8" />
          <circle cx={p.x} cy={p.y} r="1.6" fill={accent}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur={`${1.5 + (i % 3) * 0.6}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      {/* IC chip */}
      <rect x="150" y="95" width="70" height="50" rx="4" fill="#1a1d23" stroke={accent} strokeWidth="1.2" opacity="0.85" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={158 + i * 18} y1="95" x2={158 + i * 18} y2="88" stroke={accent} strokeWidth="1.4" opacity="0.6" />
      ))}
      <text x="163" y="124" fill={C.green} fontFamily="monospace" fontSize="8" opacity="0.8">GRQ-70B</text>
      <text x="16" y="26" fill={C.green} fontFamily="monospace" fontSize="9" opacity="0.7">soc.inference</text>
    </g>
  )
}

/* ══════════════════════════ HEX CORE ══════════════════════════ */
function Hexcore({ accent }: { accent: string }) {
  const cx = 200
  const cy = 120
  const hex = (r: number) =>
    Array.from({ length: 6 })
      .map((_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
      })
      .join(' ')
  return (
    <g>
      {[95, 70, 45].map((r, i) => (
        <polygon
          key={i}
          points={hex(r)}
          fill="none"
          stroke={i === 1 ? C.purple : accent}
          strokeWidth="1.1"
          opacity={0.25 + i * 0.12}
          style={{ transformOrigin: `${cx}px ${cy}px`, animation: `sweep360 ${16 - i * 4}s linear ${i % 2 ? 'reverse' : 'normal'} infinite` }}
        />
      ))}
      {/* orbiting dots */}
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'sweep360 6s linear infinite' }}>
        {[0, 120, 240].map((deg, i) => {
          const a = (deg * Math.PI) / 180
          return (
            <circle key={i} cx={cx + 70 * Math.cos(a)} cy={cy + 70 * Math.sin(a)} r="3.2" fill={[C.green, C.cyan, C.yellow][i]} filter="url(#ca-soft)" />
          )
        })}
      </g>
      <circle cx={cx} cy={cy} r="16" fill={accent} opacity="0.14" filter="url(#ca-soft)" />
      <circle cx={cx} cy={cy} r="7" fill="#0e1116" stroke={accent} strokeWidth="1.6">
        <animate attributeName="r" values="6;8.5;6" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x="16" y="26" fill={C.green} fontFamily="monospace" fontSize="9" opacity="0.7">core.sync</text>
    </g>
  )
}
