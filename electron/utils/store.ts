import Conf from 'conf'
import type { AppSettings } from '../../src/types'

export const store = new Conf({
  configName: 'eves'
})

export const defaultSettings: AppSettings = {
  deepgramApiKey: '',
  groqApiKey: '',
  defaultLanguage: 'multi',
  enableDiarization: true,
  autoTranscribe: true,
  autoAnalyze: true,
  analysisModel: 'llama-3.1-70b-versatile',
  deleteAudioAfterTranscription: false,
  stealthOnLaunch: false,
  accentColor: '#7C3AED',
  orbIntensity: 0.13,
  reduceMotion: false
}

export function getSettings(): AppSettings {
  const stored = store.get('settings') as Partial<AppSettings> | undefined
  return { ...defaultSettings, ...(stored ?? {}) }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const updated = { ...current, ...partial }
  store.set('settings', updated)
  return updated
}

/** One-time migrations and safety defaults. */
export function migrateSettings() {
  const stored = store.get('settings') as Partial<AppSettings> | undefined
  if (!store.get('langMigrated')) {
    store.set('langMigrated', true)
    if (stored?.defaultLanguage === 'en') saveSettings({ defaultLanguage: 'multi' })
  }
  // Ensure stealth is never active by default so windows remain visible on screen share
  if (stored?.stealthOnLaunch) {
    saveSettings({ stealthOnLaunch: false })
  }
}

export function getWindowBounds() {
  return store.get('windowBounds') as { x: number; y: number; width: number; height: number } | undefined
}

export function saveWindowBounds(bounds: { x: number; y: number; width: number; height: number }) {
  store.set('windowBounds', bounds)
}
