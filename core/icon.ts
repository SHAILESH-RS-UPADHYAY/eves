import { nativeImage } from './runtime'

// The EVES sigil (pointy-top hex ring, cyan → green → purple, glowing core)
// rasterised in code so the tray and taskbar never fall back to a stock icon.
const STOPS = [[0x22, 0xd3, 0xee], [0x7e, 0xe7, 0x87], [0xc6, 0x78, 0xdd]]

/** Signed distance to a pointy-top hexagon with apothem r (iq's hex SDF, axes swapped). */
function hexDistance(px: number, py: number, r: number) {
  let x = Math.abs(py), y = Math.abs(px)
  const d = 2 * Math.min(-0.866025404 * x + 0.5 * y, 0)
  x += d * 0.866025404
  y -= d * 0.5
  x -= Math.max(-0.577350269 * r, Math.min(0.577350269 * r, x))
  y -= r
  return Math.hypot(x, y) * Math.sign(y)
}

function gradient(t: number) {
  const i = t < 0.5 ? 0 : 1
  const f = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f))
}

export function evesIcon(size: number, scaleFactor = 1) {
  const px = Buffer.alloc(size * size * 4)
  const c = size / 2
  const ring = size * 0.06
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5 - c) / size, dy = (y + 0.5 - c) / size
      const edge = Math.abs(hexDistance(dx, dy, 0.38)) * size
      const ringA = Math.max(0, Math.min(1, ring - edge + 0.5))
      const glowA = Math.max(0, 0.28 - edge / (size * 0.35))
      const core = Math.hypot(dx, dy) * size
      const coreA = Math.max(0, Math.min(1, size * 0.11 - core + 0.5))
      const a = Math.min(1, Math.max(ringA, glowA, coreA))
      if (a <= 0) continue
      const [r, g, b] = coreA > ringA ? STOPS[1] : gradient((dx + dy + 1) / 2)
      const o = (y * size + x) * 4
      // BGRA, premultiplied
      px[o] = Math.round(b * a)
      px[o + 1] = Math.round(g * a)
      px[o + 2] = Math.round(r * a)
      px[o + 3] = Math.round(a * 255)
    }
  }
  return nativeImage.createFromBitmap(px, { width: size, height: size, scaleFactor })
}
