// The EVES mark (same as shailesh-ai.codes): one cyan stroke — speech decays into a waiting cursor —
// on a dark rounded tile. Pure pixels so the app icon, tray and installer PNG all share one drawing.
type P = [number, number]

const CY = [0x22, 0xd3, 0xee]
const BG = [0x0c, 0x0d, 0x10]

// 24-unit grid path: M2.5 12 C4 4.4 5.9 4.4 7.4 12 C8.5 17.2 9.9 17.2 11 12 C11.7 9.2 12.7 9.2 13.4 12 H15.2
const CURVES: P[][] = [
  [[2.5, 12], [4, 4.4], [5.9, 4.4], [7.4, 12]],
  [[7.4, 12], [8.5, 17.2], [9.9, 17.2], [11, 12]],
  [[11, 12], [11.7, 9.2], [12.7, 9.2], [13.4, 12]],
]
const PTS: P[] = [[2.5, 12]]
for (const [a, b, c, d] of CURVES) {
  for (let i = 1; i <= 24; i++) {
    const t = i / 24, u = 1 - t
    PTS.push([
      u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
      u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ])
  }
}
PTS.push([15.2, 12])

function segDist(x: number, y: number, [ax, ay]: P, [bx, by]: P) {
  const dx = bx - ax, dy = by - ay
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - ax - t * dx, y - ay - t * dy)
}

/** Rounded-box signed distance (centre cx,cy; half sizes hx,hy; corner r). */
function boxDist(x: number, y: number, cx: number, cy: number, hx: number, hy: number, r: number) {
  const qx = Math.abs(x - cx) - hx + r, qy = Math.abs(y - cy) - hy + r
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r
}

const clamp = (v: number) => Math.max(0, Math.min(1, v))

/** Straight (non-premultiplied) RGBA pixels, size×size. */
export function evesMarkRGBA(size: number): Buffer {
  const out = Buffer.alloc(size * size * 4)
  const unit = (size * 0.78) / 24 // px per grid unit; glyph spans ~18 units, centred below
  const ox = (size - 18 * unit) / 2 - 2.5 * unit
  const oy = size / 2 - 12 * unit
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gx = (x + 0.5 - ox) / unit, gy = (y + 0.5 - oy) / unit
      let d = Infinity
      for (let i = 1; i < PTS.length; i++) d = Math.min(d, segDist(gx, gy, PTS[i - 1], PTS[i]))
      d = Math.min(d - 1.05, boxDist(gx, gy, 18.8, 12, 1.6, 5.5, 0.5)) // stroke half-width 1.05, cursor rect
      const ink = clamp(0.5 - d * unit)
      const glow = Math.max(0, 0.45 - (Math.max(d, 0) * unit) / (size * 0.09))
      const tile = clamp(0.5 - boxDist(x + 0.5, y + 0.5, size / 2, size / 2, size / 2, size / 2, size * 0.25))
      const rim = clamp(1 - Math.abs(boxDist(x + 0.5, y + 0.5, size / 2, size / 2, size / 2 - 0.5, size / 2 - 0.5, size * 0.25))) * 0.25
      const m = Math.min(1, Math.max(ink, glow, rim))
      const o = (y * size + x) * 4
      for (let k = 0; k < 3; k++) out[o + k] = Math.round(BG[k] + (CY[k] - BG[k]) * m)
      out[o + 3] = Math.round(tile * 255)
    }
  }
  return out
}
