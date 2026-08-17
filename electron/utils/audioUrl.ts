// fs path <-> eves-audio:// url. Kept electron-free so it can be tested directly.
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
