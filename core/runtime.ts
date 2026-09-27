// The only module that names the desktop runtime package. Everything under
// core/ imports runtime APIs from here, so the rest of the codebase never has
// to spell the package out — and this list is the full surface EVES uses.
export {
  app,
  BrowserWindow,
  contextBridge,
  desktopCapturer,
  dialog,
  globalShortcut,
  ipcMain,
  ipcRenderer,
  Menu,
  nativeImage,
  net,
  protocol,
  screen,
  session,
  shell,
  Tray,
  webUtils
} from 'electron'
export type { BrowserWindowConstructorOptions, IpcRendererEvent, Rectangle, WebContents } from 'electron'

/** Dev server URL injected by the build tool; undefined in a packaged build. */
export const devServerUrl = process.env['ELECTRON_RENDERER_URL']
