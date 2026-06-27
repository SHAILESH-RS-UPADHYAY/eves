import { useCallback } from 'react'
import { useMeetingsStore } from '../store/meetings.store'
import { useUIStore } from '../store/ui.store'
import { useSettingsStore } from '../store/settings.store'
import type { MeetingAnalysis } from '../types'

export function useGroq() {
  const updateMeeting = useMeetingsStore((s) => s.updateMeeting)
  const addToast = useUIStore((s) => s.addToast)
  const settings = useSettingsStore((s) => s.settings)

  const analyze = useCallback(
    async (meetingId: string, transcript: string) => {
      if (!settings.groqApiKey) {
        addToast({ type: 'error', title: 'No API Key', message: 'Add your Groq API key in Settings' })
        return
      }

      updateMeeting(meetingId, { isAnalyzing: true })
      addToast({ type: 'loading', title: 'Analyzing...', message: 'Extracting intelligence with Groq' })

      if (typeof window !== 'undefined' && window.eves) {
        const result = await window.eves.analyze({ transcript, apiKey: settings.groqApiKey })

        if (result.success && result.data) {
          updateMeeting(meetingId, {
            analysis: result.data as MeetingAnalysis,
            isAnalyzing: false
          })
          addToast({ type: 'success', title: 'Analysis Complete', message: (result.data as MeetingAnalysis).tldr })
          return result.data as MeetingAnalysis
        } else {
          updateMeeting(meetingId, { isAnalyzing: false })
          addToast({ type: 'error', title: 'Analysis Failed', message: result.error })
        }
      }
      return null
    },
    [updateMeeting, addToast, settings.groqApiKey]
  )

  return { analyze }
}
