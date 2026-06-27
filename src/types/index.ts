export type MeetingType =
  | 'SALES' | 'ONE_ON_ONE' | 'PLANNING' | 'STANDUP'
  | 'INTERVIEW' | 'NEGOTIATION' | 'OTHER'

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type Urgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type MoodType = 'POSITIVE' | 'NEUTRAL' | 'TENSE' | 'MIXED' | 'PRODUCTIVE'
export type SentimentLabel = 'POSITIVE' | 'NEUTRAL' | 'CAUTIOUS' | 'NEGATIVE'
export type ToastType = 'success' | 'error' | 'info' | 'loading'
export type NavPage = 'dashboard' | 'meetings' | 'transcripts' | 'integrations' | 'settings'

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
  words: Word[]
  paragraphs?: { paragraph: string; start: number; end: number }[]
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
  transcription?: TranscriptionResult
  analysis?: MeetingAnalysis
  tags: Tag[]
  notes: string
  isTranscribing: boolean
  isAnalyzing: boolean
  transcriptionProgress: number
}

export interface AppSettings {
  deepgramApiKey: string
  groqApiKey: string
  defaultLanguage: string
  enableDiarization: boolean
  autoTranscribe: boolean
  autoAnalyze: boolean
  analysisModel: 'llama-3.1-70b-versatile' | 'mixtral-8x7b-32768'
  deleteAudioAfterTranscription: boolean
  stealthOnLaunch: boolean
  accentColor: string
  orbIntensity: number
  reduceMotion: boolean
  notionDatabaseId?: string
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
