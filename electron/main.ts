import { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, desktopCapturer, screen, nativeImage, protocol } from 'electron'
import * as path from 'path'
import { registerRecorderHandlers, sessionToMeeting, saveMeeting, recoverOrphanRecordings } from './ipc/recorder.handler'
import { registerDeepgramHandlers } from './ipc/deepgram.handler'
import { registerGroqHandlers } from './ipc/groq.handler'
import { registerDriveHandlers } from './ipc/drive.handler'
import { registerNotionHandlers } from './ipc/notion.handler'
import { registerSettingsHandlers } from './ipc/settings.handler'
import { registerRepoHandlers } from './ipc/repo.handler'
import { setStealth } from './utils/stealth'
import { getWindowBounds, saveWindowBounds, getSettings, migrateSettings } from './utils/store'

// ─── Window references ──────────────────────────────────────
let dashboardWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let tray: Tray | null = null

// ─── State ──────────────────────────────────────────────────
let isOverlayVisible = true
let isClickThrough = false
let isStealthActive = false
let isListening = false
let isQuitting = false
const sources = ['internal', 'external', 'both'] as const
let currentSource: (typeof sources)[number] = 'internal'

// ─── Dashboard Window (React app, heavy) ────────────────────
function createDashboardWindow(): BrowserWindow {
  const savedBounds = getWindowBounds()
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  const opts: Electron.BrowserWindowConstructorOptions = {
    width: savedBounds?.width ?? 1400,
    height: savedBounds?.height ?? 900,
    x: savedBounds?.x ?? Math.floor((sw - 1400) / 2),
    y: savedBounds?.y ?? Math.floor((sh - 900) / 2),
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    backgroundColor: '#050508',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  }

  if (process.platform === 'darwin') {
    opts.titleBarStyle = 'hidden'
    ;(opts as any).vibrancy = 'ultra-dark'
    ;(opts as any).visualEffectState = 'active'
  }

  const win = new BrowserWindow(opts)

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Closing the dashboard hides it — EVES keeps listening from the overlay
  win.on('close', (e) => {
    const b = win.getBounds()
    saveWindowBounds({ x: b.x, y: b.y, width: b.width, height: b.height })
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  if (process.platform !== 'linux') win.setContentProtection(false)

  return win
}

/** Dashboard is created on demand — startup shows the overlay only. */
function ensureDashboard(): BrowserWindow {
  if (!dashboardWindow || dashboardWindow.isDestroyed()) {
    dashboardWindow = createDashboardWindow()
  }
  return dashboardWindow
}

function showDashboard() {
  const win = ensureDashboard()
  win.show()
  win.focus()
}

// ─── Overlay Window (lightweight, plain HTML, stealth) ──────
function createOverlayWindow(): BrowserWindow {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: 360,
    height: 460,
    minWidth: 260,
    minHeight: 320,
    x: sw - 380,
    y: 80,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    focusable: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Auto-approve media permissions
  win.webContents.session.setPermissionRequestHandler((wc, permission, callback) => {
    if (permission === 'media') callback(true)
    else callback(false)
  })

  // Auto-approve display media with loopback (internal system audio)
  win.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' })
    }).catch(() => {
      callback({ video: null, audio: 'loopback' })
    })
  })

  // Load overlay HTML
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/overlay/index.html')
  } else {
    win.loadFile(path.join(__dirname, '../renderer/overlay/index.html'))
  }

  win.setSkipTaskbar(true)
  // Float above fullscreen Zoom/Teams, and follow across desktops
  win.setAlwaysOnTop(true, 'screen-saver')
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  win.on('close', (e) => {
    if (isQuitting) return
    e.preventDefault()
    win.hide()
    isOverlayVisible = false
  })

  if (process.platform !== 'linux') win.setContentProtection(false)

  return win
}

// ─── Click-Through Toggle ───────────────────────────────────
function setClickThrough(enabled: boolean) {
  isClickThrough = enabled
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.setIgnoreMouseEvents(enabled, { forward: true })
    overlayWindow.webContents.send('click-through-changed', enabled)
  }
}

// ─── Stealth Toggle (Disabled to ensure visibility during screen share) ───
function toggleStealth() {
  isStealthActive = false
  if (process.platform !== 'linux') {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setContentProtection(false)
    }
    if (dashboardWindow && !dashboardWindow.isDestroyed()) {
      dashboardWindow.setContentProtection(false)
    }
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('stealth-changed', false)
  }
}

// ─── Global Hotkeys (different from Acemate) ────────────────
function registerHotkeys() {
  // Ctrl+Shift+L — Start / Stop listening
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    isListening = !isListening
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('toggle-listening', isListening)
    }
    console.log(`Listening: ${isListening ? 'ON' : 'OFF'}`)
  })

  // Ctrl+Shift+A — Hide overlay (keeps listening)
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    if (isOverlayVisible) {
      overlayWindow?.hide()
      isOverlayVisible = false
    } else {
      overlayWindow?.show()
      isOverlayVisible = true
    }
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('visibility-changed', isOverlayVisible)
    }
  })

  // Ctrl+Shift+O — Toggle audio source (internal / external)
  globalShortcut.register('CommandOrControl+Shift+O', () => {
    currentSource = sources[(sources.indexOf(currentSource) + 1) % sources.length]
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('source-changed', currentSource)
    }
    console.log(`Source: ${currentSource}`)
  })

  // Ctrl+Shift+T — Toggle click-through
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    setClickThrough(!isClickThrough)
    console.log(`Click-through: ${isClickThrough ? 'ON' : 'OFF'}`)
  })

  // Ctrl+Shift+D — Show / hide dashboard (created on first use)
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (dashboardWindow && !dashboardWindow.isDestroyed() && dashboardWindow.isVisible()) {
      dashboardWindow.hide()
    } else {
      showDashboard()
    }
  })

  // Ctrl+Shift+S — Toggle stealth
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    toggleStealth()
    console.log(`Stealth: ${isStealthActive ? 'ON' : 'OFF'}`)
  })

  // Ctrl+Space — Save session to history
  globalShortcut.register('CommandOrControl+Space', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send('save-session')
    }
    console.log('Session saved')
  })

  // Ctrl+Shift+X — Quit EVES
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    console.log('Quitting EVES...')
    app.quit()
  })

  console.log('Hotkeys registered:')
  console.log('  Ctrl+Shift+L  → Start/Stop listening')
  console.log('  Ctrl+Shift+A  → Hide/Show overlay')
  console.log('  Ctrl+Shift+O  → Toggle audio source')
  console.log('  Ctrl+Shift+T  → Toggle click-through')
  console.log('  Ctrl+Shift+D  → Show/Hide dashboard')
  console.log('  Ctrl+Space    → Save session')
  console.log('  Ctrl+Shift+X  → Quit')
}

// ─── Tray ───────────────────────────────────────────────────
function createTray() {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Overlay',
      click: () => { overlayWindow?.show(); isOverlayVisible = true }
    },
    {
      label: 'Show Dashboard',
      click: () => showDashboard()
    },
    { type: 'separator' },
    {
      label: 'Toggle Listening',
      click: () => {
        isListening = !isListening
        overlayWindow?.webContents.send('toggle-listening', isListening)
      }
    },
    {
      label: 'Toggle Stealth',
      click: () => toggleStealth()
    },
    { type: 'separator' },
    {
      label: 'Quit EVES',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('EVES — Meeting Intelligence')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    if (isOverlayVisible) {
      overlayWindow?.hide()
      isOverlayVisible = false
    } else {
      overlayWindow?.show()
      isOverlayVisible = true
    }
  })
}

// ─── IPC Handlers ───────────────────────────────────────────
function registerIPC() {
  // Window controls (from dashboard)
  ipcMain.handle('window:minimize', () => dashboardWindow?.minimize())
  ipcMain.handle('window:maximize', () => {
    if (dashboardWindow?.isMaximized()) dashboardWindow.unmaximize()
    else dashboardWindow?.maximize()
  })
  ipcMain.handle('window:close', () => dashboardWindow?.hide())
  ipcMain.handle('window:showDashboard', () => showDashboard())

  // Stealth (disabled so windows remain visible during screen shares)
  ipcMain.handle('stealth:toggle', (_e, _enable: boolean) => {
    isStealthActive = false
    if (process.platform !== 'linux') {
      overlayWindow?.setContentProtection(false)
      dashboardWindow?.setContentProtection(false)
    }
    return { supported: process.platform !== 'linux', active: false }
  })
  ipcMain.handle('stealth:status', () => ({
    supported: process.platform !== 'linux',
    active: false
  }))

  // Launch overlay from dashboard
  ipcMain.handle('overlay:launch', () => {
    if (!overlayWindow || overlayWindow.isDestroyed()) {
      overlayWindow = createOverlayWindow()
    } else {
      overlayWindow.show()
      isOverlayVisible = true
    }
    return { success: true }
  })

  // Overlay → disk (always) → dashboard (only if it happens to be open)
  ipcMain.handle('overlay:save-session', (_e, session) => {
    const meeting = sessionToMeeting(session)
    saveMeeting(meeting)
    if (dashboardWindow && !dashboardWindow.isDestroyed()) {
      dashboardWindow.webContents.send('session-saved', meeting)
    }
    return { success: true }
  })
}

// ─── App Lifecycle ──────────────────────────────────────────
// Must run before ready — lets wavesurfer fetch/seek recorded audio.
protocol.registerSchemesAsPrivileged([
  { scheme: 'eves-audio', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true } }
])

app.whenReady().then(() => {
  migrateSettings()

  // Always keep windows visible during screen share
  isStealthActive = false

  // Check if dashboard should be opened directly
  const openDashboardDirectly = process.argv.includes('--dashboard') || process.env.EVES_OPEN_DASHBOARD === '1'

  // Initialize overlay window
  overlayWindow = createOverlayWindow()

  // Open dashboard immediately if requested
  if (openDashboardDirectly) {
    showDashboard()
  }

  // Register all handlers
  registerDeepgramHandlers()
  registerGroqHandlers()
  registerDriveHandlers()
  registerNotionHandlers()
  registerSettingsHandlers()
  registerRecorderHandlers()
  registerRepoHandlers()
  registerIPC()
  registerHotkeys()

  // Tray
  try { createTray() } catch {}

  const recovered = recoverOrphanRecordings()
  if (recovered > 0) console.log(`Recovered ${recovered} orphaned recording(s) from a previous session`)

  console.log('EVES started')
  console.log('Ctrl+Shift+L to listen  |  Ctrl+Shift+D for dashboard')
})

// Let the hide-on-close handlers know a real quit is in progress
app.on('before-quit', () => { isQuitting = true })

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// Overlay lives in the tray — closing windows must not kill EVES
app.on('window-all-closed', () => {})

app.on('activate', () => {
  if (!overlayWindow || overlayWindow.isDestroyed()) overlayWindow = createOverlayWindow()
  else overlayWindow.show()
})
