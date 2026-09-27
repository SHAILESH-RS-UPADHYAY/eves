import * as path from 'path'
import { app, BrowserWindow, desktopCapturer, globalShortcut, ipcMain, Menu, protocol, screen, session, Tray, devServerUrl } from './runtime'
import type { BrowserWindowConstructorOptions, Rectangle } from './runtime'
import { registerRecorderHandlers, recoverOrphanRecordings } from './ipc/recorder.handler'
import { registerMeetingHandlers } from './ipc/meetings.handler'
import { registerDeepgramHandlers } from './ipc/deepgram.handler'
import { registerGroqHandlers } from './ipc/groq.handler'
import { registerDriveHandlers } from './ipc/drive.handler'
import { registerNotionHandlers } from './ipc/notion.handler'
import { registerSettingsHandlers } from './ipc/settings.handler'
import { registerRepoHandlers } from './ipc/repo.handler'
import { getBounds, saveBounds, migrateSettings } from './utils/store'
import { migrateLegacyMeetings } from './utils/meetings'
import { evesIcon } from './icon'
import type { DashboardRoute } from '../src/types'

let dashboardWindow: BrowserWindow | null = null
let popupWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isClickThrough = false
let isQuitting = false

const preload = path.join(__dirname, '../preload/index.js')
const alive = (w: BrowserWindow | null): w is BrowserWindow => !!w && !w.isDestroyed()

function loadPage(win: BrowserWindow, page: 'index' | 'popup') {
  const rel = page === 'popup' ? 'popup/index.html' : 'index.html'
  if (devServerUrl) win.loadURL(page === 'popup' ? `${devServerUrl}/${rel}` : devServerUrl)
  else win.loadFile(path.join(__dirname, '../renderer', rel))
}

/** Saved geometry only if it still lands on a connected display. */
function restoredBounds(key: 'windowBounds' | 'popupBounds'): Rectangle | undefined {
  const b = getBounds(key)
  if (!b) return undefined
  const visible = screen.getAllDisplays().some(({ workArea: w }) =>
    b.x < w.x + w.width && b.x + b.width > w.x && b.y < w.y + w.height && b.y + b.height > w.y)
  return visible ? b : undefined
}

function rememberBounds(win: BrowserWindow, key: 'windowBounds' | 'popupBounds') {
  const save = () => saveBounds(key, win.getBounds())
  win.on('moved', save)
  win.on('resized', save)
}

/** Closing a window only hides it — EVES lives in the tray until Alt+Q / Quit. */
function hideOnClose(win: BrowserWindow) {
  win.on('close', (e) => {
    if (isQuitting) return
    e.preventDefault()
    win.hide()
  })
}

/** Run once the page can receive IPC (immediately if it already loaded). */
function whenLoaded(win: BrowserWindow, fn: () => void) {
  if (win.webContents.isLoading()) win.webContents.once('did-finish-load', fn)
  else fn()
}

// ─── Dashboard (React app) — created on demand ─────────────
function createDashboardWindow(): BrowserWindow {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  const opts: BrowserWindowConstructorOptions = {
    width: 1400,
    height: 900,
    x: Math.floor((sw - 1400) / 2),
    y: Math.floor((sh - 900) / 2),
    ...restoredBounds('windowBounds'),
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    backgroundColor: '#050508',
    icon: evesIcon(64),
    show: false,
    webPreferences: { preload, contextIsolation: true, nodeIntegration: false, sandbox: false }
  }
  if (process.platform === 'darwin') Object.assign(opts, { titleBarStyle: 'hidden', vibrancy: 'ultra-dark', visualEffectState: 'active' })

  const win = new BrowserWindow(opts)
  loadPage(win, 'index')
  rememberBounds(win, 'windowBounds')
  hideOnClose(win)
  return win
}

function showDashboard(route?: DashboardRoute) {
  if (!alive(dashboardWindow)) dashboardWindow = createDashboardWindow()
  const win = dashboardWindow
  win.show()
  win.focus()
  if (route) whenLoaded(win, () => win.webContents.send('navigate', route))
}

function toggleDashboard() {
  if (alive(dashboardWindow) && dashboardWindow.isVisible()) dashboardWindow.hide()
  else showDashboard()
}

// ─── EVES popup (plain HTML, floating modal) ───────────────
function createPopupWindow(): BrowserWindow {
  const { width: sw } = screen.getPrimaryDisplay().workAreaSize
  const win = new BrowserWindow({
    width: 400,
    height: 584,
    x: sw - 420,
    y: 64,
    ...restoredBounds('popupBounds'),
    minWidth: 330,
    minHeight: 470,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    icon: evesIcon(64),
    webPreferences: {
      preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      // It is a recorder: timers must keep full speed while the popup is hidden.
      backgroundThrottling: false
    }
  })
  loadPage(win, 'popup')
  // Float above fullscreen Zoom / Teams / Meet and follow across desktops
  win.setAlwaysOnTop(true, 'screen-saver')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  rememberBounds(win, 'popupBounds')
  hideOnClose(win)
  return win
}

function showPopup(): BrowserWindow {
  if (!alive(popupWindow)) popupWindow = createPopupWindow()
  popupWindow.show()
  return popupWindow
}

function togglePopup() {
  if (alive(popupWindow) && popupWindow.isVisible()) popupWindow.hide()
  else showPopup()
}

/** Commands that need the recorder create it on demand (dashboard-only launch). */
function commandPopup(channel: string) {
  const win = alive(popupWindow) ? popupWindow : showPopup()
  whenLoaded(win, () => win.webContents.send(channel))
}

function setClickThrough(enabled: boolean) {
  isClickThrough = enabled
  if (!alive(popupWindow)) return
  popupWindow.setIgnoreMouseEvents(enabled, { forward: true })
  popupWindow.webContents.send('click-through-changed', enabled)
}

// ─── Global hotkeys (Alt-based — no Ctrl/Shift collisions) ──
const hotkeys: [key: string, label: string, run: () => void][] = [
  ['Alt+L', 'Start / stop listening', () => commandPopup('toggle-listening')],
  ['Alt+Backspace', 'Hide / show EVES popup', togglePopup],
  ['Alt+D', 'Show / hide dashboard', toggleDashboard],
  ['Alt+O', 'Cycle audio source', () => commandPopup('cycle-source')],
  ['Alt+T', 'Toggle click-through', () => setClickThrough(!isClickThrough)],
  ['Alt+Space', 'Stop + save session', () => alive(popupWindow) && popupWindow.webContents.send('save-session')],
  ['Alt+Q', 'Quit EVES', () => app.quit()]
]

function registerHotkeys() {
  console.log('EVES hotkeys:')
  for (const [key, label, run] of hotkeys) {
    const ok = globalShortcut.register(key, run)
    console.log(`  ${key.padEnd(14)} → ${label}${ok ? '' : '   (taken by another app)'}`)
  }
}

function createTray() {
  tray = new Tray(evesIcon(32, 2))
  tray.setToolTip('EVES — Meeting Intelligence')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Show EVES popup', click: () => showPopup() },
    { label: 'Open dashboard', click: () => showDashboard() },
    { type: 'separator' },
    { label: 'Start / stop listening', click: () => commandPopup('toggle-listening') },
    { type: 'separator' },
    { label: 'Quit EVES', click: () => app.quit() }
  ]))
  tray.on('double-click', togglePopup)
}

function registerIPC() {
  ipcMain.handle('window:minimize', () => dashboardWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (dashboardWindow?.isMaximized()) dashboardWindow.unmaximize()
    else dashboardWindow?.maximize()
  })
  ipcMain.handle('window:close', () => dashboardWindow?.hide())
  ipcMain.handle('window:showDashboard', (_e, route?: DashboardRoute) => showDashboard(route))

  ipcMain.handle('popup:launch', () => { showPopup() })
  ipcMain.handle('popup:hide', () => popupWindow?.hide())
  ipcMain.handle('popup:resize', (_e, size: { width: number; height: number }) => {
    if (!alive(popupWindow)) return
    const [minW, minH] = popupWindow.getMinimumSize()
    popupWindow.setSize(Math.max(minW, Math.round(size.width)), Math.max(minH, Math.round(size.height)))
  })
}

/** Mic + system-audio capture for both windows, set once on the shared session. */
function registerMediaPermissions() {
  const allowed = new Set(['media', 'clipboard-sanitized-write'])
  session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => cb(allowed.has(permission)))
  // getDisplayMedia → primary screen + loopback audio, no picker (video track is discarded)
  session.defaultSession.setDisplayMediaRequestHandler((_req, cb) => {
    desktopCapturer.getSources({ types: ['screen'] })
      .then(([primary]) => cb({ video: primary, audio: 'loopback' }))
      .catch(() => cb({ audio: 'loopback' }))
  })
}

// ─── Lifecycle ──────────────────────────────────────────────
// Must run before ready — lets the player stream and seek recorded audio.
protocol.registerSchemesAsPrivileged([
  { scheme: 'eves-audio', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true } }
])

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('EVES')
  migrateSettings()
  // before recovery: legacy meetings must be on disk or their audio looks orphaned
  migrateLegacyMeetings()
  registerMediaPermissions()

  registerDeepgramHandlers()
  registerGroqHandlers()
  registerDriveHandlers()
  registerNotionHandlers()
  registerSettingsHandlers()
  registerRecorderHandlers()
  registerMeetingHandlers()
  registerRepoHandlers()
  registerIPC()
  registerHotkeys()
  try { createTray() } catch (err) { console.warn('Tray unavailable:', err) }

  const dashboardOnly = process.argv.includes('--dashboard') || process.env.EVES_OPEN_DASHBOARD === '1'
  if (dashboardOnly) showDashboard()
  else showPopup()

  const recovered = recoverOrphanRecordings()
  if (recovered > 0) console.log(`Recovered ${recovered} orphaned recording(s) from a previous session`)
  console.log('EVES Core Online')
})

// Let the hide-on-close handlers know a real quit is in progress
app.on('before-quit', () => { isQuitting = true })
app.on('will-quit', () => globalShortcut.unregisterAll())
// EVES lives in the tray — closing windows must not end it
app.on('window-all-closed', () => {})
app.on('activate', () => { showPopup() })
