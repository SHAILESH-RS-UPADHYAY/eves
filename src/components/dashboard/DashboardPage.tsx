import { motion } from 'framer-motion'
import { StatsRow } from './StatsRow'
import { MeetingFeed } from './MeetingFeed'
import { RecentInsights } from './RecentInsights'
import { EmptyState } from '../extras/EmptyState'
import { useMeetingsStore } from '../../store/meetings.store'
import { useUIStore } from '../../store/ui.store'

export function DashboardPage() {
  const meetings = useMeetingsStore((s) => s.meetings)
  const setPage = useUIStore((s) => s.setPage)

  const totalMeetings = meetings.length
  const audioHours = meetings.reduce((sum, m) => sum + m.duration, 0) / 3600
  const pendingActions = meetings
    .filter((m) => m.analysis)
    .reduce((sum, m) => sum + m.analysis!.actionItems.filter((a) => !a.completed).length, 0)
  const speakers = new Set(
    meetings.filter((m) => m.analysis).flatMap((m) => m.analysis!.speakerProfiles.map((s) => s.name))
  ).size

  if (totalMeetings === 0) {
    return (
      <motion.div
        style={{ padding: '32px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 12 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <EmptyState
          message="No meetings yet"
          subtext="Upload your first recording to unlock AI-powered insights"
          onAction={() => setPage('meetings')}
          actionLabel="Upload your first recording"
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      style={{ padding: '32px', height: '100%' }}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <StatsRow totalMeetings={totalMeetings} audioHours={Math.round(audioHours * 10) / 10} pendingActions={pendingActions} speakers={speakers} />
      <div style={{ display: 'flex', gap: '20px', height: 'calc(100% - 140px)' }}>
        <div style={{ flex: 1 }}>
          <MeetingFeed />
        </div>
        <RecentInsights />
      </div>
    </motion.div>
  )
}
