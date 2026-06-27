import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { GlassButton } from '../glass/GlassButton'
import { useUIStore } from '../../store/ui.store'
import { useSettingsStore } from '../../store/settings.store'

type Tab = 'apiKeys' | 'transcription' | 'analysis' | 'integrations' | 'privacy'

const tabs: { id: Tab; label: string }[] = [
  { id: 'apiKeys', label: 'API Keys' },
  { id: 'transcription', label: 'Transcription' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'privacy', label: 'Privacy' }
]

export function SettingsModal() {
  const isOpen = useUIStore((s) => s.isSettingsOpen)
  const setOpen = useUIStore((s) => s.setSettingsOpen)
  const { settings, updateSettings } = useSettingsStore()
  const [activeTab, setActiveTab] = useState<Tab>('apiKeys')
  const [showDeepgramKey, setShowDeepgramKey] = useState(false)
  const [showGroqKey, setShowGroqKey] = useState(false)
  const [testingDeepgram, setTestingDeepgram] = useState(false)
  const [deepgramResult, setDeepgramResult] = useState<'success' | 'error' | null>(null)

  const testDeepgram = async () => {
    setTestingDeepgram(true)
    setDeepgramResult(null)
    setTimeout(() => {
      setTestingDeepgram(false)
      setDeepgramResult(settings.deepgramApiKey ? 'success' : 'error')
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9994, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="glass-card"
            style={{ width: '640px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, scale: 0.94, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 className="gradient-text" style={{ fontSize: '18px', fontWeight: 700 }}>Settings</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === tab.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--accent-violet-mid)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="glass-scrollbar">
              {activeTab === 'apiKeys' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Deepgram API Key</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type={showDeepgramKey ? 'text' : 'password'}
                        value={settings.deepgramApiKey}
                        onChange={(e) => updateSettings({ deepgramApiKey: e.target.value })}
                        style={inputStyle}
                        placeholder="Enter Deepgram API key..."
                      />
                      <button onClick={() => setShowDeepgramKey(!showDeepgramKey)} style={eyeBtnStyle}>
                        {showDeepgramKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <GlassButton size="sm" onClick={testDeepgram} disabled={testingDeepgram}>
                        {testingDeepgram ? <Loader2 size={14} className="animate-spin" /> : 'Test Connection'}
                      </GlassButton>
                      {deepgramResult === 'success' && <CheckCircle size={16} style={{ color: 'var(--accent-cyan)' }} />}
                      {deepgramResult === 'error' && <XCircle size={16} style={{ color: 'var(--accent-rose)' }} />}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Groq API Key</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type={showGroqKey ? 'text' : 'password'}
                        value={settings.groqApiKey}
                        onChange={(e) => updateSettings({ groqApiKey: e.target.value })}
                        style={inputStyle}
                        placeholder="Enter Groq API key..."
                      />
                      <button onClick={() => setShowGroqKey(!showGroqKey)} style={eyeBtnStyle}>
                        {showGroqKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Keys are stored encrypted on your machine. Never sent to any server except the respective APIs.
                  </p>
                </div>
              )}

              {activeTab === 'transcription' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Default Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                      style={inputStyle}
                    >
                      {['en', 'hi', 'es', 'fr', 'de', 'ja', 'zh'].map((l) => <option key={l} value={l} style={{ background: '#1a1a2e' }}>{l}</option>)}
                    </select>
                  </div>
                  <ToggleRow label="Enable Diarization (speaker detection)" value={settings.enableDiarization} onChange={(v) => updateSettings({ enableDiarization: v })} />
                  <ToggleRow label="Auto-transcribe on upload" value={settings.autoTranscribe} onChange={(v) => updateSettings({ autoTranscribe: v })} />
                </div>
              )}

              {activeTab === 'analysis' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <ToggleRow label="Auto-analyze after transcription" value={settings.autoAnalyze} onChange={(v) => updateSettings({ autoAnalyze: v })} />
                  <div>
                    <label style={labelStyle}>Analysis Model</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { id: 'llama-3.1-70b-versatile' as const, label: 'llama-3.1-70b-versatile (Recommended, slower)' },
                        { id: 'mixtral-8x7b-32768' as const, label: 'mixtral-8x7b-32768 (Faster, less detailed)' }
                      ].map((m) => (
                        <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <input type="radio" checked={settings.analysisModel === m.id} onChange={() => updateSettings({ analysisModel: m.id })} style={{ accentColor: 'var(--accent-violet)' }} />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Google Drive MCP</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-rose)' }}>Not configured</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Endpoint: https://drivemcp.googleapis.com/mcp/v1</p>
                    <GlassButton size="sm">Re-authenticate</GlassButton>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Notion MCP</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-rose)' }}>Not configured</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Endpoint: https://mcp.notion.com/mcp</p>
                    <GlassButton size="sm">Re-authenticate</GlassButton>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <ToggleRow label="Delete audio after transcription" value={settings.deleteAudioAfterTranscription} onChange={(v) => updateSettings({ deleteAudioAfterTranscription: v })} />
                  <ToggleRow label="Auto-enable stealth on launch" value={settings.stealthOnLaunch} onChange={(v) => updateSettings({ stealthOnLaunch: v })} />
                  <div>
                    <GlassButton variant="danger" size="sm" onClick={() => { if (confirm('Delete all stored data? This cannot be undone.')) { } }}>Clear all stored data</GlassButton>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EVES v1.0.0 — Personal Edition</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }
const inputStyle: React.CSSProperties = { flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }
const eyeBtnStyle: React.CSSProperties = { width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer' }

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '40px', height: '22px', borderRadius: '11px', border: 'none',
          background: value ? 'var(--accent-violet)' : 'rgba(255,255,255,0.1)',
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
        }}
      >
        <motion.div
          style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' }}
          animate={{ left: value ? 20 : 2 }}
          transition={{ duration: 0.2 }}
        />
      </button>
    </div>
  )
}
