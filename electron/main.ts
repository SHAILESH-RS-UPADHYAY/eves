import { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage, screen } from 'electron'
import * as path from 'path'
import { registerDeepgramHandlers } from './ipc/deepgram.handler'
import { registerGroqHandlers } from './ipc/groq.handler'
import { registerDriveHandlers } from './ipc/drive.handler'
import { registerNotionHandlers } from './ipc/notion.handler'
import { registerSettingsHandlers } from './ipc/settings.handler'
import { setStealth } from './utils/stealth'
import { getWindowBounds, saveWindowBounds, getSettings } from './utils/store'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow(): BrowserWindow {
  const savedBounds = getWindowBounds()
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    width: savedBounds?.width ?? 1400,
    height: savedBounds?.height ?? 900,
    x: savedBounds?.x ?? Math.floor((screenWidth - 1400) / 2),
    y: savedBounds?.y ?? Math.floor((screenHeight - 900) / 2),
    minWidth: 1100,
    minHeight: 700,
    frame: false,
    backgroundColor: '#050508',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  }

  if (process.platform === 'darwin') {
    windowOptions.titleBarStyle = 'hidden'
    ;(windowOptions as any).vibrancy = 'ultra-dark'
    ;(windowOptions as any).visualEffectState = 'active'
  }

  const win = new BrowserWindow(windowOptions)

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  win.on('close', () => {
    const bounds = win.getBounds()
    saveWindowBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height })
  })

  return win
}

function createTray(win: BrowserWindow) {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => {
        if (win.isVisible()) win.hide()
        else win.show()
      }
    },
    {
      label: 'Toggle Stealth',
      click: () => {
        if (process.platform !== 'linux' && mainWindow) {
          setStealth(mainWindow, true)
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('EVES — Meeting Intelligence')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    if (win.isVisible()) win.hide()
    else win.show()
  })
}

function registerGlobalShortcuts(win: BrowserWindow) {
  globalShortcut.register('CommandOrControl+Shift+E', () => {
    if (win.isVisible()) win.hide()
    else { win.show(); win.focus() }
  })

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (process.platform !== 'linux') {
      setStealth(win, !win.isVisible())
    }
  })
}

function registerWindowHandlers(win: BrowserWindow) {
  ipcMain.handle('window:minimize', () => win.minimize())
  ipcMain.handle('window:maximize', () => {
    if (win.isMaximized()) win.unmaximize()
    else win.maximize()
  })
  ipcMain.handle('window:close', () => win.close())

  ipcMain.handle('stealth:toggle', (_e, enable: boolean) => {
    return setStealth(win, enable)
  })
  ipcMain.handle('stealth:status', () => {
    if (process.platform === 'linux') return { supported: false, active: false }
    return { supported: true, active: false }
  })
}

app.whenReady().then(() => {
  mainWindow = createWindow()

  registerDeepgramHandlers(mainWindow)
  registerGroqHandlers()
  registerDriveHandlers()
  registerNotionHandlers()
  registerSettingsHandlers()
  registerWindowHandlers(mainWindow)
  registerGlobalShortcuts(mainWindow)

  try {
    createTray(mainWindow)
  } catch {
    // Tray creation is non-critical
  }

  const settings = getSettings()
  if (settings.stealthOnLaunch && process.platform !== 'linux') {
    setStealth(mainWindow, true)
  }

  console.log('EVES started — Ctrl+Shift+E to toggle visibility')
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow()
  }
})
