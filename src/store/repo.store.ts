import { create } from 'zustand'
import type { RepoInfo, RepoSynthesisResult } from '../types'

/** company = the repo you work on · vault = the reference repo (skills, standards) */
export type RepoRole = 'company' | 'vault'

interface RepoStore {
  info: Record<RepoRole, RepoInfo | null>
  scanning: Record<RepoRole, boolean>
  selectedMeetingId: string | null
  customTranscript: string
  isSynthesizing: boolean
  synthesisResult: RepoSynthesisResult | null

  setInfo: (role: RepoRole, info: RepoInfo | null) => void
  setScanning: (role: RepoRole, scanning: boolean) => void
  setSelectedMeetingId: (id: string | null) => void
  setCustomTranscript: (text: string) => void
  setSynthesizing: (synthesizing: boolean) => void
  setSynthesisResult: (result: RepoSynthesisResult | null) => void
}

export const useRepoStore = create<RepoStore>((set) => ({
  info: { company: null, vault: null },
  scanning: { company: false, vault: false },
  selectedMeetingId: null,
  customTranscript: '',
  isSynthesizing: false,
  synthesisResult: null,

  setInfo: (role, info) => set((s) => ({ info: { ...s.info, [role]: info } })),
  setScanning: (role, scanning) => set((s) => ({ scanning: { ...s.scanning, [role]: scanning } })),
  setSelectedMeetingId: (id) => set({ selectedMeetingId: id }),
  setCustomTranscript: (text) => set({ customTranscript: text }),
  setSynthesizing: (synthesizing) => set({ isSynthesizing: synthesizing }),
  setSynthesisResult: (result) => set({ synthesisResult: result })
}))
