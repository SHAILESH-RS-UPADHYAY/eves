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
  stealthOnLaunch: true,
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

/** One-time: 'en' was the old default and mangles Hinglish. Runs once, then
 *  never overrides a deliberate choice again. */
export function migrateSettings() {
  if (store.get('langMigrated')) return
  store.set('langMigrated', true)
  const stored = store.get('settings') as Partial<AppSettings> | undefined
  if (stored?.defaultLanguage === 'en') saveSettings({ defaultLanguage: 'multi' })
}

export function getWindowBounds() {
  return store.get('windowBounds') as { x: number; y: number; width: number; height: number } | undefined
}

export function saveWindowBounds(bounds: { x: number; y: number; width: number; height: number }) {
  store.set('windowBounds', bounds)
}
