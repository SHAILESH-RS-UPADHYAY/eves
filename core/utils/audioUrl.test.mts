// node core/utils/audioUrl.test.mts  (Node ≥ 22.18 runs TypeScript directly)
import assert from 'node:assert/strict'
import { audioUrl, byteRange, urlToPath } from './audioUrl.ts'

for (const p of [
  'C:\\Users\\DELL\\AppData\\Roaming\\eves\\recordings\\rec-1.webm',
  'C:\\Users\\DELL\\My Recordings\\team sync #2.webm',
  '/home/shailesh/.config/eves/recordings/rec-2.webm'
]) {
  const url = audioUrl(p)
  assert.ok(!url.includes('\\'), `backslash survived: ${url}`)
  assert.ok(!url.includes(' '), `space not encoded: ${url}`)
  assert.equal(urlToPath(url), p.replace(/\\/g, '/'))
}

assert.equal(byteRange(null, 100), undefined)
assert.equal(byteRange('bytes=-', 100), undefined)
assert.deepEqual(byteRange('bytes=0-', 100), { start: 0, end: 99 })
assert.deepEqual(byteRange('bytes=10-19', 100), { start: 10, end: 19 })
assert.deepEqual(byteRange('bytes=90-500', 100), { start: 90, end: 99 })
assert.deepEqual(byteRange('bytes=-10', 100), { start: 90, end: 99 })
assert.deepEqual(byteRange('bytes=-500', 100), { start: 0, end: 99 })
assert.equal(byteRange('bytes=100-', 100), null)
assert.equal(byteRange('bytes=50-40', 100), null)

console.log('audioUrl: ok')
