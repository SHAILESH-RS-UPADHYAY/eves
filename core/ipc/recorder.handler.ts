import { ipcMain, app, protocol } from '../runtime'
import * as fs from 'fs'
import * as path from 'path'
import { Readable } from 'stream'
import { audioUrl, byteRange, urlToPath } from '../utils/audioUrl'
import { listMeetings, putMeeting } from '../utils/meetings'

let dir: string | null = null
export function recordingsDir() {
  if (!dir) {
    dir = path.join(app.getPath('userData'), 'recordings')
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

/** Ids come from the renderer — never let one become a path. */
const recordingFile = (id: string) => path.join(recordingsDir(), `${id.replace(/[^\w.-]/g, '_')}.webm`)

/** Only EVES's own recordings may be deleted — an uploaded meeting points at the user's own file. */
export const isOwnRecording = (file: string) => path.dirname(path.resolve(file)) === path.resolve(recordingsDir())

const AUDIO_TYPES: Record<string, string> = {
  '.webm': 'audio/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'audio/mp4',
  '.ogg': 'audio/ogg'
}

/**
 * Serves a local audio file with HTTP range support, so the player streams and
 * seeks inside multi-hour recordings instead of loading them whole. Audio types
 * only — the scheme must not become a way to read arbitrary files.
 */
function serveAudio(file: string, range: string | null): Response {
  const type = AUDIO_TYPES[path.extname(file).toLowerCase()]
  let size: number
  try {
    size = fs.statSync(file).size
  } catch {
    return new Response('Not found', { status: 404 })
  }
  if (!type) return new Response('Forbidden', { status: 403 })

  const body = (start: number, end: number) =>
    Readable.toWeb(fs.createReadStream(file, { start, end })) as ReadableStream<Uint8Array>
  const span = byteRange(range, size)
  if (span === undefined) {
    return new Response(body(0, size - 1), {
      headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' }
    })
  }
  if (span === null) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
  const { start, end } = span
  return new Response(body(start, end), {
    status: 206,
    headers: {
      'Content-Type': type,
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes'
    }
  })
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

  const claimed = new Set(listMeetings().map((m) => path.resolve(m.audioPath || '.')))
  let recovered = 0
  for (const name of files) {
    const file = path.join(recordingsDir(), name)
    if (claimed.has(path.resolve(file))) continue
    // Skip empty stubs from a failed start. Deliberately not deleted — never
    // remove a user's file on a guess.
    const stat = fs.statSync(file)
    if (stat.size === 0) continue

    putMeeting({
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
  protocol.handle('eves-audio', (req) => serveAudio(urlToPath(req.url), req.headers.get('range')))

  // Chunks land on disk as they arrive — a crash mid-meeting leaves a playable
  // file, not an empty one. The popup serializes calls so order is preserved.
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
}
