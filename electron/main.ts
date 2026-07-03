import { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, desktopCapturer, screen, nativeImage } from 'electron'
import * as path from 'path'
import { registerDeepgramHandlers } from './ipc/deepgram.handler'
import { registerGroqHandlers } from './ipc/groq.handler'
import { registerDriveHandlers } from './ipc/drive.handler'
import { registerNotionHandlers } from './ipc/notion.handler'
import { registerSettingsHandlers } from './ipc/settings.handler'
import { setStealth } from './utils/stealth'
import { getWindowBounds, saveWindowBounds, getSettings } from './utils/store'

// ─── Window references ──────────────────────────────────────
let dashboardWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let tray: Tray | null = null

// ─── State ──────────────────────────────────────────────────
let isOverlayVisible = true
let isClickThrough = false
let isStealthActive = true
let isListening = false
let currentSource: 'internal' | 'external' = 'internal'

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
    show: true,
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

  win.on('close', () => {
    const b = win.getBounds()
    saveWindowBounds({ x: b.x, y: b.y, width: b.width, height: b.height })
  })

  return win
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

  // Stealth: invisible to screen-sharing software
  win.setContentProtection(true)

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

  win.on('close', (e) => {
    e.preventDefault()
    win.hide()
    isOverlayVisible = false
  })

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

// ─── Stealth Toggle ─────────────────────────────────────────
function toggleStealth() {
  isStealthActive = !isStealthActive
  if (process.platform !== 'linux') {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.setContentProtection(isStealthActive)
    }
    if (dashboardWindow && !dashboardWindow.isDestroyed()) {
      dashboardWindow.setContentProtection(isStealthActive)
    }
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.webContents.send('stealth-changed', isStealthActive)
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
    currentSource = currentSource === 'internal' ? 'external' : 'internal'
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

  // Ctrl+Shift+D — Show / hide dashboard
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (!dashboardWindow || dashboardWindow.isDestroyed()) return
    if (dashboardWindow.isVisible()) {
      dashboardWindow.hide()
    } else {
      dashboardWindow.show()
      dashboardWindow.focus()
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
  console.log('  Ctrl+Shift+S  → Toggle stealth')
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
      click: () => { dashboardWindow?.show(); dashboardWindow?.focus() }
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
  ipcMain.handle('window:close', () => dashboardWindow?.close())

  // Stealth
  ipcMain.handle('stealth:toggle', (_e, enable: boolean) => {
    isStealthActive = enable
    if (process.platform !== 'linux') {
      overlayWindow?.setContentProtection(enable)
      dashboardWindow?.setContentProtection(enable)
    }
    return { supported: process.platform !== 'linux', active: enable }
  })
  ipcMain.handle('stealth:status', () => ({
    supported: process.platform !== 'linux',
    active: isStealthActive
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

  // Overlay → Dashboard: forward session data
  ipcMain.handle('overlay:save-session', (_e, sessionData) => {
    if (dashboardWindow && !dashboardWindow.isDestroyed()) {
      dashboardWindow.webContents.send('session-saved', sessionData)
    }
    return { success: true }
  })

  // Overlay requests transcription
  ipcMain.handle('overlay:transcribe', async (_e, args: { audioBlob: ArrayBuffer; apiKey: string }) => {
    // This would call the Deepgram handler logic
    // For now, forward to the deepgram handler channel
    return { success: true, message: 'Transcription request received' }
  })
}

// ─── App Lifecycle ──────────────────────────────────────────
app.whenReady().then(() => {
  // Create both windows
  dashboardWindow = createDashboardWindow()
  overlayWindow = createOverlayWindow()

  // Register all handlers
  registerDeepgramHandlers(overlayWindow)
  registerGroqHandlers()
  registerDriveHandlers()
  registerNotionHandlers()
  registerSettingsHandlers()
  registerIPC()
  registerHotkeys()

  // Tray
  try { createTray() } catch {}

  // Auto-enable stealth on launch if configured
  const settings = getSettings()
  if (settings.stealthOnLaunch && process.platform !== 'linux') {
    setStealth(overlayWindow, true)
    isStealthActive = true
  }

  console.log('EVES started — Both windows visible')
  console.log('Overlay top-right | Dashboard centered')
  console.log('Ctrl+Shift+L to start listening')
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    dashboardWindow = createDashboardWindow()
    overlayWindow = createOverlayWindow()
  }
})
