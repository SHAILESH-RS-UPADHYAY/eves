export type MeetingType =
  | 'SALES' | 'ONE_ON_ONE' | 'PLANNING' | 'STANDUP'
  | 'INTERVIEW' | 'NEGOTIATION' | 'OTHER'

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type Urgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type MoodType = 'POSITIVE' | 'NEUTRAL' | 'TENSE' | 'MIXED' | 'PRODUCTIVE'
export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'CAUTIOUS' | 'NEGATIVE'
export type ToastType = 'success' | 'error' | 'info' | 'loading'
export type NavPage = 'dashboard' | 'meetings' | 'transcripts' | 'brain' | 'repo' | 'integrations' | 'settings'
export type AiProvider = 'groq' | 'gemini' | 'openai'
export type BrainLanguage = 'english' | 'hinglish'
export type PathStyle = 'wsl' | 'windows'
export type PillId = 'goal' | 'how' | 'codex' | 'claude' | 'cursor' | 'frontend' | 'actions' | 'risks'

export interface Word {
  word: string
  start: number
  end: number
  confidence: number
  speaker?: number
  punctuated_word?: string
}

export interface Utterance {
  speaker: number
  start: number
  end: number
  transcript: string
  words: Word[]
}

export interface TranscriptionResult {
  transcript: string
  utterances: Utterance[]
  duration: number
  speakers: number
  confidence: number
}

export interface Decision {
  decision: string
  madeBy: string
  timestamp?: string
}

export interface ActionItem {
  task: string
  owner: string
  dueDate?: string
  priority: Priority
  completed: boolean
}

export interface Intention {
  speaker: string
  explicitGoal: string
  hiddenAgenda?: string
  sentiment: SentimentLabel
}

export interface SentimentPoint {
  minute: number
  score: number
  dominantEmotion: string
}

export interface Topic {
  topic: string
  durationPercent: number
  startTimestamp?: string
}

export interface SpeakerProfile {
  name: string
  role?: string
  communicationStyle: string
  agenda: string
  talkTimePercent: number
}

export interface MeetingAnalysis {
  /** The one outcome the meeting is really about */
  mainGoal?: string
  summary: string
  tldr: string
  keyDecisions: Decision[]
  actionItems: ActionItem[]
  intentions: Intention[]
  sentimentByMinute: SentimentPoint[]
  mainTopics: Topic[]
  concerns: string[]
  agreements: string[]
  openQuestions: string[]
  speakerProfiles: SpeakerProfile[]
  meetingType: MeetingType
  urgency: Urgency
  overallMood: MoodType
  wordFrequency: Record<string, number>
  powerDynamics: string
  suggestedTags: string[]
}

export interface Tag {
  id: string
  label: string
  emoji: string
  color: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  duration: number
  audioPath: string
  /** protocol url for playback (recorded sessions); falls back to audioPath */
  audioUrl?: string
  source?: 'internal' | 'external' | 'both' | 'upload'
  /** Waveform peaks captured while recording — instant player for long meetings */
  peaks?: number[]
  transcription?: TranscriptionResult
  analysis?: MeetingAnalysis
  /** Part-by-part notes for transcripts longer than the active model's context */
  digest?: MeetingDigest
  /** EVES brain conversation about this meeting */
  chat?: ChatMessage[]
  tags: Tag[]
  notes: string
  isTranscribing: boolean
  isAnalyzing: boolean
  transcriptionProgress: number
}

export interface MeetingDigest {
  /** transcript length the parts were made from — a re-transcription invalidates them */
  sourceChars: number
  parts: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  pill?: PillId
  at: number
  error?: boolean
}

export interface BrainRequest {
  requestId: string
  meetingId: string
  messages: ChatMessage[]
  pill?: PillId
}

export interface AppSettings {
  deepgramApiKey: string
  groqApiKey: string
  geminiApiKey: string
  openaiApiKey: string
  /** Which provider is EVES's brain */
  aiProvider: AiProvider
  /** Model per provider — editable because providers retire models */
  aiModels: Record<AiProvider, string>
  defaultLanguage: string
  enableDiarization: boolean
  autoTranscribe: boolean
  autoAnalyze: boolean
  /** Language EVES explains in (prompts for coding tools are always English) */
  brainLanguage: BrainLanguage
  /** Path format written into generated prompts */
  promptPathStyle: PathStyle
  companyRepoPath: string
  referenceRepoPath: string
  notionDatabaseId?: string
}

export type DataFolder = 'recordings' | 'meetings'

export interface StorageInfo {
  recordings: string
  meetings: string
  recordingCount: number
  recordingBytes: number
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  modifiedTime: string
  webViewLink?: string
}

export interface IpcResult<T> {
  success: boolean
  data?: T
  error?: string
}

/** Where the dashboard should land when opened from the popup or tray */
export interface DashboardRoute {
  page?: NavPage
  meetingId?: string
}

/** Session handed over from the EVES popup */
export interface PopupSession {
  id: string
  title: string
  date: string
  duration: number
  source: 'internal' | 'external' | 'both'
  transcript: string
  utterances: Utterance[]
  audioPath: string
  audioUrl: string
  /** Waveform peaks (0..1), two per second — lets the player skip decoding long recordings */
  peaks?: number[]
}

export interface RepoFileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: RepoFileNode[]
  extension?: string
  size?: number
}

export interface RepoInfo {
  rootPath: string
  name: string
  totalFiles: number
  totalDirectories: number
  techStack: string[]
  keyDependencies: string[]
  readmeSummary?: string
  treePreview: RepoFileNode[]
  manifestSummary?: string
  /** Catalog file at the root (INDEX.md / CATALOG.md / README.md) — how a skill vault is read */
  catalog?: string
  skillCount?: number
}

export interface AffectedFile {
  path: string
  action: 'MODIFY' | 'CREATE' | 'DELETE' | 'REFERENCE'
  reason: string
}

export interface RepoSynthesisResult {
  id: string
  mainGoal: string
  executiveSummary: string
  repoPath: string
  repoName: string
  meetingTitle?: string
  meetingId?: string
  affectedFiles: AffectedFile[]
  keyDecisionsAndConstraints: string[]
  stepByStepPlan: string[]
  cursorPrompt: string
  suggestedBranchName?: string
  timestamp: number
}

declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag'
  }
}

declare global {
  interface Window {
    eves?: import('../../core/preload').EvesAPI
  }
}
