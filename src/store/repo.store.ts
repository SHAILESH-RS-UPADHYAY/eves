import { create } from 'zustand'
import type { RepoInfo, RepoSynthesisResult } from '../types'

interface RepoStore {
  attachedRepoPath: string | null
  repoInfo: RepoInfo | null
  selectedMeetingId: string | null
  customTranscript: string
  isScanning: boolean
  isSynthesizing: boolean
  synthesisResult: RepoSynthesisResult | null
  history: RepoSynthesisResult[]

  setAttachedRepoPath: (path: string | null) => void
  setRepoInfo: (info: RepoInfo | null) => void
  setSelectedMeetingId: (id: string | null) => void
  setCustomTranscript: (text: string) => void
  setScanning: (scanning: boolean) => void
  setSynthesizing: (synthesizing: boolean) => void
  setSynthesisResult: (result: RepoSynthesisResult | null) => void
  addHistory: (result: RepoSynthesisResult) => void
  clearRepo: () => void
}

export const useRepoStore = create<RepoStore>((set) => ({
  attachedRepoPath: null,
  repoInfo: null,
  selectedMeetingId: null,
  customTranscript: '',
  isScanning: false,
  isSynthesizing: false,
  synthesisResult: null,
  history: [],

  setAttachedRepoPath: (path) => set({ attachedRepoPath: path }),
  setRepoInfo: (info) => set({ repoInfo: info }),
  setSelectedMeetingId: (id) => set({ selectedMeetingId: id }),
  setCustomTranscript: (text) => set({ customTranscript: text }),
  setScanning: (scanning) => set({ isScanning: scanning }),
  setSynthesizing: (synthesizing) => set({ isSynthesizing: synthesizing }),
  setSynthesisResult: (result) => set({ synthesisResult: result }),
  addHistory: (result) =>
    set((state) => ({
      history: [result, ...state.history.filter((h) => h.id !== result.id)].slice(0, 10)
    })),
  clearRepo: () =>
    set({
      attachedRepoPath: null,
      repoInfo: null,
      synthesisResult: null
    })
}))
