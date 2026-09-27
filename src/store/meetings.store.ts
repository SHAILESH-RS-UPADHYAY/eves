import { create } from 'zustand'
import type { Meeting, Tag } from '../types'

interface MeetingsStore {
  meetings: Meeting[]

  loadMeetings: () => Promise<void>
  /** In-memory only — for meetings main already wrote (popup sessions, main-side jobs) */
  upsertMeeting: (meeting: Meeting) => void
  /** New meeting created in the dashboard (uploads) — memory + disk */
  createMeeting: (meeting: Meeting) => void
  updateMeeting: (id: string, partial: Partial<Meeting>) => void
  /** Memory only — for fields main already wrote to disk (analysis, digest) */
  applyLocal: (id: string, partial: Partial<Meeting>) => void
  deleteMeeting: (id: string) => void
  /** Write pending edits now — before main reads the meeting from disk */
  flushMeeting: (id: string) => Promise<unknown>
  addTag: (meetingId: string, tag: Tag) => void
  removeTag: (meetingId: string, tagId: string) => void
  updateNotes: (meetingId: string, notes: string) => void
}

// UI-only flags: never sent to disk (main strips them too).
const TRANSIENT = new Set<keyof Meeting>(['isTranscribing', 'isAnalyzing', 'transcriptionProgress'])

// Coalesce rapid edits (typing notes) into one field-level patch per meeting.
const pending = new Map<string, Partial<Meeting>>()
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function flush(id: string) {
  clearTimeout(timers.get(id))
  timers.delete(id)
  const patch = pending.get(id)
  pending.delete(id)
  return patch ? window.eves?.patchMeeting(id, patch) : Promise.resolve()
}

function persist(id: string, partial: Partial<Meeting>) {
  const fields = Object.fromEntries(Object.entries(partial).filter(([k]) => !TRANSIENT.has(k as keyof Meeting)))
  if (!Object.keys(fields).length) return
  pending.set(id, { ...pending.get(id), ...fields })
  clearTimeout(timers.get(id))
  timers.set(id, setTimeout(() => flush(id), 400))
}

export const useMeetingsStore = create<MeetingsStore>((set, get) => ({
  meetings: [],

  loadMeetings: async () => {
    const saved = await window.eves?.listMeetings()
    if (saved) set({ meetings: saved })
  },

  // Dedupe by id — a session can arrive both from disk and from the popup event
  upsertMeeting: (meeting) =>
    set((state) => ({ meetings: [meeting, ...state.meetings.filter((m) => m.id !== meeting.id)] })),

  createMeeting: (meeting) => {
    get().upsertMeeting(meeting)
    window.eves?.putMeeting(meeting)
  },

  updateMeeting: (id, partial) => {
    get().applyLocal(id, partial)
    persist(id, partial)
  },

  applyLocal: (id, partial) =>
    set((state) => ({ meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...partial } : m)) })),

  deleteMeeting: (id) => {
    clearTimeout(timers.get(id))
    pending.delete(id)
    set((state) => ({ meetings: state.meetings.filter((m) => m.id !== id) }))
    // main removes the file and — if it is an EVES recording — the audio
    window.eves?.deleteMeeting(id)
  },

  flushMeeting: (id) => Promise.resolve(flush(id)),

  addTag: (meetingId, tag) => {
    const m = get().meetings.find((x) => x.id === meetingId)
    if (m) get().updateMeeting(meetingId, { tags: [...m.tags, tag] })
  },

  removeTag: (meetingId, tagId) => {
    const m = get().meetings.find((x) => x.id === meetingId)
    if (m) get().updateMeeting(meetingId, { tags: m.tags.filter((t) => t.id !== tagId) })
  },

  updateNotes: (meetingId, notes) => get().updateMeeting(meetingId, { notes })
}))
