import { ipcMain, BrowserWindow } from 'electron'
import { createClient } from '@deepgram/sdk'
import * as fs from 'fs'
import type { TranscriptionResult, IpcResult, Word, Utterance } from '../../src/types'

export function registerDeepgramHandlers(mainWindow: BrowserWindow) {
  ipcMain.handle('deepgram:transcribe', async (_event, args: { filePath: string; apiKey: string }): Promise<IpcResult<TranscriptionResult>> => {
    const { filePath, apiKey } = args

    if (!apiKey) {
      return { success: false, error: 'No Deepgram API key provided' }
    }

    try {
      const deepgram = createClient(apiKey)

      mainWindow.webContents.send('deepgram:progress', 10)

      const audioBuffer = fs.readFileSync(filePath)

      mainWindow.webContents.send('deepgram:progress', 50)

      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          smart_format: true,
          diarize: true,
          paragraphs: true,
          utterances: true,
          punctuate: true,
          language: 'en'
        }
      )

      if (error) {
        return { success: false, error: error.message ?? 'Transcription failed' }
      }

      mainWindow.webContents.send('deepgram:progress', 90)

      const results = result?.results
      const channels = results?.channels?.[0]
      const alternatives = channels?.alternatives?.[0]

      if (!alternatives) {
        return { success: false, error: 'No transcription alternatives returned' }
      }

      const words: Word[] = (alternatives.words ?? []).map((w: any) => ({
        word: w.word ?? '',
        start: w.start ?? 0,
        end: w.end ?? 0,
        confidence: w.confidence ?? 0,
        speaker: w.speaker,
        punctuated_word: w.punctuated_word
      }))

      const utterances: Utterance[] = (results?.utterances ?? []).map((u: any) => ({
        speaker: u.speaker ?? 0,
        start: u.start ?? 0,
        end: u.end ?? 0,
        transcript: u.transcript ?? '',
        words: (u.words ?? []).map((w: any) => ({
          word: w.word ?? '',
          start: w.start ?? 0,
          end: w.end ?? 0,
          confidence: w.confidence ?? 0,
          speaker: w.speaker,
          punctuated_word: w.punctuated_word
        }))
      }))

      const paragraphs = alternatives?.paragraphs?.paragraphs?.map((p: any) => ({
        paragraph: p.text ?? '',
        start: p.start ?? 0,
        end: p.end ?? 0
      }))

      const mapped: TranscriptionResult = {
        transcript: alternatives.transcript ?? '',
        utterances,
        duration: result?.metadata?.duration ?? 0,
        speakers: new Set(utterances.map((u) => u.speaker)).size,
        confidence: words.length > 0 ? words.reduce((s, w) => s + w.confidence, 0) / words.length : 0,
        words,
        paragraphs
      }

      mainWindow.webContents.send('deepgram:progress', 100)

      return { success: true, data: mapped }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Unknown transcription error' }
    }
  })
}
