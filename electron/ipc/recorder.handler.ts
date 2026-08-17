import { ipcMain, app, protocol, net } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { store } from '../utils/store'
import { audioUrl, urlToPath } from '../utils/audioUrl'
import type { Meeting, OverlaySession } from '../../src/types'

const recordingsDir = () => {
  const dir = path.join(app.getPath('userData'), 'recordings')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export const getMeetings = (): Meeting[] => (store.get('meetings') as Meeting[]) ?? []

/** Overlay session → dashboard meeting. Lives in main so recording works with no dashboard open. */
export function sessionToMeeting(s: OverlaySession): Meeting {
  const utterances = s.utterances ?? []
  const words = utterances.flatMap((u) => u.words ?? [])
  // Real average, not a hardcoded 1 — the transcript card displays this figure
  const confidence = words.length
    ? words.reduce((sum, w) => sum + (w.confidence ?? 0), 0) / words.length
    : 0
  return {
    id: s.id,
    title: s.title,
    date: s.date,
    duration: s.duration,
    audioPath: s.audioPath || '',
    audioUrl: s.audioUrl || '',
    source: s.source,
    transcription: s.transcript
      ? {
          transcript: s.transcript,
          utterances,
          duration: s.duration,
          speakers: new Set(utterances.map((u) => u.speaker)).size || 1,
          confidence,
          words
        }
      : undefined,
    tags: [],
    notes: '',
    isTranscribing: false,
    isAnalyzing: false,
    transcriptionProgress: s.transcript ? 100 : 0
  }
}

export function saveMeeting(meeting: Meeting) {
  store.set('meetings', [meeting, ...getMeetings().filter((m) => m.id !== meeting.id)])
}

/**
 * A crash or a force-quit mid-meeting leaves audio on disk that no meeting points
 * at — unreachable from the UI forever. On launch, adopt those files so the
 * recording is still there to listen to. Returns how many were recovered.
 */
export function recoverOrphanRecordings(): number {
  let files: string[]
  try {
    files = fs.readdirSync(recordingsDir()).filter((f) => f.endsWith('.webm'))
  } catch {
    return 0
  }

  const claimed = new Set(getMeetings().map((m) => m.audioPath))
  let recovered = 0

  for (const name of files) {
    const file = path.join(recordingsDir(), name)
    if (claimed.has(file)) continue

    // Skip empty stubs from a failed start. Deliberately not deleted — never
    // remove a user's file on a guess.
    const stat = fs.statSync(file)
    if (stat.size === 0) continue

    saveMeeting({
      id: name.replace(/\.webm$/, ''),
      title: `Recovered — ${stat.mtime.toLocaleString()}`,
      date: stat.mtime.toISOString(),
      duration: 0, // real length is filled in by the player on first play
      audioPath: file,
      audioUrl: audioUrl(file),
      tags: [],
      notes: 'Recovered after EVES closed mid-recording. Audio is intact; run transcription to get the text.',
      isTranscribing: false,
      isAnalyzing: false,
      transcriptionProgress: 0
    })
    recovered++
  }

  return recovered
}

export function registerRecorderHandlers() {
  // Serve recorded files to the renderer without disabling webSecurity.
  protocol.handle('eves-audio', (req) => net.fetch('file:///' + urlToPath(req.url)))

  // Chunks land on disk as they arrive — a crash mid-meeting leaves a playable
  // file, not an empty one. The renderer serializes calls so order is preserved.
  const recordingFile = (id: string) => path.join(recordingsDir(), `${id}.webm`)

  ipcMain.handle('recording:append', (_e, args: { id: string; data: ArrayBuffer }) => {
    try {
      fs.appendFileSync(recordingFile(args.id), Buffer.from(args.data))
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to write chunk' }
    }
  })

  ipcMain.handle('recording:finish', (_e, id: string) => {
    const file = recordingFile(id)
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      return { success: false, error: 'Nothing was recorded' }
    }
    return { success: true, data: { path: file, url: audioUrl(file) } }
  })

  // Deleting a meeting must delete its recording too, or startup recovery would
  // resurrect it. Scoped to our own recordings dir: an uploaded meeting's
  // audioPath points at the user's own file and must never be touched.
  ipcMain.handle('recording:delete', (_e, audioPath: string) => {
    try {
      if (!audioPath) return { success: true }
      const resolved = path.resolve(audioPath)
      if (path.dirname(resolved) !== path.resolve(recordingsDir())) {
        return { success: true, data: { skipped: 'not an EVES recording' } }
      }
      if (fs.existsSync(resolved)) fs.unlinkSync(resolved)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Failed to delete recording' }
    }
  })

  // Meeting persistence — same conf store as settings.
  ipcMain.handle('meetings:get', () => getMeetings())
  ipcMain.handle('meetings:save', (_e, meetings: Meeting[]) => {
    store.set('meetings', meetings)
    return { success: true }
  })
}
