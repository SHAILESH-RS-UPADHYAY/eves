export const REPO = 'https://github.com/SHAILESH-RS-UPADHYAY/eves'
// ponytail: both OS buttons open the latest GitHub release (it lists the .exe and .dmg);
// publish one (npm run package → upload to a release) for the buttons to resolve
export const RELEASES = `${REPO}/releases/latest`

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
export const IOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document)
export const MOBILE = IOS || /Android|Mobi/.test(ua)
/** The desktop app ships for Windows and macOS. */
export const OS: 'Windows' | 'macOS' = /Mac/.test(ua) && !IOS ? 'macOS' : 'Windows'
export const OTHER_OS = OS === 'macOS' ? 'Windows' : 'macOS'

export type Theme = 'light' | 'dark'
export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

// Chrome/Edge/Android hand us the install prompt once; keep it for the "Install EVES" button.
type InstallEvent = Event & { prompt: () => Promise<void> }
let installEvent: InstallEvent | null = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e as InstallEvent })
}
/** true = native prompt shown; false = caller should show manual steps (iOS Safari, Firefox…). */
export async function promptInstall() {
  if (!installEvent) return false
  await installEvent.prompt()
  installEvent = null
  return true
}
