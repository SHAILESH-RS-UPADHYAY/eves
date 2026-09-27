import { ipcMain } from '../runtime'
import Groq from 'groq-sdk'
import type { MeetingAnalysis, IpcResult } from '../../src/types'

const systemPrompt = `You are a meeting intelligence AI. Analyze the meeting transcript provided and return ONLY a valid JSON object with NO additional text, NO markdown, NO backticks, NO explanation. The JSON must exactly match this structure:
{
  summary: string (3-5 sentences),
  tldr: string (1 sentence max 20 words),
  keyDecisions: [{decision, madeBy, timestamp?}],
  actionItems: [{task, owner, dueDate?, priority:'HIGH'|'MEDIUM'|'LOW', completed: false}],
  intentions: [{speaker, explicitGoal, hiddenAgenda?, sentiment:'POSITIVE'|'NEUTRAL'|'CAUTIOUS'|'NEGATIVE'}],
  sentimentByMinute: [{minute:number, score:number(-1 to 1), dominantEmotion:string}],
  mainTopics: [{topic, durationPercent:number, startTimestamp?}],
  concerns: string[],
  agreements: string[],
  openQuestions: string[],
  speakerProfiles: [{name, role?, communicationStyle, agenda, talkTimePercent:number}],
  meetingType: 'SALES'|'ONE_ON_ONE'|'PLANNING'|'STANDUP'|'INTERVIEW'|'NEGOTIATION'|'OTHER',
  urgency: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL',
  overallMood: 'POSITIVE'|'NEUTRAL'|'TENSE'|'MIXED'|'PRODUCTIVE',
  wordFrequency: {word: count},
  powerDynamics: string,
  suggestedTags: string[]
}
If data is missing, use reasonable defaults. Never return null fields.`

export function registerGroqHandlers() {
  ipcMain.handle('groq:analyze', async (_event, args: { transcript: string; apiKey: string }): Promise<IpcResult<MeetingAnalysis>> => {
    const { transcript, apiKey } = args

    if (!apiKey) {
      return { success: false, error: 'No Groq API key provided' }
    }

    try {
      const groq = new Groq({ apiKey })

      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        max_tokens: 4096,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Transcript:\n${transcript}` }
        ]
      })

      const content = completion.choices?.[0]?.message?.content
      if (!content) {
        return { success: false, error: 'No content returned from Groq' }
      }

      let parsed: MeetingAnalysis
      try {
        parsed = JSON.parse(content)
      } catch {
        return { success: false, error: 'Parse failed — model did not return valid JSON' }
      }

      return { success: true, data: parsed }
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Unknown Groq error' }
    }
  })
}
