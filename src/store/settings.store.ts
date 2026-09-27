import { create } from 'zustand'
import type { AppSettings } from '../types'
import { DEFAULT_SETTINGS } from '../lib/providers'

interface SettingsStore {
  settings: AppSettings
  isLoaded: boolean
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    const saved = await window.eves?.getSettings()
    set({ settings: { ...DEFAULT_SETTINGS, ...saved }, isLoaded: true })
  },

  updateSettings: async (partial) => {
    set({ settings: { ...get().settings, ...partial } })
    await window.eves?.saveSettings(partial)
  }
}))
