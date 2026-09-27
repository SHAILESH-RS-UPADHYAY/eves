import { motion } from 'framer-motion'
import { SectionDivider, ExpandableCard, SystemRecon, ConfigConsole } from '../hacker/CyberKit'
import { useMeetingsStore } from '../../store/meetings.store'
import { useSettingsStore } from '../../store/settings.store'
import { useUIStore } from '../../store/ui.store'
import { activeProvider } from '../../lib/providers'

const mono = '"Courier New", Consolas, monospace'

export function ControlPanelPage() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const settings = useSettingsStore((s) => s.settings)
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)

  const keys = [settings.deepgramApiKey, settings.groqApiKey, settings.geminiApiKey, settings.openaiApiKey].filter(Boolean).length
  // ready = can transcribe and has a brain
  const ready = !!settings.deepgramApiKey && !!activeProvider(settings)
  const stats: { label: string; value: string; c: string }[] = [
    { label: 'SESSIONS', value: String(meetings.length), c: '#22d3ee' },
    { label: 'TRANSCRIBED', value: String(meetings.filter((m) => m.transcription).length), c: '#7ee787' },
    { label: 'ANALYZED', value: String(meetings.filter((m) => m.analysis).length), c: '#c678dd' },
    { label: 'API_KEYS', value: `${keys}/4`, c: ready ? '#7ee787' : '#ff5370' },
  ]

  return (
    <motion.div
      className="glass-scrollbar"
      style={{ padding: '18px 28px 48px', height: '100%', overflow: 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <SectionDivider
        label="CONTROL_PANEL // ROOT ACCESS"
        right={
          <button
            onClick={() => setSettingsOpen(true)}
            style={{ fontSize: '9px', fontFamily: mono, color: '#22d3ee', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.35)', borderRadius: '5px', padding: '4px 10px', cursor: 'pointer', letterSpacing: '1px', fontWeight: 700 }}
          >
            ▸ EDIT_CONFIG
          </button>
        }
      />

      {/* real stat chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '18px' }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="atom-glass atom-glass-hover"
            style={{ padding: '16px 18px', fontFamily: mono }}
          >
            <div style={{ fontSize: '9px', color: 'rgba(171,178,191,0.5)', letterSpacing: '1px', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '30px', fontWeight: 800, color: s.c, textShadow: `0 0 16px ${s.c}44`, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '16px' }}>
        <ExpandableCard title="SYSTEM_RECON" accent="#22d3ee" subtitle="real hardware telemetry" tag="LIVE" minHeight={340}>
          <SystemRecon />
        </ExpandableCard>
        <ExpandableCard title="CONFIG.toml" accent="#c678dd" subtitle="active configuration" minHeight={340}>
          <ConfigConsole />
        </ExpandableCard>
      </div>
    </motion.div>
  )
}
