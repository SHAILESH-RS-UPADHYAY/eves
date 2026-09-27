import { useCallback } from 'react'
import { useMeetingsStore } from '../store/meetings.store'
import { useUIStore } from '../store/ui.store'
import { useSettingsStore } from '../store/settings.store'
import type { TranscriptionResult } from '../types'

export function useDeepgram() {
  const updateMeeting = useMeetingsStore((s) => s.updateMeeting)
  const addToast = useUIStore((s) => s.addToast)

  const transcribe = useCallback(
    async (meetingId: string, filePath: string): Promise<TranscriptionResult | null> => {
      const { deepgramApiKey, defaultLanguage } = useSettingsStore.getState().settings
      if (!deepgramApiKey) {
        addToast({ type: 'error', title: 'No API Key', message: 'Add your Deepgram API key in Settings' })
        return null
      }
      if (!window.eves) return null

      updateMeeting(meetingId, { isTranscribing: true, transcriptionProgress: 0 })
      addToast({ type: 'loading', title: 'Transcribing...', message: 'Deepgram is processing the recording' })
      const stopProgress = window.eves.onTranscribeProgress((pct) => updateMeeting(meetingId, { transcriptionProgress: pct }))
      try {
        const result = await window.eves.transcribe({ filePath, apiKey: deepgramApiKey, language: defaultLanguage })
        if (result.success && result.data) {
          updateMeeting(meetingId, {
            transcription: result.data,
            isTranscribing: false,
            transcriptionProgress: 100,
            duration: result.data.duration
          })
          addToast({ type: 'success', title: 'Transcription Complete', message: `${result.data.speakers} speakers detected` })
          return result.data
        }
        updateMeeting(meetingId, { isTranscribing: false, transcriptionProgress: 0 })
        addToast({ type: 'error', title: 'Transcription Failed', message: result.error })
        return null
      } finally {
        stopProgress()
      }
    },
    [updateMeeting, addToast]
  )

  return { transcribe }
}
