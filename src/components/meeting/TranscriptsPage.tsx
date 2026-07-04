import { motion } from 'framer-motion'
import { SectionDivider, ExpandableCard, DecryptStandby } from '../hacker/CyberKit'
import { TranscriptView } from './TranscriptView'
import { useMeetingsStore } from '../../store/meetings.store'
import { useUIStore } from '../../store/ui.store'

const mono = '"Courier New", Consolas, monospace'

export function TranscriptsPage() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const activeId = useUIStore((s) => s.activeMeetingId)
  const active = meetings.find((m) => m.id === activeId)
  const decrypted = meetings.filter((m) => m.transcription).length

  return (
    <motion.div
      className="glass-scrollbar"
      style={{ padding: '18px 28px 48px', height: '100%', overflow: 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <SectionDivider
        label="TRANSCRIPT_DB // SIGNAL INTERCEPT"
        right={<span style={{ fontSize: '9px', fontFamily: mono, color: 'rgba(171,178,191,0.45)' }}>{decrypted} decrypted · {meetings.length} archived</span>}
      />

      {active?.transcription ? (
        <ExpandableCard
          title={`INTERCEPT :: ${active.title || 'session'}`}
          accent="#7ee787"
          subtitle={`${active.transcription.speakers} speakers · ${Math.round(active.transcription.duration / 60)}min · ${Math.round(active.transcription.confidence * 100)}% conf`}
          tag="LIVE"
          minHeight={480}
        >
          <TranscriptView transcription={active.transcription} standalone />
        </ExpandableCard>
      ) : (
        <DecryptStandby archived={meetings.length} />
      )}
    </motion.div>
  )
}
