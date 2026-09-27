import * as fs from 'fs'
import * as path from 'path'
import { app } from '../runtime'
import { store } from './store'
import type { Meeting } from '../../src/types'

// One JSON file per meeting: saving a note rewrites that meeting only, not the
// whole archive (the old single-file store rewrote every meeting on every keystroke).
// ponytail: the dashboard still loads every meeting at startup (~1–2 MB per 2h
// transcript); load transcripts lazily if the archive grows into the hundreds.

let root: string | null = null
export function meetingsDir() {
  if (!root) {
    root = path.join(app.getPath('userData'), 'meetings')
    fs.mkdirSync(root, { recursive: true })
  }
  return root
}

/** Ids come from the renderer — never let one become a path. */
const fileOf = (id: string) => path.join(meetingsDir(), `${id.replace(/[^\w.-]/g, '_')}.json`)

/** Older builds saved this text as the "transcript" of sessions where nothing was transcribed. */
const PLACEHOLDER = '(no transcript captured yet)'

/** UI flags are never persisted — a crash mid-transcription must not leave a meeting stuck "transcribing". */
function hydrate(m: Meeting): Meeting {
  const fake = m.transcription?.transcript === PLACEHOLDER && !m.transcription.utterances?.length
  const transcription = fake ? undefined : m.transcription
  return { ...m, transcription, isTranscribing: false, isAnalyzing: false, transcriptionProgress: transcription ? 100 : 0 }
}

function write(meeting: Meeting) {
  const { isTranscribing: _t, isAnalyzing: _a, transcriptionProgress: _p, ...persisted } = meeting
  const file = fileOf(meeting.id)
  // write-then-rename: a crash mid-write can never leave a half-written meeting
  fs.writeFileSync(file + '.tmp', JSON.stringify(persisted))
  fs.renameSync(file + '.tmp', file)
}

function read(file: string): Meeting | null {
  try {
    return hydrate(JSON.parse(fs.readFileSync(file, 'utf8')))
  } catch {
    return null
  }
}

export function listMeetings(): Meeting[] {
  return fs.readdirSync(meetingsDir())
    .filter((f) => f.endsWith('.json'))
    .map((f) => read(path.join(meetingsDir(), f)))
    .filter((m): m is Meeting => m !== null)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export const getMeeting = (id: string) => read(fileOf(id))

export function putMeeting(meeting: Meeting) {
  write(meeting)
}

/** Field-level merge on disk — concurrent writers (renderer notes, main-side analysis) never clobber each other. */
export function patchMeeting(id: string, partial: Partial<Meeting>): Meeting | null {
  const current = getMeeting(id)
  if (!current) return null
  const next = { ...current, ...partial, id }
  write(next)
  return next
}

export function removeMeeting(id: string): Meeting | null {
  const current = getMeeting(id)
  fs.rmSync(fileOf(id), { force: true })
  return current
}

/**
 * One-time move from the single conf array to per-meeting files. The legacy
 * array is kept as a backup file before the conf key is dropped, and the flat
 * duplicate word list is dropped (every word already lives in its utterance).
 */
export function migrateLegacyMeetings() {
  const legacy = store.get('meetings') as Meeting[] | undefined
  if (!legacy) return
  fs.writeFileSync(path.join(meetingsDir(), '_legacy-backup.json.bak'), JSON.stringify(legacy))
  for (const m of legacy) {
    if (fs.existsSync(fileOf(m.id))) continue
    delete (m.transcription as { words?: unknown } | undefined)?.words
    write(m)
  }
  store.delete('meetings')
  console.log(`Moved ${legacy.length} meeting(s) to per-meeting storage`)
}
