import { nativeImage } from './runtime'
import { evesMarkRGBA } from './utils/evesMark'

// Rasterised in code so the tray and taskbar never fall back to a stock icon.
export function evesIcon(size: number, scaleFactor = 1) {
  const px = size // bitmap pixels; scaleFactor only tells Electron its DPI
  const rgba = evesMarkRGBA(px)
  const bgra = Buffer.alloc(rgba.length)
  for (let o = 0; o < rgba.length; o += 4) {
    const a = rgba[o + 3] / 255 // BGRA, premultiplied
    bgra[o] = Math.round(rgba[o + 2] * a)
    bgra[o + 1] = Math.round(rgba[o + 1] * a)
    bgra[o + 2] = Math.round(rgba[o] * a)
    bgra[o + 3] = rgba[o + 3]
  }
  return nativeImage.createFromBitmap(bgra, { width: px, height: px, scaleFactor })
}
