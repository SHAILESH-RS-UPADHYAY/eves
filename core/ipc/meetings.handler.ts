import { BrowserWindow, ipcMain } from '../runtime'
import * as fs from 'fs'
import { listMeetings, putMeeting, patchMeeting, removeMeeting } from '../utils/meetings'
import { isOwnRecording } from './recorder.handler'
import type { Meeting, PopupSession } from '../../src/types'

/** Popup session → meeting. Lives in main so recording works with no dashboard open. */
function sessionToMeeting(s: PopupSession): Meeting {
  const utterances = s.utterances ?? []
  const words = utterances.flatMap((u) => u.words ?? [])
  return {
    id: s.id,
    title: s.title,
    date: s.date,
    duration: s.duration,
    audioPath: s.audioPath || '',
    audioUrl: s.audioUrl || '',
    source: s.source,
    peaks: s.peaks,
    // No live transcript (no key / network down)? The audio is still saved and
    // can be transcribed from the meeting page.
    transcription: utterances.length
      ? {
          transcript: s.transcript,
          utterances,
          duration: s.duration,
          speakers: new Set(utterances.map((u) => u.speaker)).size,
          confidence: words.length ? words.reduce((sum, w) => sum + (w.confidence ?? 0), 0) / words.length : 0
        }
      : undefined,
    tags: [],
    notes: '',
    isTranscribing: false,
    isAnalyzing: false,
    transcriptionProgress: utterances.length ? 100 : 0
  }
}

export function registerMeetingHandlers() {
  ipcMain.handle('meetings:list', () => listMeetings())
  ipcMain.handle('meetings:put', (_e, meeting: Meeting) => {
    putMeeting(meeting)
    return { success: true }
  })
  ipcMain.handle('meetings:patch', (_e, id: string, partial: Partial<Meeting>) => ({ success: !!patchMeeting(id, partial) }))

  // Deleting a meeting deletes its recording too, or startup recovery would
  // resurrect it as a "Recovered" meeting.
  ipcMain.handle('meetings:delete', (_e, id: string) => {
    const gone = removeMeeting(id)
    if (gone?.audioPath && gone.source !== 'upload' && isOwnRecording(gone.audioPath)) fs.rmSync(gone.audioPath, { force: true })
    return { success: true }
  })

  // Popup → disk (always) → dashboard (if it happens to be open)
  ipcMain.handle('popup:save-session', (_e, session: PopupSession) => {
    const meeting = sessionToMeeting(session)
    putMeeting(meeting)
    BrowserWindow.getAllWindows().forEach((w) => w.webContents.send('session-saved', meeting))
    return { success: true, data: meeting.id }
  })
}
