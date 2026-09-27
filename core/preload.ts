import { contextBridge, ipcRenderer, webUtils } from './runtime'
import type { IpcRendererEvent } from './runtime'
import type { AppSettings, DashboardRoute, Meeting, MeetingAnalysis, IpcResult, PopupSession, RepoInfo, RepoSynthesisResult, TranscriptionResult } from '../src/types'

/** Subscribe helper — every listener hands back its own unsubscribe. */
const on = <A extends unknown[] = []>(channel: string) => (callback: (...args: A) => void) => {
  const listener = (_e: IpcRendererEvent, ...args: unknown[]) => callback(...(args as A))
  ipcRenderer.on(channel, listener)
  return () => { ipcRenderer.removeListener(channel, listener) }
}

const api = {
  // ─── Transcription ──────────────────────────────────────
  transcribe: (args: { filePath: string; apiKey: string; language?: string }) =>
    ipcRenderer.invoke('deepgram:transcribe', args) as Promise<IpcResult<TranscriptionResult>>,
  onTranscribeProgress: on<[pct: number]>('deepgram:progress'),
  testDeepgram: (apiKey: string) => ipcRenderer.invoke('deepgram:test', apiKey) as Promise<IpcResult<string>>,

  // ─── Repository Intel ───────────────────────────────────
  selectRepoFolder: () =>
    ipcRenderer.invoke('repo:select-folder') as Promise<IpcResult<string>>,
  scanRepoFolder: (folderPath: string) =>
    ipcRenderer.invoke('repo:scan-folder', folderPath) as Promise<IpcResult<RepoInfo>>,
  synthesizeRepoDirective: (args: {
    repoInfo: RepoInfo
    transcript: string
    meetingTitle?: string
    meetingId?: string
    apiKey: string
  }) => ipcRenderer.invoke('repo:synthesize', args) as Promise<IpcResult<RepoSynthesisResult>>,

  // ─── Recording (popup) ──────────────────────────────────
  appendRecording: (args: { id: string; data: ArrayBuffer }) =>
    ipcRenderer.invoke('recording:append', args) as Promise<IpcResult<never>>,
  finishRecording: (id: string) =>
    ipcRenderer.invoke('recording:finish', id) as Promise<IpcResult<{ path: string; url: string }>>,

  // ─── Meetings (one file per meeting, field-level patches) ─
  listMeetings: () => ipcRenderer.invoke('meetings:list') as Promise<Meeting[]>,
  putMeeting: (meeting: Meeting) => ipcRenderer.invoke('meetings:put', meeting),
  patchMeeting: (id: string, partial: Partial<Meeting>) => ipcRenderer.invoke('meetings:patch', id, partial),
  deleteMeeting: (id: string) => ipcRenderer.invoke('meetings:delete', id),
  /** Real path of a dropped/uploaded file (File.path no longer exists) */
  pathForFile: (file: File) => webUtils.getPathForFile(file),

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

  // ─── Windows ────────────────────────────────────────────
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  showDashboard: (route?: DashboardRoute) => ipcRenderer.invoke('window:showDashboard', route),
  launchPopup: () => ipcRenderer.invoke('popup:launch'),
  hidePopup: () => ipcRenderer.invoke('popup:hide'),
  resizePopup: (size: { width: number; height: number }) => ipcRenderer.invoke('popup:resize', size),

  // ─── Popup → main: persist a finished session ───────────
  saveSession: (session: PopupSession) =>
    ipcRenderer.invoke('popup:save-session', session) as Promise<IpcResult<string>>,

  // ─── Events: main → popup ───────────────────────────────
  onToggleListening: on('toggle-listening'),
  onCycleSource: on('cycle-source'),
  onSaveSession: on('save-session'),
  onClickThroughChanged: on<[enabled: boolean]>('click-through-changed'),

  // ─── Events: main → dashboard ───────────────────────────
  onSessionSaved: on<[meeting: Meeting]>('session-saved'),
  onNavigate: on<[route: DashboardRoute]>('navigate'),

  // ─── Platform info ──────────────────────────────────────
  platform: process.platform
} as const

contextBridge.exposeInMainWorld('eves', api)

export type EvesAPI = typeof api
