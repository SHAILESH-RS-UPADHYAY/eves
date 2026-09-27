import Conf from 'conf'
import type { Rectangle } from '../runtime'
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
  deleteAudioAfterTranscription: false
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
}

/** Saved window geometry — 'windowBounds' is the dashboard (key predates the popup). */
type BoundsKey = 'windowBounds' | 'popupBounds'
export const getBounds = (key: BoundsKey) => store.get(key) as Rectangle | undefined
export const saveBounds = (key: BoundsKey, bounds: Rectangle) => store.set(key, bounds)
