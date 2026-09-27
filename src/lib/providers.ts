// Shared by the core process (API calls) and the dashboard (settings UI).
// All three speak the OpenAI chat-completions dialect, so one client serves them.
import type { AiProvider, AppSettings } from '../types'

export interface ProviderSpec {
  label: string
  base: string
  /** Default model — editable, and replaced automatically if the provider retires it */
  model: string
  /**
   * Characters of meeting/repo context per request (~4 chars per token), sized
   * for each provider's free/entry rate limits. Longer transcripts are digested
   * part by part first.
   */
  budget: number
  keyField: 'groqApiKey' | 'geminiApiKey' | 'openaiApiKey'
  keyUrl: string
  keyHint: string
  pitch: string
  color: string
}

export const PROVIDERS: Record<AiProvider, ProviderSpec> = {
  groq: {
    label: 'GROQ',
    base: 'https://api.groq.com/openai/v1',
    model: 'openai/gpt-oss-120b',
    budget: 12_000,
    keyField: 'groqApiKey',
    keyUrl: 'https://console.groq.com/keys',
    keyHint: 'gsk_…',
    pitch: 'fastest replies · small context, long meetings are summarised in parts',
    color: '#7ee787'
  },
  gemini: {
    label: 'GEMINI',
    base: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.5-flash',
    budget: 700_000,
    keyField: 'geminiApiKey',
    keyUrl: 'https://aistudio.google.com/apikey',
    keyHint: 'AIza…',
    pitch: '1M-token context · reads a whole 2h+ meeting at once · AI Studio free tier',
    color: '#61afef'
  },
  openai: {
    label: 'OPENAI',
    base: 'https://api.openai.com/v1',
    model: 'gpt-4.1',
    budget: 90_000,
    keyField: 'openaiApiKey',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyHint: 'sk-…',
    pitch: 'Codex family · strongest coding prompts',
    color: '#c678dd'
  }
}

export const PROVIDER_IDS = Object.keys(PROVIDERS) as AiProvider[]

export const DEFAULT_SETTINGS: AppSettings = {
  deepgramApiKey: '',
  groqApiKey: '',
  geminiApiKey: '',
  openaiApiKey: '',
  aiProvider: 'groq',
  aiModels: { groq: PROVIDERS.groq.model, gemini: PROVIDERS.gemini.model, openai: PROVIDERS.openai.model },
  defaultLanguage: 'multi',
  enableDiarization: true,
  autoTranscribe: true,
  autoAnalyze: true,
  promptPathStyle: 'wsl',
  companyRepoPath: '',
  referenceRepoPath: ''
}

/** The provider the brain will actually use: the chosen one, or the first with a key. */
export function activeProvider(s: AppSettings): AiProvider | null {
  if (s[PROVIDERS[s.aiProvider].keyField]) return s.aiProvider
  return PROVIDER_IDS.find((p) => s[PROVIDERS[p].keyField]) ?? null
}
