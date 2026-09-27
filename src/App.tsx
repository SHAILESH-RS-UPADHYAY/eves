import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { MeetingPage } from './components/meeting/MeetingPage'
import { SettingsModal } from './components/settings/SettingsModal'
import { IntegrationsPage } from './components/integrations/IntegrationsPage'
import { TranscriptsPage } from './components/meeting/TranscriptsPage'
import { RepoIntelPage } from './components/repo/RepoIntelPage'
import { ControlPanelPage } from './components/settings/ControlPanelPage'
import { useUIStore } from './store/ui.store'
import { useMeetingsStore } from './store/meetings.store'
import { useSettingsStore } from './store/settings.store'
import { useGroq } from './hooks/useGroq'
import type { Meeting } from './types'

export function App() {
  const currentPage = useUIStore((s) => s.currentPage)
  const upsertMeeting = useMeetingsStore((s) => s.upsertMeeting)
  const loadMeetings = useMeetingsStore((s) => s.loadMeetings)
  const addToast = useUIStore((s) => s.addToast)
  const loadSettings = useSettingsStore((s) => s.loadSettings)
  const { analyze } = useGroq()
  const analyzeRef = useRef(analyze)
  analyzeRef.current = analyze

  // Load saved settings (API keys etc.) + past meetings from disk on mount
  useEffect(() => {
    loadSettings()
    loadMeetings()
  }, [loadSettings, loadMeetings])

  // Listen for recorded sessions handed over from the popup.
  // Registered once — a second listener would duplicate every meeting.
  useEffect(() => {
    // Main already mapped + persisted it — the dashboard just catches up
    return window.eves?.onSessionSaved((meeting: Meeting) => {
      upsertMeeting(meeting)
      addToast({
        type: 'success',
        title: 'Meeting recorded',
        message: `${Math.round(meeting.duration / 60)}min • ${meeting.source} audio${meeting.audioPath ? ' • audio saved' : ''}`
      })

      // Pull out action items straight away — the reason you recorded it
      const transcript = meeting.transcription?.transcript
      if (transcript && useSettingsStore.getState().settings.autoAnalyze) {
        analyzeRef.current(meeting.id, transcript)
      }
    })
  }, [])

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
            {currentPage === 'repo' && <RepoIntelPage />}
            {currentPage === 'integrations' && <IntegrationsPage />}
            {currentPage === 'settings' && <ControlPanelPage />}
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <SettingsModal />
    </>
  )
}
