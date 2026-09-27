import { motion } from 'framer-motion'
import { ChevronRight, Waves } from 'lucide-react'
import { GlassCard } from '../glass/GlassCard'
import { MeetingTypeBadge } from '../extras/MeetingTypeBadge'
import { useMeetingsStore } from '../../store/meetings.store'
import { useUIStore } from '../../store/ui.store'
import { format } from 'date-fns'
import type { MoodType } from '../../types'

const moodColors: Record<MoodType, string> = {
  POSITIVE: '#10B981',
  NEUTRAL: '#6B7280',
  TENSE: '#F43F5E',
  MIXED: '#F59E0B',
  PRODUCTIVE: '#06B6D4'
}

export function MeetingFeed() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const setPage = useUIStore((s) => s.setPage)
  const setActiveMeetingId = useUIStore((s) => s.setActiveMeeting)

  const handleOpen = (id: string) => {
    setActiveMeetingId(id)
    setPage('meetings')
  }

  return (
    <GlassCard style={{ padding: '16px', flex: 1, overflow: 'auto' }} className="glass-scrollbar">
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>Meeting Feed</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {meetings.length === 0 && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No meetings yet. Upload your first recording.</p>
        )}
        {meetings.map((m, i) => (
          <motion.div
            key={m.id}
            className="glass-card"
            style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', height: '72px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2, borderColor: 'rgba(124,58,237,0.3)' }}
            onClick={() => handleOpen(m.id)}
          >
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.1)' }}>
              <Waves size={18} style={{ color: 'var(--accent-violet)' }} className={m.isTranscribing ? 'animate-pulse' : ''} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {format(new Date(m.date), 'MMM d, yyyy')} • {Math.round(m.duration / 60)}min
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {m.analysis && <MeetingTypeBadge type={m.analysis.meetingType} />}
              {m.analysis && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: moodColors[m.analysis.overallMood] }} />
              )}
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
