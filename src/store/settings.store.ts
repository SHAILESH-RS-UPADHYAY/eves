import { create } from 'zustand'
import type { AppSettings } from '../types'

const defaultSettings: AppSettings = {
  deepgramApiKey: '',
  groqApiKey: '',
  defaultLanguage: 'multi',
  enableDiarization: true,
  autoTranscribe: true,
  autoAnalyze: true,
  analysisModel: 'llama-3.1-70b-versatile',
  deleteAudioAfterTranscription: false
}

interface SettingsStore {
  settings: AppSettings
  isLoaded: boolean
  loadSettings: () => Promise<void>
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  isLoaded: false,

  loadSettings: async () => {
    if (typeof window !== 'undefined' && window.eves) {
      const s = await window.eves.getSettings()
      set({ settings: { ...defaultSettings, ...s }, isLoaded: true })
    } else {
      set({ isLoaded: true })
    }
  },

  updateSettings: async (partial) => {
    const current = get().settings
    const updated = { ...current, ...partial }
    set({ settings: updated })
    if (typeof window !== 'undefined' && window.eves) {
      await window.eves.saveSettings(partial)
    }
  }
}))
