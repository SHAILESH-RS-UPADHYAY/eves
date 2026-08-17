import { create } from 'zustand'
import type { Meeting, Tag } from '../types'

interface MeetingsStore {
  meetings: Meeting[]
  activeMeetingId: string | null

  loadMeetings: () => Promise<void>
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (id: string, partial: Partial<Meeting>) => void
  deleteMeeting: (id: string) => void
  setActiveMeeting: (id: string | null) => void
  getActiveMeeting: () => Meeting | null
  addTag: (meetingId: string, tag: Tag) => void
  removeTag: (meetingId: string, tagId: string) => void
  updateNotes: (meetingId: string, notes: string) => void
}

export const useMeetingsStore = create<MeetingsStore>((set, get) => ({
  meetings: [],
  activeMeetingId: null,

  loadMeetings: async () => {
    const saved = await window.eves?.getMeetings()
    if (saved?.length) set({ meetings: saved })
  },

  // Dedupe by id — main persists overlay sessions too, so one can arrive twice
  addMeeting: (meeting) =>
    set((state) => ({
      meetings: [meeting, ...state.meetings.filter((m) => m.id !== meeting.id)]
    })),

  updateMeeting: (id, partial) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === id ? { ...m, ...partial } : m
      )
    })),

  deleteMeeting: (id) =>
    set((state) => {
      // Drop the audio too, or startup recovery re-adds it as a "Recovered" meeting.
      // Main ignores paths outside EVES's own recordings dir.
      const gone = state.meetings.find((m) => m.id === id)
      if (gone?.audioPath) window.eves?.deleteRecording(gone.audioPath)
      return {
        meetings: state.meetings.filter((m) => m.id !== id),
        activeMeetingId: state.activeMeetingId === id ? null : state.activeMeetingId
      }
    }),

  setActiveMeeting: (id) => set({ activeMeetingId: id }),

  getActiveMeeting: () => {
    const { meetings, activeMeetingId } = get()
    return meetings.find((m) => m.id === activeMeetingId) ?? null
  },

  addTag: (meetingId, tag) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId ? { ...m, tags: [...m.tags, tag] } : m
      )
    })),

  removeTag: (meetingId, tagId) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId
          ? { ...m, tags: m.tags.filter((t) => t.id !== tagId) }
          : m
      )
    })),

  updateNotes: (meetingId, notes) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId ? { ...m, notes } : m
      )
    }))
}))

// Persist every change — meetings survive a restart.
// ponytail: whole list rewritten per change; fine at hundreds of meetings.
useMeetingsStore.subscribe((state, prev) => {
  if (state.meetings !== prev.meetings) window.eves?.saveMeetings(state.meetings)
})
