import { create } from 'zustand'
import type { Meeting, Tag } from '../types'

interface MeetingsStore {
  meetings: Meeting[]
  activeMeetingId: string | null

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

  addMeeting: (meeting) =>
    set((state) => ({ meetings: [meeting, ...state.meetings] })),

  updateMeeting: (id, partial) =>
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === id ? { ...m, ...partial } : m
      )
    })),

  deleteMeeting: (id) =>
    set((state) => ({
      meetings: state.meetings.filter((m) => m.id !== id),
      activeMeetingId: state.activeMeetingId === id ? null : state.activeMeetingId
    })),

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
