import { ipcMain, BrowserWindow } from '../runtime'
import { createClient } from '@deepgram/sdk'
import * as fs from 'fs'
import { getSettings } from '../utils/store'
import type { TranscriptionResult, IpcResult, Word, Utterance } from '../../src/types'

const r2 = (n: number) => Math.round(n * 100) / 100

// Broadcast — the dashboard may not exist yet when this is registered
const progress = (pct: number) =>
  BrowserWindow.getAllWindows().forEach((w) => w.webContents.send('deepgram:progress', pct))

const toWord = (w: any): Word => ({
  word: w.word ?? '',
  punctuated_word: w.punctuated_word,
  speaker: w.speaker,
  start: r2(w.start ?? 0),
  end: r2(w.end ?? 0),
  confidence: r2(w.confidence ?? 0)
})

export function registerDeepgramHandlers() {
  ipcMain.handle('deepgram:transcribe', async (_e, args: { filePath: string; apiKey: string; language?: string }): Promise<IpcResult<TranscriptionResult>> => {
    const { filePath, apiKey } = args
    if (!apiKey) return { success: false, error: 'No Deepgram API key — add it in Settings → API Keys' }
    if (!filePath || !fs.existsSync(filePath)) return { success: false, error: `Audio file not found: ${filePath || '(no path)'}` }

    try {
      const settings = getSettings()
      // 'multi' needs nova-3 — that's the combination that handles mixed Hindi-English speech
      const language = args.language || settings.defaultLanguage || 'multi'
      progress(10)
      // Streamed from disk — a multi-hour recording never sits in memory as one buffer
      const { result, error } = await createClient(apiKey).listen.prerecorded.transcribeFile(fs.createReadStream(filePath), {
        model: language === 'multi' ? 'nova-3' : 'nova-2',
        language,
        smart_format: true,
        punctuate: true,
        utterances: true,
        diarize: settings.enableDiarization
      })
      if (error) return { success: false, error: error.message ?? 'Transcription failed' }
      progress(90)

      const alt = result?.results?.channels?.[0]?.alternatives?.[0]
      if (!alt) return { success: false, error: 'Deepgram returned no transcript' }

      const utterances: Utterance[] = (result.results.utterances ?? []).map((u: any) => ({
        speaker: u.speaker ?? 0,
        start: r2(u.start ?? 0),
        end: r2(u.end ?? 0),
        transcript: u.transcript ?? '',
        words: (u.words ?? []).map(toWord)
      }))
      const words = utterances.flatMap((u) => u.words)
      progress(100)
      return {
        success: true,
        data: {
          transcript: alt.transcript ?? '',
          utterances,
          duration: result.metadata?.duration ?? 0,
          speakers: new Set(utterances.map((u) => u.speaker)).size,
          confidence: words.length ? words.reduce((s, w) => s + w.confidence, 0) / words.length : 0
        }
      }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Unknown transcription error' }
    }
  })

  // Real key check (the old "Test" button faked success after 2s)
  ipcMain.handle('deepgram:test', async (_e, apiKey: string): Promise<IpcResult<string>> => {
    try {
      const res = await fetch('https://api.deepgram.com/v1/projects', { headers: { Authorization: `Token ${apiKey}` } })
      return res.ok ? { success: true, data: 'Key accepted' } : { success: false, error: `Deepgram rejected the key (HTTP ${res.status})` }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Network error' }
    }
  })
}
