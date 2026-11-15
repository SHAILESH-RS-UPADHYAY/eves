import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettingsStore } from '../../store/settings.store'
import { useUIStore } from '../../store/ui.store'
import { activeProvider } from '../../lib/providers'

const mono = '"Courier New", Consolas, monospace'

const STEPS: { tag: string; title: string; lines: string[] }[] = [
  {
    tag: 'BOOT',
    title: 'WELCOME TO EVES',
    lines: ['Records your meetings, transcribes them, and turns them into summaries + action items.', 'Everything stays on this machine. Your keys, your data.']
  },
  {
    tag: 'RECORD',
    title: 'CAPTURE A MEETING',
    lines: ['Alt + L — start / stop listening from the floating panel.', 'Alt + O — cycle audio source (mic / system / both).', 'Alt + Space — stop and save. Or drop an audio file on the dashboard.']
  },
  {
    tag: 'ANALYZE',
    title: 'BRAIN + INSIGHTS',
    lines: ['Each session gets a transcript, summary, key moments and action items.', 'Open BRAIN to chat over all your meetings.', 'Ctrl + K — command palette · ? — every shortcut.']
  },
  {
    tag: 'CONFIG',
    title: 'ADD YOUR API KEYS',
    lines: ['Deepgram — speech to text (required for transcripts).', 'Groq, Gemini or OpenAI — any one powers the brain.', 'Keys are saved only on this PC.']
  }
]

/** First-run guide. Shown until finished or skipped; replay from Control Panel. */
export function Onboarding() {
  const isLoaded = useSettingsStore((s) => s.isLoaded)
  const settings = useSettingsStore((s) => s.settings)
  const updateSettings = useSettingsStore((s) => s.updateSettings)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)
  const [step, setStep] = useState(0)

  // Users who already set keys before this guide existed never see it
  const configured = !!settings.deepgramApiKey || !!activeProvider(settings)
  const open = isLoaded && !settings.onboarded && !(settings.onboarded === undefined && configured)

  const finish = (toKeys: boolean) => {
    updateSettings({ onboarded: true })
    setStep(0)
    if (toKeys) setSettingsOpen(true)
  }

  const s = STEPS[step]
  const last = step === STEPS.length - 1
  const btn = (c: string) => ({ fontSize: '10px', fontFamily: mono, fontWeight: 700, letterSpacing: '1px', color: c, background: `${c}1a`, border: `1px solid ${c}59`, borderRadius: '5px', padding: '7px 14px', cursor: 'pointer' })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="atom-glass"
            style={{ width: '520px', maxWidth: 'calc(100vw - 32px)', padding: '28px', fontFamily: mono }}
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', letterSpacing: '1px', color: 'rgba(171,178,191,0.5)', marginBottom: '14px' }}>
              <span>[{String(step + 1).padStart(2, '0')}/{String(STEPS.length).padStart(2, '0')}] // {s.tag}</span>
              <button onClick={() => finish(false)} style={{ ...btn('#abb2bf'),padding: '2px 8px', fontSize: '9px' }}>SKIP</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.18 }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#22d3ee', textShadow: '0 0 16px #22d3ee44', marginBottom: '16px' }}>&gt; {s.title}</h2>
                {s.lines.map((l) => (
                  <div key={l} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                    <span style={{ color: '#7ee787' }}>$ </span>{l}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* progress */}
            <div style={{ display: 'flex', gap: '6px', margin: '22px 0 18px' }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: '2px', background: i <= step ? '#22d3ee' : 'rgba(255,255,255,0.1)', boxShadow: i <= step ? '0 0 8px #22d3ee' : 'none' }} />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(step - 1)} disabled={step === 0} style={{ ...btn('#abb2bf'), opacity: step === 0 ? 0.3 : 1 }}>◂ BACK</button>
              {last
                ? <button onClick={() => finish(true)} style={btn('#7ee787')}>▸ ADD_KEYS</button>
                : <button onClick={() => setStep(step + 1)} style={btn('#22d3ee')}>NEXT ▸</button>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
