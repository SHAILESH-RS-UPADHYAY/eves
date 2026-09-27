import { create } from 'zustand'
import type { NavPage, Toast } from '../types'

interface UIStore {
  currentPage: NavPage
  activeMeetingId: string | null
  isCommandPaletteOpen: boolean
  isSettingsOpen: boolean
  isShortcutsOpen: boolean
  toasts: Toast[]

  setPage: (page: NavPage) => void
  setActiveMeeting: (id: string | null) => void
  setCommandPaletteOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
  /** Returns the id so a 'loading' toast can be dismissed when its job ends */
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentPage: 'dashboard',
  activeMeetingId: null,
  isCommandPaletteOpen: false,
  isSettingsOpen: false,
  isShortcutsOpen: false,
  toasts: [],

  setPage: (page) => set({ currentPage: page }),
  setActiveMeeting: (id) => set({ activeMeetingId: id }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),

  addToast: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((state) => ({ toasts: [...state.toasts, { id, duration: 4000, ...toast }].slice(-3) }))
    return id
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))
