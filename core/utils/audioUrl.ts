// fs path <-> eves-audio:// url. Kept runtime-free so it can be tested directly.
// Per-segment encodeURIComponent, not encodeURI: '#' in a folder name would
// otherwise become a url fragment and truncate the path.

/** C:\dir\a#b.webm  ->  eves-audio://local/C%3A/dir/a%23b.webm */
export function audioUrl(p: string) {
  return 'eves-audio://local/' + p.replace(/\\/g, '/').split('/').map(encodeURIComponent).join('/')
}

/** eves-audio://local/C%3A/dir/a%23b.webm  ->  C:/dir/a#b.webm */
export function urlToPath(url: string) {
  return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
}

/**
 * HTTP Range header → inclusive byte span. `undefined` = no usable range (send
 * the whole file); `null` = unsatisfiable (416).
 */
export function byteRange(header: string | null, size: number): { start: number; end: number } | null | undefined {
  const m = header ? /bytes=(\d*)-(\d*)/.exec(header) : null
  if (!m || (!m[1] && !m[2])) return undefined
  // "bytes=-N" asks for the last N bytes
  const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]))
  const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1
  return start >= size || start > end ? null : { start, end }
}
