import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, Meeting, MeetingAnalysis } from '../src/types'

const api = {
  transcribe: (args: { filePath: string; apiKey: string }) =>
    ipcRenderer.invoke('deepgram:transcribe', args),
  onTranscribeProgress: (callback: (pct: number) => void) =>
    ipcRenderer.on('deepgram:progress', (_e, pct) => callback(pct)),

  analyze: (args: { transcript: string; apiKey: string }) =>
    ipcRenderer.invoke('groq:analyze', args),

  driveListFiles: () => ipcRenderer.invoke('drive:list'),
  driveDownload: (fileId: string, fileName: string) =>
    ipcRenderer.invoke('drive:download', { fileId, fileName }),
  driveUpload: (content: string, fileName: string) =>
    ipcRenderer.invoke('drive:upload', { content, fileName }),

  notionListDatabases: (apiKey: string) =>
    ipcRenderer.invoke('notion:listDatabases', { apiKey }),
  notionCreatePage: (args: { databaseId: string; meeting: Meeting; analysis: MeetingAnalysis; apiKey: string }) =>
    ipcRenderer.invoke('notion:createPage', args),

  getSettings: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
  saveSettings: (settings: Partial<AppSettings>) =>
    ipcRenderer.invoke('settings:save', settings),

  toggleStealth: (enable: boolean) =>
    ipcRenderer.invoke('stealth:toggle', enable),
  stealthStatus: () => ipcRenderer.invoke('stealth:status'),

  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close')
} as const

contextBridge.exposeInMainWorld('eves', api)

export type EvesAPI = typeof api
