import { ipcMain } from '../runtime'
import { getSettings, modelSwitcher } from '../utils/store'
import { getMeeting, patchMeeting } from '../utils/meetings'
import { listModels, stream } from '../utils/llm'
import { analyzeMeeting, brainMessages, isToolPill, llmTarget, meetingMaterial, pillAsk, toolPromptHeader, withModelFallback } from '../utils/brain'
import { indexRepo, repoContext } from './repo.handler'
import { PROVIDERS } from '../../src/lib/providers'
import type { AiProvider, BrainRequest, IpcResult, MeetingAnalysis } from '../../src/types'

const fail = (err: unknown): IpcResult<never> => ({ success: false, error: err instanceof Error ? err.message : String(err) })
const hasTranscript = (m: ReturnType<typeof getMeeting>) => !!(m?.transcription?.utterances?.length || m?.transcription?.transcript?.trim())

/** Chat requests in flight, so the dashboard can stop a long answer. */
const running = new Map<string, AbortController>()

export function registerAiHandlers() {
  // Summary + insights for one meeting; long transcripts are condensed part by part first
  ipcMain.handle('ai:analyze', async (e, meetingId: string): Promise<IpcResult<MeetingAnalysis>> => {
    try {
      const meeting = getMeeting(meetingId)
      if (!hasTranscript(meeting)) return fail('This meeting has no transcript yet — transcribe it first.')
      const t = llmTarget(getSettings())
      const progress = (stage: string) => e.sender.send('ai:progress', { key: meetingId, stage })
      const { analysis, digest } = await withModelFallback(t, (target) =>
        analyzeMeeting(meeting!, target, PROVIDERS[t.provider].budget, progress), modelSwitcher(e.sender, t.provider))
      patchMeeting(meetingId, { analysis, ...(digest && { digest }) })
      return { success: true, data: analysis }
    } catch (err) {
      return fail(err)
    }
  })

  // Brain chat: meeting + company repo + skill vault → streamed answer (ai:delta events)
  ipcMain.handle('ai:chat', async (e, req: BrainRequest): Promise<IpcResult<{ text: string; model: string }>> => {
    const ctrl = new AbortController()
    running.set(req.requestId, ctrl)
    const progress = (stage: string) => e.sender.send('ai:progress', { key: req.requestId, stage })
    const emit = (text: string) => e.sender.send('ai:delta', { requestId: req.requestId, text })
    try {
      const settings = getSettings()
      const t = llmTarget(settings)
      const budget = PROVIDERS[t.provider].budget
      let meeting = getMeeting(req.meetingId)
      if (!meeting) return fail('Meeting not found — it may have been deleted.')
      if (!hasTranscript(meeting)) return fail('This meeting has no transcript yet — transcribe it first.')

      // too long for this provider and never condensed? do it once and keep it
      const switchModel = modelSwitcher(e.sender, t.provider)
      const { digest } = await withModelFallback(t, (target) => meetingMaterial(meeting!, target, budget, progress, ctrl.signal), (m) => { t.model = m; switchModel(m) })
      if (digest && digest.parts !== meeting.digest?.parts) meeting = patchMeeting(meeting.id, { digest }) ?? meeting

      progress('thinking')
      const query = [req.pill ? pillAsk(req.pill, !!settings.referenceRepoPath) : req.messages.at(-1)?.text, meeting.analysis?.mainGoal, meeting.analysis?.tldr]
        .filter(Boolean).join('\n')
      const messages = brainMessages({
        meeting,
        history: req.messages,
        pill: req.pill,
        settings,
        company: repoContext(settings.companyRepoPath, 'company', budget * 0.22, query),
        vault: repoContext(settings.referenceRepoPath, 'vault', budget * 0.14, query),
        budget
      })

      // coding-tool prompts open with the deterministic workspace + skill-vault sections
      const header = isToolPill(req.pill)
        ? toolPromptHeader(req.pill, meeting, settings, settings.referenceRepoPath ? indexRepo(settings.referenceRepoPath).info.catalog : undefined) + '\n'
        : ''
      if (header) emit(header)
      const body = await withModelFallback(t, (target) => stream(target, messages, emit, { signal: ctrl.signal, maxTokens: 4096 }), (m) => { t.model = m; switchModel(m) })
      return { success: true, data: { text: header + body, model: `${t.label} · ${t.model}` } }
    } catch (err) {
      return fail(ctrl.signal.aborted ? 'Stopped.' : err)
    } finally {
      running.delete(req.requestId)
    }
  })

  ipcMain.handle('ai:cancel', (_e, requestId: string) => { running.get(requestId)?.abort() })

  // Doubles as the key check in Settings — a key that can list models works
  ipcMain.handle('ai:models', async (_e, provider: AiProvider, key: string): Promise<IpcResult<string[]>> => {
    try {
      const spec = PROVIDERS[provider]
      return { success: true, data: await listModels({ label: spec.label, base: spec.base, key }) }
    } catch (err) {
      return fail(err)
    }
  })
}
