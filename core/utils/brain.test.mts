// node core/utils/brain.test.mts — brain logic against a fake model (no network, no keys)
import assert from 'node:assert/strict'
import {
  analyzeMeeting, brainMessages, chunkLines, clock, meetingForQuestion, normalizeAnalysis,
  preferredModel, talkTime, toolPromptHeader, transcriptLines, withModelFallback, wordFrequency
} from './brain.ts'
import { stylePath } from '../../src/lib/paths.ts'
import type { LlmTarget } from './llm.ts'
import type { AppSettings, Meeting, Utterance } from '../../src/types'

const settings = {
  promptPathStyle: 'wsl',
  companyRepoPath: 'C:\\Users\\DELL\\webvory_project\\Product_Management_dashboard_db',
  referenceRepoPath: 'C:\\Users\\DELL\\Favorites\\github_skills'
} as AppSettings

const turn = (i: number, speaker: number, text: string): Utterance => ({ speaker, start: i * 30, end: i * 30 + 25, transcript: text, words: [] })
function meeting(turns: Utterance[]): Meeting {
  return {
    id: 'm1', title: 'Sprint sync', date: '2026-09-27T10:00:00.000Z', duration: turns.length * 30, audioPath: '', tags: [], notes: '',
    isTranscribing: false, isAnalyzing: false, transcriptionProgress: 100,
    transcription: { transcript: turns.map((t) => t.transcript).join(' '), utterances: turns, duration: turns.length * 30, speakers: 2, confidence: 0.9 }
  }
}

// paths + the user's exact skill-vault section
assert.equal(stylePath('C:\\Users\\DELL\\Favorites\\github_skills', 'wsl'), '/mnt/c/Users/DELL/Favorites/github_skills')
assert.equal(stylePath('C:/Users/DELL/x/', 'wsl'), '/mnt/c/Users/DELL/x')
assert.equal(stylePath('C:/Users/DELL/x', 'windows'), 'C:\\Users\\DELL\\x')
assert.equal(stylePath('/home/me/repo', 'wsl'), '/home/me/repo')
const header = toolPromptHeader('codex', meeting([turn(0, 0, 'hi')]), settings, 'INDEX.md')
assert.ok(header.includes([
  '## 1. CENTRAL SKILLS REPOSITORY (WSL PATH)',
  "You have access to the project's official centralized skill specifications repository located at:",
  '`/mnt/c/Users/DELL/Favorites/github_skills`',
  'Master catalog index:',
  '`/mnt/c/Users/DELL/Favorites/github_skills/INDEX.md`'
].join('\n')), header)
assert.ok(header.includes('Company repository: `/mnt/c/Users/DELL/webvory_project/Product_Management_dashboard_db`'))
assert.ok(!toolPromptHeader('cursor', meeting([]), { ...settings, referenceRepoPath: '' }).includes('SKILLS REPOSITORY'))

// transcript shape + local facts
assert.equal(clock(3725), '1:02:05')
assert.equal(clock(65), '01:05')
const small = meeting([turn(0, 0, 'Rahul, build the wholesale orders page.'), turn(1, 1, 'Okay, and add the filter drawer too.')])
assert.deepEqual(transcriptLines(small), ['[00:00] S1: Rahul, build the wholesale orders page.', '[00:30] S2: Okay, and add the filter drawer too.'])
assert.deepEqual(talkTime(small), { S1: 50, S2: 50 })
const freq = wordFrequency(small)
assert.ok(freq.wholesale === 1 && freq.drawer === 1 && !('okay' in freq) && !('the' in freq), JSON.stringify(freq))

// chunking keeps order and size, never drops a line
const chunks = chunkLines(['a'.repeat(40), 'b'.repeat(40), 'c'.repeat(150)], 100)
assert.deepEqual(chunks.map((c) => c.length), [81, 100])

// any model output → renderable analysis
const n = normalizeAnalysis({ tldr: 5, actionItems: [{ task: 'Ship it', priority: 'URGENT' }, null], meetingType: 'PARTY', speakerProfiles: [{ name: 'S1' }] }, small, { S1: 70 })
assert.equal(n.tldr, 'No summary returned')
assert.deepEqual(n.actionItems, [{ task: 'Ship it', owner: 'Unassigned', dueDate: '', priority: 'MEDIUM', completed: false }])
assert.equal(n.meetingType, 'OTHER')
assert.equal(n.speakerProfiles[0].talkTimePercent, 70)
assert.deepEqual(n.keyDecisions, [])

// fake model: records calls, answers digests with notes and the analysis with JSON
const calls: string[] = []
globalThis.fetch = (async (_url: string, init: RequestInit) => {
  const body = JSON.parse(String(init.body))
  const system = body.messages[0].content as string
  const kind = system.startsWith('You condense') ? 'digest' : 'analysis'
  calls.push(kind)
  const content = kind === 'digest' ? '- S1 asked for the wholesale orders page [00:00]' : '{"mainGoal":"Ship the wholesale orders page","tldr":"Build it","summary":"Planned."}'
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }))
}) as typeof fetch
const t: LlmTarget = { provider: 'gemini', label: 'GEMINI', base: 'https://fake.local', model: 'm', key: 'k' }

// fits → one call, no digest
let r = await analyzeMeeting(small, t, 100_000)
assert.deepEqual(calls, ['analysis'])
assert.equal(r.digest, undefined)
assert.equal(r.analysis.mainGoal, 'Ship the wholesale orders page')

// 2h-style meeting on a small budget → digested part by part, then summarised
calls.length = 0
const long = meeting(Array.from({ length: 240 }, (_, i) => turn(i, i % 3, `Point ${i}: we discussed the chargeback risk page and API number ${i} in detail today.`)))
r = await analyzeMeeting(long, t, 6_000)
assert.ok(calls.filter((c) => c === 'digest').length > 3, calls.join(','))
assert.equal(calls.at(-1), 'analysis')
assert.equal(r.digest?.sourceChars, transcriptLines(long).join('\n').length)

// cached digest is reused (no digest calls on the second run)
calls.length = 0
await analyzeMeeting({ ...long, digest: r.digest }, t, 6_000)
assert.deepEqual(calls, ['analysis'])

// question-aware context: excerpt around the matching line fits the budget
const withNotes: Meeting = { ...long, digest: r.digest, analysis: r.analysis }
withNotes.transcription!.utterances[150].transcript = 'Priya: the Freshdesk webhook must retry three times.'
const ctx = meetingForQuestion(withNotes, 5_000, 'what did we say about the freshdesk webhook?')
assert.ok(ctx.includes('Freshdesk webhook must retry'), 'excerpt missing')
assert.ok(ctx.length <= 5_000, `context too big: ${ctx.length}`)

// chat assembly: tool pill asks for sections 2+, budget respected
const msgs = brainMessages({
  meeting: withNotes,
  history: [{ id: '1', role: 'user', text: 'CODEX PROMPT', pill: 'codex', at: 0 }],
  pill: 'codex',
  company: { title: 'COMPANY REPO', text: 'x'.repeat(50_000) },
  vault: { title: 'SKILL VAULT', text: 'INDEX.md …' },
  budget: 16_000
})
assert.equal(msgs[0].role, 'system')
assert.ok(msgs.at(-1)!.content.includes('## 2. MISSION'))
assert.ok(msgs[0].content.includes('Write the prompt in English.'))
assert.ok(msgs.reduce((s, m) => s + m.content.length, 0) < 16_000 + 3_000)

// retired model → best available picked, persisted via callback, retried once
assert.equal(preferredModel('groq', ['allam-2-7b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'qwen/qwen3.8-27b']), 'openai/gpt-oss-120b')
assert.equal(preferredModel('gemini', ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-3-flash', 'gemini-3-flash-lite', 'gemini-2.5-pro']), 'gemini-3-flash')
assert.equal(preferredModel('openai', ['gpt-4o-mini', 'gpt-4.1', 'gpt-5', 'gpt-5.1', 'o3']), 'gpt-5.1')
const seen: string[] = []
globalThis.fetch = (async (url: string, init?: RequestInit) => {
  if (String(url).endsWith('/models')) return new Response(JSON.stringify({ data: [{ id: 'openai/gpt-oss-120b' }, { id: 'allam-2-7b' }] }))
  const model = JSON.parse(String(init!.body)).model
  seen.push(model)
  return model === 'llama-3.3-70b-versatile'
    ? new Response('{"error":{"message":"The model does not exist"}}', { status: 404 })
    : new Response(JSON.stringify({ choices: [{ message: { content: 'hi' } }] }))
}) as typeof fetch
let switched = ''
const { complete } = await import('./llm.ts')
const out = await withModelFallback({ ...t, provider: 'groq', model: 'llama-3.3-70b-versatile' }, (x) => complete(x, []), (m) => { switched = m })
assert.equal(out, 'hi')
assert.equal(switched, 'openai/gpt-oss-120b')
assert.deepEqual(seen, ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b'])

console.log('brain: ok')
