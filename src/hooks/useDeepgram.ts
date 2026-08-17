import { useCallback } from 'react'
import { useMeetingsStore } from '../store/meetings.store'
import { useUIStore } from '../store/ui.store'
import { useSettingsStore } from '../store/settings.store'
import type { TranscriptionResult } from '../types'

export function useDeepgram() {
  const updateMeeting = useMeetingsStore((s) => s.updateMeeting)
  const addToast = useUIStore((s) => s.addToast)
  const settings = useSettingsStore((s) => s.settings)

  const transcribe = useCallback(
    async (meetingId: string, filePath: string) => {
      if (!settings.deepgramApiKey) {
        addToast({ type: 'error', title: 'No API Key', message: 'Add your Deepgram API key in Settings' })
        return
      }

      updateMeeting(meetingId, { isTranscribing: true, transcriptionProgress: 0 })
      addToast({ type: 'loading', title: 'Transcribing...', message: 'Processing audio with Deepgram nova-2' })

      if (typeof window !== 'undefined' && window.eves) {
        window.eves.onTranscribeProgress((pct) => {
          updateMeeting(meetingId, { transcriptionProgress: pct })
        })

        const result = await window.eves.transcribe({ filePath, apiKey: settings.deepgramApiKey, language: settings.defaultLanguage })

        if (result.success && result.data) {
          updateMeeting(meetingId, {
            transcription: result.data as TranscriptionResult,
            isTranscribing: false,
            transcriptionProgress: 100,
            duration: (result.data as TranscriptionResult).duration
          })
          addToast({ type: 'success', title: 'Transcription Complete', message: `${(result.data as TranscriptionResult).speakers} speakers detected` })
          return result.data as TranscriptionResult
        } else {
          updateMeeting(meetingId, { isTranscribing: false, transcriptionProgress: 0 })
          addToast({ type: 'error', title: 'Transcription Failed', message: result.error })
        }
      }
      return null
    },
    [updateMeeting, addToast, settings.deepgramApiKey]
  )

  return { transcribe }
}
