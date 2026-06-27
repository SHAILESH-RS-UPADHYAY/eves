import { create } from 'zustand'
import type { NavPage, Toast } from '../types'

interface UIStore {
  currentPage: NavPage
  activeMeetingId: string | null
  isCommandPaletteOpen: boolean
  isSettingsOpen: boolean
  isShortcutsOpen: boolean
  isStealthActive: boolean
  toasts: Toast[]

  setPage: (page: NavPage) => void
  setActiveMeeting: (id: string | null) => void
  setCommandPaletteOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setShortcutsOpen: (open: boolean) => void
  setStealthActive: (active: boolean) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  currentPage: 'dashboard',
  activeMeetingId: null,
  isCommandPaletteOpen: false,
  isSettingsOpen: false,
  isShortcutsOpen: false,
  isStealthActive: false,
  toasts: [],

  setPage: (page) => set({ currentPage: page }),
  setActiveMeeting: (id) => set({ activeMeetingId: id }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
  setStealthActive: (active) => set({ isStealthActive: active }),

  addToast: (toast) =>
    set((state) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const newToast: Toast = { id, duration: 4000, ...toast }
      const toasts = [...state.toasts, newToast].slice(-3)
      return { toasts }
    }),

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))
