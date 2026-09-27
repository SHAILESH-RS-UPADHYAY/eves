import type { PathStyle } from '../types'

/** C:\Users\x → /mnt/c/Users/x (WSL) or back-slashed (Windows). Non-drive paths pass through. */
export function stylePath(p: string, style: PathStyle) {
  const drive = /^([A-Za-z]):[\\/]?(.*)$/.exec(p)
  if (style === 'wsl') return drive ? `/mnt/${drive[1].toLowerCase()}/${drive[2].replace(/\\/g, '/')}`.replace(/\/+$/, '') : p
  return drive ? p.replace(/\//g, '\\') : p
}
