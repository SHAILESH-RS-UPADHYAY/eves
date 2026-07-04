import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { MeetingPage } from './components/meeting/MeetingPage'
import { TranscriptView } from './components/meeting/TranscriptView'
import { DriveSync } from './components/integrations/DriveSync'
import { NotionExport } from './components/integrations/NotionExport'
import { SettingsModal } from './components/settings/SettingsModal'
import { IntegrationsPage } from './components/integrations/IntegrationsPage'
import { TranscriptsPage } from './components/meeting/TranscriptsPage'
import { ControlPanelPage } from './components/settings/ControlPanelPage'
import { useUIStore } from './store/ui.store'
import { useMeetingsStore } from './store/meetings.store'
import { useSettingsStore } from './store/settings.store'
import { EmptyState } from './components/extras/EmptyState'
import type { Meeting } from './types'

export function App() {
  const currentPage = useUIStore((s) => s.currentPage)
  const meetings = useMeetingsStore((s) => s.meetings)
  const activeMeetingId = useUIStore((s) => s.activeMeetingId)
  const activeMeeting = meetings.find((m) => m.id === activeMeetingId)
  const addMeeting = useMeetingsStore((s) => s.addMeeting)
  const addToast = useUIStore((s) => s.addToast)
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  // Load saved settings (API keys etc.) from disk on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Listen for sessions saved from the overlay (Ctrl+Space)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).eves?.onSessionSaved) {
      ;(window as any).eves.onSessionSaved((session: any) => {
        const meeting: Meeting = {
          id: session.id,
          title: session.title,
          date: session.date,
          duration: session.duration,
          audioPath: '',
          tags: [],
          notes: session.transcript || '',
          isTranscribing: false,
          isAnalyzing: false,
          transcriptionProgress: 0
        }
        addMeeting(meeting)
        addToast({ type: 'success', title: 'Session saved from overlay', message: `${Math.round(session.duration / 60)}min • ${session.source} audio` })
      })
    }
  }, [addMeeting, addToast])

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
            {currentPage === 'transcripts' && <TranscriptsPage />}
            {currentPage === 'integrations' && <IntegrationsPage />}
            {currentPage === 'settings' && <ControlPanelPage />}
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <SettingsModal />
    </>
  )
}
