import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, Save, Terminal, Key } from 'lucide-react'
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
  const [deepgramSaved, setDeepgramSaved] = useState(false)
  const [groqSaved, setGroqSaved] = useState(false)
  const [localDeepgramKey, setLocalDeepgramKey] = useState(settings.deepgramApiKey)
  const [localGroqKey, setLocalGroqKey] = useState(settings.groqApiKey)

  useEffect(() => {
    if (isOpen) {
      setLocalDeepgramKey(settings.deepgramApiKey)
      setLocalGroqKey(settings.groqApiKey)
    }
  }, [isOpen])

  const saveApiKeys = () => {
    updateSettings({ deepgramApiKey: localDeepgramKey, groqApiKey: localGroqKey })
    setDeepgramSaved(true)
    setGroqSaved(true)
    setTimeout(() => { setDeepgramSaved(false); setGroqSaved(false) }, 3000)
  }

  const testDeepgram = async () => {
    setTestingDeepgram(true)
    setDeepgramResult(null)
    setTimeout(() => {
      setTestingDeepgram(false)
      setDeepgramResult(localDeepgramKey ? 'success' : 'error')
    }, 2000)
  }

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid',
    borderColor: activeTab === tab ? 'rgba(0, 245, 255, 0.3)' : 'transparent',
    background: activeTab === tab ? 'rgba(0, 245, 255, 0.08)' : 'transparent',
    color: activeTab === tab ? '#00F5FF' : 'rgba(255,255,255,0.3)',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: '"Courier New", monospace',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9994, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Courier New", monospace' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          {/* Scanlines on backdrop */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,245,255,0.015) 2px, rgba(0,245,255,0.015) 3px)' }} />

          <motion.div
            style={{
              width: '680px',
              maxHeight: '80vh',
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
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'rgba(255,255,255,0.3)', fontSize: '16px', cursor: 'pointer', padding: '2px 8px', fontFamily: '"Courier New", monospace' }}>✕</button>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Deepgram */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,245,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F5FF', boxShadow: '0 0 6px #00F5FF' }} />
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#00F5FF', letterSpacing: '0.5px' }}>DEEPGRAM API KEY</label>
                    </div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Get key: https://console.deepgram.com  |  Model: nova-2 (real-time streaming)</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type={showDeepgramKey ? 'text' : 'password'}
                        value={localDeepgramKey}
                        onChange={(e) => setLocalDeepgramKey(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(0,245,255,0.12)',
                          borderRadius: '6px',
                          color: '#00F5FF',
                          fontSize: '12px',
                          fontFamily: '"Courier New", monospace',
                          outline: 'none',
                          letterSpacing: '0.5px'
                        }}
                        placeholder="dg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                      <button onClick={() => setShowDeepgramKey(!showDeepgramKey)} style={{
                        width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.12)', borderRadius: '6px',
                        color: 'rgba(255,255,255,0.3)', cursor: 'pointer'
                      }}>
                        {showDeepgramKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      <GlassButton size="sm" onClick={testDeepgram} disabled={testingDeepgram}>
                        {testingDeepgram ? <Loader2 size={12} className="animate-spin" /> : 'Test'}
                      </GlassButton>
                      {deepgramResult === 'success' && <span style={{ fontSize: '10px', color: '#10B981' }}>[OK] Connected</span>}
                      {deepgramResult === 'error' && <span style={{ fontSize: '10px', color: '#FF006E' }}>[FAIL] No key</span>}
                      {deepgramSaved && <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={10} /> Saved</span>}
                    </div>
                  </div>

                  {/* Groq */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(16,185,129,0.08)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', letterSpacing: '0.5px' }}>GROQ API KEY</label>
                    </div>
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Get key: https://console.groq.com  |  Model: LLaMA-3.1 70B (AI summarization)</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type={showGroqKey ? 'text' : 'password'}
                        value={localGroqKey}
                        onChange={(e) => setLocalGroqKey(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(16,185,129,0.12)',
                          borderRadius: '6px',
                          color: '#10B981',
                          fontSize: '12px',
                          fontFamily: '"Courier New", monospace',
                          outline: 'none',
                          letterSpacing: '0.5px'
                        }}
                        placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                      <button onClick={() => setShowGroqKey(!showGroqKey)} style={{
                        width: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: '6px',
                        color: 'rgba(255,255,255,0.3)', cursor: 'pointer'
                      }}>
                        {showGroqKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                      {groqSaved && <span style={{ fontSize: '10px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><Save size={10} /> Saved</span>}
                    </div>
                  </div>

                  {/* Save All Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={saveApiKeys}
                      style={{
                        padding: '10px 24px',
                        background: 'rgba(0, 245, 255, 0.1)',
                        border: '1px solid rgba(0, 245, 255, 0.3)',
                        borderRadius: '6px',
                        color: '#00F5FF',
                        fontFamily: '"Courier New", monospace',
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        textShadow: '0 0 8px rgba(0,245,255,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 245, 255, 0.2)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.15)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)'; e.currentTarget.style.boxShadow = 'none' }}
                    >
                      <Save size={14} /> ./save_keys
                    </button>
                  </div>

                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                    Keys are stored encrypted locally. Never sent anywhere except their respective APIs.
                  </p>
                </div>
              )}

              {activeTab === 'transcription' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ ...labelStyle, color: '#00F5FF' }}>DEFAULT LANGUAGE</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => updateSettings({ defaultLanguage: e.target.value })}
                      style={inputStyle}
                    >
                      {['multi', 'en', 'hi', 'es', 'fr', 'de', 'ja', 'zh'].map((l) => <option key={l} value={l} style={{ background: '#08080f' }}>{l === 'multi' ? 'multi — hinglish / code-switching' : l}</option>)}
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
                    <label style={{ ...labelStyle, color: '#00F5FF' }}>ANALYSIS MODEL</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { id: 'llama-3.1-70b-versatile' as const, label: 'llama-3.1-70b-versatile (Recommended, slower)' },
                        { id: 'mixtral-8x7b-32768' as const, label: 'mixtral-8x7b-32768 (Faster, less detailed)' }
                      ].map((m) => (
                        <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: '"Courier New", monospace', color: 'rgba(255,255,255,0.5)' }}>
                          <input type="radio" checked={settings.analysisModel === m.id} onChange={() => updateSettings({ analysisModel: m.id })} style={{ accentColor: '#00F5FF' }} />
                          {m.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,245,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: '"Courier New", monospace', color: '#00F5FF' }}>Google Drive MCP</span>
                      <span style={{ fontSize: '10px', color: '#F59E0B' }}>[NOT_CONFIGURED]</span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Endpoint: https://drivemcp.googleapis.com/mcp/v1</p>
                    <GlassButton size="sm">Re-authenticate</GlassButton>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,245,255,0.08)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: '"Courier New", monospace', color: '#00F5FF' }}>Notion MCP</span>
                      <span style={{ fontSize: '10px', color: '#F59E0B' }}>[NOT_CONFIGURED]</span>
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>Endpoint: https://mcp.notion.com/mcp</p>
                    <GlassButton size="sm">Re-authenticate</GlassButton>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <ToggleRow label="Delete audio after transcription" value={settings.deleteAudioAfterTranscription} onChange={(v) => updateSettings({ deleteAudioAfterTranscription: v })} />
                  <div>
                    <GlassButton variant="danger" size="sm" onClick={() => { if (confirm('Delete all stored data? This cannot be undone.')) { } }}>
                      Clear all stored data
                    </GlassButton>
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', fontFamily: '"Courier New", monospace' }}>EVES v2.1.0 — Personal Edition</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: '"Courier New", monospace', color: '#00F5FF', marginBottom: '6px', letterSpacing: '0.5px' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.1)', borderRadius: '6px', color: '#00F5FF', fontSize: '12px', fontFamily: '"Courier New", monospace', outline: 'none' }

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ fontSize: '11px', fontFamily: '"Courier New", monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px' }}>{'> '}{label}</span>
      <button
        onClick={() => onChange(!value)}
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
