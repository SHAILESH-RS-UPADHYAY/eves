import { useCallback } from 'react'
import { useMeetingsStore } from '../store/meetings.store'
import { useUIStore } from '../store/ui.store'
import type { MeetingAnalysis } from '../types'

/** Runs the EVES brain summary for a meeting — main reads the transcript from disk and saves the result. */
export function useAnalyze() {
  const updateMeeting = useMeetingsStore((s) => s.updateMeeting)
  const applyLocal = useMeetingsStore((s) => s.applyLocal)
  const addToast = useUIStore((s) => s.addToast)
  const removeToast = useUIStore((s) => s.removeToast)

  return useCallback(async (meetingId: string): Promise<MeetingAnalysis | null> => {
    if (!window.eves) return null
    await useMeetingsStore.getState().flushMeeting(meetingId) // main reads the transcript from disk
    updateMeeting(meetingId, { isAnalyzing: true })
    const toast = addToast({ type: 'loading', title: 'EVES brain is reading the meeting…', message: 'Summary · decisions · action items' })
    const res = await window.eves.analyze(meetingId)
    removeToast(toast)
    if (res.success && res.data) {
      applyLocal(meetingId, { analysis: res.data, isAnalyzing: false })
      addToast({ type: 'success', title: 'Analysis complete', message: res.data.tldr })
      return res.data
    }
    updateMeeting(meetingId, { isAnalyzing: false })
    addToast({ type: 'error', title: 'Analysis failed', message: res.error, duration: 8000 })
    return null
  }, [updateMeeting, applyLocal, addToast, removeToast])
}
