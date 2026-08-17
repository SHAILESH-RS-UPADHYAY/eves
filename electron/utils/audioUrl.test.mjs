// node electron/utils/audioUrl.test.mjs
import assert from 'node:assert/strict'

// keep in sync with audioUrl.ts (plain .mjs so it runs without a build step)
const audioUrl = (p) =>
  'eves-audio://local/' + p.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/')
const urlToPath = (url) => decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))

const cases = [
  'C:\\Users\\DELL\\AppData\\Roaming\\eves\\recordings\\rec-1.webm',
  'C:\\Users\\DELL\\My Recordings\\team sync #2.webm',
  '/home/shailesh/.config/eves/recordings/rec-2.webm'
]

for (const p of cases) {
  const url = audioUrl(p)
  assert.ok(!url.includes('\\'), `backslash survived: ${url}`)
  assert.ok(!url.includes(' '), `space not encoded: ${url}`)
  assert.equal(urlToPath(url), p.replace(/\\/g, '/'))
}

console.log('audioUrl: ok')
