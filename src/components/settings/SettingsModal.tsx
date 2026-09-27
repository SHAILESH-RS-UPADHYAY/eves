import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Save, Terminal, FolderOpen, RotateCcw } from 'lucide-react'
import { GlassButton } from '../glass/GlassButton'
import { useUIStore } from '../../store/ui.store'
import { useSettingsStore } from '../../store/settings.store'
import { PROVIDERS, PROVIDER_IDS, activeProvider } from '../../lib/providers'
import { stylePath } from '../../lib/paths'
import type { AiProvider, AppSettings, StorageInfo } from '../../types'

type Tab = 'apiKeys' | 'brain' | 'transcription' | 'integrations' | 'storage'

const tabs: { id: Tab; label: string }[] = [
  { id: 'apiKeys', label: 'API Keys' },
  { id: 'brain', label: 'Brain' },
  { id: 'transcription', label: 'Transcription' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'storage', label: 'Storage' }
]

type KeyField = 'deepgramApiKey' | 'groqApiKey' | 'geminiApiKey' | 'openaiApiKey'
type TestState = { busy: boolean; ok?: boolean; text?: string }

const KEY_CARDS: { field: KeyField; label: string; color: string; hint: string; placeholder: string; provider?: AiProvider }[] = [
  { field: 'deepgramApiKey', label: 'DEEPGRAM API KEY', color: '#00F5FF', hint: 'Get key: https://console.deepgram.com  |  nova-3 multilingual live + file transcription', placeholder: 'dg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
  ...PROVIDER_IDS.map((p) => ({
    field: PROVIDERS[p].keyField,
    label: `${PROVIDERS[p].label} API KEY`,
    color: PROVIDERS[p].color,
    hint: `Get key: ${PROVIDERS[p].keyUrl}  |  ${PROVIDERS[p].pitch}`,
    placeholder: `${PROVIDERS[p].keyHint}xxxxxxxxxxxxxxxxxxxxxxxx`,
    provider: p
  }))
]

const mono = '"Courier New", monospace'
const fmtBytes = (b: number) => (b > 1e9 ? `${(b / 1e9).toFixed(2)} GB` : `${(b / 1e6).toFixed(1)} MB`)

export function SettingsModal() {
  const isOpen = useUIStore((s) => s.isSettingsOpen)
  const setOpen = useUIStore((s) => s.setSettingsOpen)
  const { settings, updateSettings } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<Tab>('apiKeys')
  const [keys, setKeys] = useState<Record<KeyField, string>>(pickKeys(settings))
  const [shown, setShown] = useState<Partial<Record<KeyField, boolean>>>({})
  const [tests, setTests] = useState<Partial<Record<KeyField, TestState>>>({})
  const [saved, setSaved] = useState(false)
  const [models, setModels] = useState<Partial<Record<AiProvider, string[]>>>({})
  const [storage, setStorage] = useState<StorageInfo | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setKeys(pickKeys(settings))
    setTests({})
    window.eves?.storageInfo().then(setStorage)
  }, [isOpen])

  const saveApiKeys = () => {
    updateSettings(keys)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Real checks: Deepgram lists projects, the LLM providers list their models
  const testKey = async (card: (typeof KEY_CARDS)[number]) => {
    const key = keys[card.field].trim()
    if (!key) return setTests((t) => ({ ...t, [card.field]: { busy: false, ok: false, text: 'No key entered' } }))
    setTests((t) => ({ ...t, [card.field]: { busy: true } }))
    if (card.provider) {
      const res = await window.eves?.listModels(card.provider, key)
      if (res?.success && res.data) setModels((m) => ({ ...m, [card.provider!]: res.data }))
      setTests((t) => ({ ...t, [card.field]: { busy: false, ok: !!res?.success, text: res?.success ? `Connected — ${res.data?.length ?? 0} models available` : res?.error } }))
    } else {
      const res = await window.eves?.testDeepgram(key)
      setTests((t) => ({ ...t, [card.field]: { busy: false, ok: !!res?.success, text: res?.success ? 'Connected' : res?.error } }))
    }
  }

  const loadModels = async (p: AiProvider) => {
    const key = settings[PROVIDERS[p].keyField]
    if (!key) return
    const res = await window.eves?.listModels(p, key)
    if (res?.success && res.data) setModels((m) => ({ ...m, [p]: res.data }))
  }

  const brain = activeProvider(settings)

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: activeTab === tab ? 'rgba(0, 245, 255, 0.3)' : 'transparent',
    background: activeTab === tab ? 'rgba(0, 245, 255, 0.08)' : 'transparent',
    color: activeTab === tab ? '#00F5FF' : 'rgba(255,255,255,0.3)',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: mono,
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9994, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          {/* Scanlines on backdrop */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 3px)' }} />

          <motion.div
            style={{
              width: '720px',
              maxHeight: '84vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(8, 10, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(0, 245, 255, 0.15)',
              borderRadius: '10px',
              boxShadow: '0 0 40px rgba(0,0,0,0.6), 0 0 80px rgba(0, 245, 255, 0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner brackets */}
            <div style={{ position: 'absolute', top: '6px', left: '6px', width: '14px', height: '14px', borderTop: '2px solid rgba(0,245,255,0.4)', borderLeft: '2px solid rgba(0,245,255,0.4)', pointerEvents: 'none', zIndex: 5 }} />
            <div style={{ position: 'absolute', top: '6px', right: '6px', width: '14px', height: '14px', borderTop: '2px solid rgba(0,245,255,0.4)', borderRight: '2px solid rgba(0,245,255,0.4)', pointerEvents: 'none', zIndex: 5 }} />
            <div style={{ position: 'absolute', bottom: '6px', left: '6px', width: '14px', height: '14px', borderBottom: '2px solid rgba(0,245,255,0.4)', borderLeft: '2px solid rgba(0,245,255,0.4)', pointerEvents: 'none', zIndex: 5 }} />
            <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '14px', height: '14px', borderBottom: '2px solid rgba(0,245,255,0.4)', borderRight: '2px solid rgba(0,245,255,0.4)', pointerEvents: 'none', zIndex: 5 }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(0, 245, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Terminal size={16} style={{ color: '#00F5FF' }} />
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#00F5FF', letterSpacing: '1px', textShadow: '0 0 8px rgba(0,245,255,0.3)' }}>▸ SETTINGS</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'rgba(255,255,255,0.3)', fontSize: '16px', cursor: 'pointer', padding: '2px 8px', fontFamily: mono }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '12px 24px', borderBottom: '1px solid rgba(0, 245, 255, 0.06)' }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabStyle(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="glass-scrollbar">
              {activeTab === 'apiKeys' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {KEY_CARDS.map((card) => {
                    const test = tests[card.field]
                    return (
                      <div key={card.field} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${card.color}14`, borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: card.color, boxShadow: `0 0 6px ${card.color}` }} />
                          <label style={{ fontSize: '11px', fontWeight: 700, color: card.color, letterSpacing: '0.5px' }}>{card.label}</label>
                          {card.provider && card.provider === brain && (
                            <span style={{ marginLeft: 'auto', fontSize: '8px', fontWeight: 700, letterSpacing: '1px', color: card.color, border: `1px solid ${card.color}55`, borderRadius: '999px', padding: '1px 8px' }}>ACTIVE BRAIN</span>
                          )}
                        </div>
                        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>{card.hint}</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type={shown[card.field] ? 'text' : 'password'}
                            value={keys[card.field]}
                            onChange={(e) => setKeys((k) => ({ ...k, [card.field]: e.target.value }))}
                            placeholder={card.placeholder}
                            style={{ flex: 1, padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${card.color}22`, borderRadius: '6px', color: card.color, fontSize: '12px', fontFamily: mono, outline: 'none', letterSpacing: '0.5px' }}
                          />
                          <button
                            onClick={() => setShown((s) => ({ ...s, [card.field]: !s[card.field] }))}
                            aria-label={shown[card.field] ? 'Hide key' : 'Show key'}
                            style={{ width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', border: `1px solid ${card.color}22`, borderRadius: '6px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                          >
                            {shown[card.field] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', minHeight: '26px' }}>
                          <GlassButton size="sm" onClick={() => testKey(card)} disabled={test?.busy}>
                            {test?.busy ? <Loader2 size={12} className="animate-spin" /> : 'Test'}
                          </GlassButton>
                          {test?.text && (
                            <span style={{ fontSize: '10px', color: test.ok ? '#10B981' : '#FF006E' }}>{test.ok ? '[OK]' : '[FAIL]'} {test.text}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                    {saved && <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={10} /> Saved</span>}
                    <button
                      onClick={saveApiKeys}
                      style={{ padding: '10px 24px', background: 'rgba(0, 245, 255, 0.1)', border: '1px solid rgba(0, 245, 255, 0.3)', borderRadius: '6px', color: '#00F5FF', fontFamily: mono, fontSize: '12px', fontWeight: 700, letterSpacing: '1px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 0 8px rgba(0,245,255,0.3)', transition: 'all 0.3s ease' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 245, 255, 0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.15)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <Save size={14} /> ./save_keys
                    </button>
                  </div>

                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                    Keys are stored locally on this machine and are only ever sent to their own provider.
                  </p>
                </div>
              )}

              {activeTab === 'brain' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div>
                    <label style={labelStyle}>ACTIVE BRAIN</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {PROVIDER_IDS.map((p) => {
                        const spec = PROVIDERS[p]
                        const hasKey = !!settings[spec.keyField]
                        const on = settings.aiProvider === p
                        return (
                          <motion.button
                            key={p}
                            onClick={() => updateSettings({ aiProvider: p })}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            style={{ textAlign: 'left', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontFamily: mono, background: on ? `${spec.color}14` : 'rgba(0,0,0,0.3)', border: `1px solid ${on ? spec.color : `${spec.color}22`}`, boxShadow: on ? `0 0 18px ${spec.color}22` : 'none' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: hasKey ? '#10B981' : '#FF006E', boxShadow: `0 0 6px ${hasKey ? '#10B981' : '#FF006E'}` }} />
                              <span style={{ fontSize: '11px', fontWeight: 700, color: spec.color, letterSpacing: '1px' }}>{spec.label}</span>
                            </div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{spec.pitch}</div>
                            {!hasKey && <div style={{ fontSize: '9px', color: '#FF006E', marginTop: '4px' }}>no key — add it in API Keys</div>}
                          </motion.button>
                        )
                      })}
                    </div>
                    {brain && brain !== settings.aiProvider && (
                      <p style={{ fontSize: '10px', color: '#FCD34D', marginTop: '8px' }}>
                        {PROVIDERS[settings.aiProvider].label} has no key, so EVES is using {PROVIDERS[brain].label} for now.
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>MODELS</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {PROVIDER_IDS.map((p) => (
                        <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '64px', fontSize: '10px', fontWeight: 700, color: PROVIDERS[p].color }}>{PROVIDERS[p].label}</span>
                          <input
                            list={`models-${p}`}
                            value={settings.aiModels[p]}
                            onFocus={() => !models[p] && loadModels(p)}
                            onChange={(e) => updateSettings({ aiModels: { ...settings.aiModels, [p]: e.target.value } })}
                            style={{ ...inputStyle, flex: 1, color: PROVIDERS[p].color }}
                          />
                          <datalist id={`models-${p}`}>
                            {(models[p] ?? []).map((m) => <option key={m} value={m} />)}
                          </datalist>
                          <button
                            title={`Reset to ${PROVIDERS[p].model}`}
                            onClick={() => updateSettings({ aiModels: { ...settings.aiModels, [p]: PROVIDERS[p].model } })}
                            style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
                          >
                            <RotateCcw size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '6px' }}>Focus a field to load the models your key can use. Providers retire models — change it here if one stops answering.</p>
                  </div>

                  <Segmented
                    label="PATHS IN GENERATED PROMPTS"
                    value={settings.promptPathStyle}
                    options={[['wsl', 'WSL  /mnt/c/…'], ['windows', 'Windows  C:\\…']]}
                    onChange={(v) => updateSettings({ promptPathStyle: v })}
                    note={`e.g. ${stylePath(settings.referenceRepoPath || settings.companyRepoPath || 'C:\\Users\\you\\repo', settings.promptPathStyle)}`}
                  />

                  <ToggleRow label="Auto-analyze meetings after recording / transcription" value={settings.autoAnalyze} onChange={(v) => updateSettings({ autoAnalyze: v })} />
                </div>
              )}

              {activeTab === 'transcription' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>DEFAULT LANGUAGE</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                      style={inputStyle}
                    >
                      {['multi', 'en', 'hi', 'es', 'fr', 'de', 'ja', 'zh'].map((l) => <option key={l} value={l} style={{ background: '#08080f' }}>{l === 'multi' ? 'multi — mixed-language / code-switching' : l}</option>)}
                    </select>
                  </div>
                  <ToggleRow label="Enable Diarization (speaker detection)" value={settings.enableDiarization} onChange={(v) => updateSettings({ enableDiarization: v })} />
                  <ToggleRow label="Auto-transcribe on upload" value={settings.autoTranscribe} onChange={(v) => updateSettings({ autoTranscribe: v })} />
                </div>
              )}

              {activeTab === 'integrations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,245,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: mono, color: '#00F5FF' }}>Google Drive MCP</span>
                      <span style={{ fontSize: '10px', color: '#F59E0B' }}>[NOT_CONFIGURED]</span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Endpoint: https://drivemcp.googleapis.com/mcp/v1</p>
                    <GlassButton size="sm">Re-authenticate</GlassButton>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,245,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: mono, color: '#00F5FF' }}>Notion MCP</span>
                      <span style={{ fontSize: '10px', color: '#F59E0B' }}>[NOT_CONFIGURED]</span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Endpoint: https://mcp.notion.com/mcp</p>
                    <GlassButton size="sm">Re-authenticate</GlassButton>
                  </div>
                </div>
              )}

              {activeTab === 'storage' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                    Everything stays on this machine. Recordings are kept until you delete their meeting.
                  </p>
                  {storage && ([
                    ['recordings', 'RECORDINGS', `${storage.recordingCount} files · ${fmtBytes(storage.recordingBytes)}`, storage.recordings],
                    ['meetings', 'MEETINGS', 'one JSON file per meeting', storage.meetings]
                  ] as const).map(([id, label, meta, dir]) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,245,255,0.08)', borderRadius: '8px', padding: '12px 14px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#00F5FF', letterSpacing: '0.5px' }}>{label} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>· {meta}</span></div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dir}>{dir}</div>
                      </div>
                      <GlassButton size="sm" onClick={() => window.eves?.openDataFolder(id)}><FolderOpen size={12} style={{ marginRight: 6 }} />Open</GlassButton>
                    </div>
                  ))}
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', fontFamily: mono }}>EVES v2.2.0 — Personal Edition</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function pickKeys(s: AppSettings): Record<KeyField, string> {
  return { deepgramApiKey: s.deepgramApiKey, groqApiKey: s.groqApiKey, geminiApiKey: s.geminiApiKey, openaiApiKey: s.openaiApiKey }
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: mono, color: '#00F5FF', marginBottom: '8px', letterSpacing: '0.5px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: '6px', color: '#00F5FF', fontSize: '12px', fontFamily: mono, outline: 'none' }

function Segmented<T extends string>({ label, value, options, onChange, note }: { label: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void; note?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'inline-flex', gap: '3px', padding: '3px', borderRadius: '8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,245,255,0.08)' }}>
        {options.map(([v, text]) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: mono, fontSize: '11px', fontWeight: 700, background: value === v ? 'rgba(0,245,255,0.14)' : 'transparent', color: value === v ? '#00F5FF' : 'rgba(255,255,255,0.35)', textShadow: value === v ? '0 0 6px rgba(0,245,255,0.3)' : 'none' }}
          >
            {text}
          </button>
        ))}
      </div>
      {note && <p style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>{note}</p>}
    </div>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontSize: '11px', fontFamily: mono, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px' }}>{'> '}{label}</span>
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        style={{
          width: '36px', height: '20px', borderRadius: '10px', border: value ? 'none' : '1px solid rgba(255,255,255,0.1)',
          background: value ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.05)',
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s', padding: 0
        }}
      >
        <motion.div
          style={{ position: 'absolute', top: 2, width: 14, height: 14, borderRadius: '50%', background: value ? '#00F5FF' : 'rgba(255,255,255,0.3)', boxShadow: value ? '0 0 6px rgba(0,245,255,0.5)' : 'none' }}
          animate={{ left: value ? 20 : 2 }}
          transition={{ duration: 0.2 }}
        />
      </button>
    </div>
  )
}
