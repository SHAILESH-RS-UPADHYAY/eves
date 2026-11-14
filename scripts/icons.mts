// Writes the EVES mark as PNGs: installer icon (resources/) + PWA icons (website/public/). Run: node scripts/icons.mts
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync, crc32 } from 'node:zlib'
import { evesMarkRGBA } from '../core/utils/evesMark.ts'

function png(size: number) {
  const px = evesMarkRGBA(size)
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  const chunk = (type: string, data: Buffer) => {
    const t = Buffer.concat([Buffer.from(type), data])
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(t))
    return Buffer.concat([len, t, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

mkdirSync('resources', { recursive: true })
writeFileSync('resources/icon.png', png(512))
for (const s of [192, 512]) writeFileSync(`website/public/icon-${s}.png`, png(s))
writeFileSync('website/public/apple-touch-icon.png', png(180))
