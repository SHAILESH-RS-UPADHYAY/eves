import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { MeetingPage } from './components/meeting/MeetingPage'
import { TranscriptView } from './components/meeting/TranscriptView'
import { DriveSync } from './components/integrations/DriveSync'
import { NotionExport } from './components/integrations/NotionExport'
import { SettingsModal } from './components/settings/SettingsModal'
import { useUIStore } from './store/ui.store'
import { useMeetingsStore } from './store/meetings.store'
import { EmptyState } from './components/extras/EmptyState'

export function App() {
  const currentPage = useUIStore((s) => s.currentPage)
  const meetings = useMeetingsStore((s) => s.meetings)
  const activeMeetingId = useUIStore((s) => s.activeMeetingId)
  const activeMeeting = meetings.find((m) => m.id === activeMeetingId)

  return (
    <>
      <AppShell>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            style={{ height: '100%' }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {currentPage === 'dashboard' && <DashboardPage />}
            {currentPage === 'meetings' && <MeetingPage />}
            {currentPage === 'transcripts' && (
              activeMeeting?.transcription ? (
                <div style={{ padding: '32px', height: '100%' }}>
                  <TranscriptView transcription={activeMeeting.transcription} standalone />
                </div>
              ) : (
                <EmptyState message="No transcript available" subtext="Select a meeting that has been transcribed" />
              )
            )}
            {currentPage === 'integrations' && (
              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <DriveSync />
                <NotionExport />
              </div>
            )}
            {currentPage === 'settings' && <DashboardPage />}
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <SettingsModal />
    </>
  )
}
