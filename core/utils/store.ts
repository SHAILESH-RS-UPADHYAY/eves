import Conf from 'conf'
import type { Rectangle, WebContents } from '../runtime'
import type { AiProvider, AppSettings } from '../../src/types'
import { DEFAULT_SETTINGS } from '../../src/lib/providers'

export const store = new Conf({
  configName: 'eves'
})

export function getSettings(): AppSettings {
  const stored = (store.get('settings') as Partial<AppSettings> | undefined) ?? {}
  // aiModels merges per provider so a stored partial map never loses a default
  return { ...DEFAULT_SETTINGS, ...stored, aiModels: { ...DEFAULT_SETTINGS.aiModels, ...stored.aiModels } }
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const updated = { ...getSettings(), ...partial }
  store.set('settings', updated)
  return updated
}

/** Persist a model EVES switched to (the old one was retired) and tell the dashboard. */
export const modelSwitcher = (sender: WebContents, provider: AiProvider) => (model: string) => {
  const s = getSettings()
  saveSettings({ aiModels: { ...s.aiModels, [provider]: model } })
  sender.send('ai:model-switched', { provider, model })
}

/** Fields older builds stored that nothing reads any more. */
const RETIRED = ['analysisModel', 'deleteAudioAfterTranscription', 'stealthOnLaunch', 'accentColor', 'orbIntensity', 'reduceMotion']

/** One-time migrations and safety defaults. */
export function migrateSettings() {
  const stored = store.get('settings') as Record<string, unknown> | undefined
  if (!stored) return
  if (!store.get('langMigrated')) {
    store.set('langMigrated', true)
    if (stored.defaultLanguage === 'en') stored.defaultLanguage = 'multi'
  }
  RETIRED.forEach((k) => delete stored[k])
  store.set('settings', stored)
}

/** Saved window geometry — 'windowBounds' is the dashboard (key predates the popup). */
type BoundsKey = 'windowBounds' | 'popupBounds'
export const getBounds = (key: BoundsKey) => store.get(key) as Rectangle | undefined
export const saveBounds = (key: BoundsKey, bounds: Rectangle) => store.set(key, bounds)
