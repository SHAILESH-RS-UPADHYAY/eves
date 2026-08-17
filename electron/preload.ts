import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, Meeting, MeetingAnalysis } from '../src/types'

const api = {
  // ─── Transcription ──────────────────────────────────────
  transcribe: (args: { filePath: string; apiKey: string; language?: string }) =>
    ipcRenderer.invoke('deepgram:transcribe', args),
  onTranscribeProgress: (callback: (pct: number) => void) =>
    ipcRenderer.on('deepgram:progress', (_e, pct) => callback(pct)),

  // ─── Recording ──────────────────────────────────────────
  appendRecording: (args: { id: string; data: ArrayBuffer }) =>
    ipcRenderer.invoke('recording:append', args) as Promise<{ success: boolean; error?: string }>,
  finishRecording: (id: string) =>
    ipcRenderer.invoke('recording:finish', id) as Promise<{ success: boolean; data?: { path: string; url: string }; error?: string }>,
  deleteRecording: (audioPath: string) =>
    ipcRenderer.invoke('recording:delete', audioPath) as Promise<{ success: boolean; error?: string }>,

  // ─── Meeting persistence ────────────────────────────────
  getMeetings: () => ipcRenderer.invoke('meetings:get') as Promise<Meeting[]>,
  saveMeetings: (meetings: Meeting[]) => ipcRenderer.invoke('meetings:save', meetings),

  // ─── Analysis ───────────────────────────────────────────
  analyze: (args: { transcript: string; apiKey: string }) =>
    ipcRenderer.invoke('groq:analyze', args),

  // ─── Google Drive ───────────────────────────────────────
  driveListFiles: () => ipcRenderer.invoke('drive:list'),
  driveDownload: (fileId: string, fileName: string) =>
    ipcRenderer.invoke('drive:download', { fileId, fileName }),
  driveUpload: (content: string, fileName: string) =>
    ipcRenderer.invoke('drive:upload', { content, fileName }),

  // ─── Notion ─────────────────────────────────────────────
  notionListDatabases: (apiKey: string) =>
    ipcRenderer.invoke('notion:listDatabases', { apiKey }),
  notionCreatePage: (args: { databaseId: string; meeting: Meeting; analysis: MeetingAnalysis; apiKey: string }) =>
    ipcRenderer.invoke('notion:createPage', args),

  // ─── Settings ───────────────────────────────────────────
  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
  saveSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke('settings:save', settings),

  // ─── Stealth ────────────────────────────────────────────
  toggleStealth: (enable: boolean) =>
    ipcRenderer.invoke('stealth:toggle', enable),
  stealthStatus: () => ipcRenderer.invoke('stealth:status'),

  // ─── Window Controls ────────────────────────────────────
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  showDashboard: () => ipcRenderer.invoke('window:showDashboard'),

  // ─── Overlay: Launch from dashboard ─────────────────────
  launchOverlay: () => ipcRenderer.invoke('overlay:launch'),

  // ─── Overlay: Save session to dashboard ─────────────────
  saveSession: (sessionData: any) =>
    ipcRenderer.invoke('overlay:save-session', sessionData),

  // ─── Overlay: IPC events from main process ──────────────
  onToggleListening: (callback: (state: boolean) => void) =>
    ipcRenderer.on('toggle-listening', (_e, state) => callback(state)),
  onSourceChanged: (callback: (source: string) => void) =>
    ipcRenderer.on('source-changed', (_e, source) => callback(source)),
  onSaveSession: (callback: () => void) =>
    ipcRenderer.on('save-session', () => callback()),
  onVisibilityChanged: (callback: (visible: boolean) => void) =>
    ipcRenderer.on('visibility-changed', (_e, visible) => callback(visible)),
  onClickThroughChanged: (callback: (enabled: boolean) => void) =>
    ipcRenderer.on('click-through-changed', (_e, enabled) => callback(enabled)),
  onStealthChanged: (callback: (active: boolean) => void) =>
    ipcRenderer.on('stealth-changed', (_e, active) => callback(active)),

  // ─── Dashboard: receive session from overlay ─────────────
  onSessionSaved: (callback: (session: any) => void) =>
    ipcRenderer.on('session-saved', (_e, session) => callback(session)),

  // ─── Platform info ──────────────────────────────────────
  platform: process.platform
} as const

contextBridge.exposeInMainWorld('eves', api)

export type EvesAPI = typeof api
