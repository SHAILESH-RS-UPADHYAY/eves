import { ipcMain } from '../runtime'
import { getSettings, saveSettings } from '../utils/store'

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:save', (_event, partial: Record<string, unknown>) => {
    const updated = saveSettings(partial as any)
    return { success: true, data: updated }
  })
}
