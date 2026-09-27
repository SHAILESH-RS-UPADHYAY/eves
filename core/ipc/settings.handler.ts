import { ipcMain, shell } from '../runtime'
import * as fs from 'fs'
import * as path from 'path'
import { getSettings, saveSettings } from '../utils/store'
import { meetingsDir } from '../utils/meetings'
import { recordingsDir } from './recorder.handler'
import type { AppSettings, DataFolder, StorageInfo } from '../../src/types'

const folder = (which: DataFolder) => (which === 'recordings' ? recordingsDir() : meetingsDir())

export function registerSettingsHandlers() {
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:save', (_e, partial: Partial<AppSettings>) => ({ success: true, data: saveSettings(partial) }))

  // Where the meetings and recordings live, and how much space the audio takes
  ipcMain.handle('app:storage', (): StorageInfo => {
    const audio = fs.readdirSync(recordingsDir()).filter((f) => f.endsWith('.webm'))
    return {
      recordings: recordingsDir(),
      meetings: meetingsDir(),
      recordingCount: audio.length,
      recordingBytes: audio.reduce((sum, f) => sum + fs.statSync(path.join(recordingsDir(), f)).size, 0)
    }
  })
  ipcMain.handle('app:open-folder', (_e, which: DataFolder) => shell.openPath(folder(which)))
}
