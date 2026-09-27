// EVES brain: turns a meeting (+ company repo + skill vault) into model context,
// summaries, answers and coding-tool prompts. Runtime-free and network-free
// except through the llm client, so `node core/utils/brain.test.mts` runs it.
import { complete, completeJson, listModels, ModelUnavailableError, type LlmTarget, type Msg } from './llm.ts'
import { PROVIDERS, activeProvider } from '../../src/lib/providers.ts'
import { stylePath } from '../../src/lib/paths.ts'
import type { AiProvider, AppSettings, ChatMessage, Meeting, MeetingAnalysis, MeetingDigest, PillId } from '../../src/types'

/** The configured brain as a call target, or a clear "add a key" error. */
export function llmTarget(s: AppSettings): LlmTarget {
  const provider = activeProvider(s)
  if (!provider) throw new Error('No AI key yet — add a Groq, Gemini or OpenAI key in Settings → API Keys.')
  const spec = PROVIDERS[provider]
  return { provider, label: spec.label, base: spec.base, model: s.aiModels[provider] || spec.model, key: s[spec.keyField] }
}

// Best-first patterns, matched against ids sorted newest version first
const PREFERENCE: Record<AiProvider, RegExp[]> = {
  groq: [/gpt-oss-120b/, /llama-4-maverick/, /llama-3\.\d+-70b/, /qwen/, /gpt-oss/],
  gemini: [/^gemini-[\d.]+-flash$/, /^gemini-[\d.]+-pro$/, /^gemini-[\d.]+-flash(?!.*(lite|image|tts|live|audio))/],
  openai: [/^gpt-[\d.]+$/, /^gpt-4\.1$/, /^gpt-4o$/, /^gpt-/]
}

/** The strongest general model in a provider's list (used when the configured one is retired). */
export function preferredModel(provider: AiProvider, ids: string[]): string | undefined {
  const newestFirst = [...ids].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  for (const re of PREFERENCE[provider]) {
    const hit = newestFirst.find((id) => re.test(id))
    if (hit) return hit
  }
  return newestFirst[0]
}

/**
 * Runs with the configured model; if the provider retired it (or the key can't
 * use it), switches to the best model the key can use, reports it, retries once.
 */
export async function withModelFallback<T>(t: LlmTarget, run: (t: LlmTarget) => Promise<T>, onSwitch: (model: string) => void): Promise<T> {
  try {
    return await run(t)
  } catch (err) {
    if (!(err instanceof ModelUnavailableError)) throw err
    const pick = preferredModel(t.provider, await listModels(t))
    if (!pick || pick === t.model) throw err
    onSwitch(pick)
    return run({ ...t, model: pick })
  }
}

// ─── Transcript ─────────────────────────────────────────────
export function clock(total: number) {
  const s = Math.max(0, Math.floor(total))
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(s / 3600)
  return h ? `${h}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

/** "[mm:ss] S1: …" per speaker turn — the form every prompt cites back. */
export function transcriptLines(m: Meeting): string[] {
  const turns = m.transcription?.utterances ?? []
  if (turns.length) return turns.map((u) => `[${clock(u.start)}] S${u.speaker + 1}: ${u.transcript.trim()}`)
  return (m.transcription?.transcript.match(/[^.!?]+[.!?]*/g) ?? []).map((s) => s.trim()).filter(Boolean)
}

/** Consecutive lines packed into chunks of at most `size` chars (an oversized line is cut, never dropped). */
export function chunkLines(lines: string[], size: number): string[] {
  const chunks: string[] = []
  let cur = ''
  for (const line of lines) {
    if (cur && cur.length + line.length + 1 > size) {
      chunks.push(cur)
      cur = ''
    }
    cur += (cur ? '\n' : '') + line.slice(0, size)
  }
  if (cur) chunks.push(cur)
  return chunks
}

// ─── Local facts (no tokens spent) ──────────────────────────
export function talkTime(m: Meeting): Record<string, number> {
  const bySpeaker: Record<string, number> = {}
  for (const u of m.transcription?.utterances ?? []) {
    bySpeaker[`S${u.speaker + 1}`] = (bySpeaker[`S${u.speaker + 1}`] ?? 0) + Math.max(0, u.end - u.start)
  }
  const total = Object.values(bySpeaker).reduce((a, b) => a + b, 0)
  return Object.fromEntries(Object.entries(bySpeaker).map(([s, t]) => [s, total ? Math.round((t / total) * 100) : 0]))
}

// English + Hinglish filler — what a word cloud should never show
const STOP = new Set(`the and for you your not but all are was were has had have this that these those with from what when where which who how why our out
about into then than them they their its it's i'm we let lets let's say said see make sure thing things some any very much more only now here well just like yeah
yes okay also can will would should could there get got going know think want need one two right actually basically really because been being does did doing
done over under again still even maybe little lot kind sort mean hmm uh um thank thanks please sir haan han hai hain ka ki ke ko se me mein main hum ham aap tum
yeh ye woh wo to toh bhi kya nahi nahin na ek kar karo karna kr krna ho hoga hota tha thi the raha rahe rahi gaya gayi diya liya abhi bas matlab accha acha
theek thik bhai yaar sab agar lekin aur par pe unko usko isko jo jab tab koi kuch kyun kaise kaisa waise aise wala wali wale dekho dekh bolo bol hua hui huye`.split(/\s+/))

export function wordFrequency(m: Meeting, top = 40): Record<string, number> {
  const counts = new Map<string, number>()
  for (const w of (m.transcription?.transcript ?? '').toLowerCase().match(/[a-z][a-z'-]{2,}/g) ?? []) {
    if (!STOP.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1)
  }
  return Object.fromEntries([...counts].sort((a, b) => b[1] - a[1]).slice(0, top))
}

const terms = (text: string) => new Set((text.toLowerCase().match(/[a-z0-9_][a-z0-9_.-]{3,}/g) ?? []).filter((w) => !STOP.has(w)))
const overlap = (text: string, query: Set<string>) => [...terms(text)].filter((w) => query.has(w)).length

// ─── Long meetings: part-by-part digest ─────────────────────
const DIGEST_SYSTEM = `You condense one part of a long meeting transcript into dense English notes for a later summary. The meeting may be in Hinglish (Hindi + English); translate meaning, keep names.
Keep every decision, task (owner + deadline), requirement, number, and technical detail (pages, screens, APIs, files, fields, tools), every disagreement and open question — each with its [mm:ss] time and speaker (S1, S2…).
Drop greetings and filler. At most 350 words, plain "- " bullets, no preamble.`

type Progress = (stage: string) => void

async function digestLines(lines: string[], t: LlmTarget, size: number, progress?: Progress, signal?: AbortSignal): Promise<string[]> {
  const chunks = chunkLines(lines, size)
  const parts: string[] = []
  for (const [i, chunk] of chunks.entries()) {
    progress?.(`condensing part ${i + 1}/${chunks.length}`)
    const from = /\[([\d:]+)\]/.exec(chunk)?.[1]
    const to = /\[([\d:]+)\][^\n]*$/.exec(chunk)?.[1]
    const notes = await complete(t, [
      { role: 'system', content: DIGEST_SYSTEM },
      { role: 'user', content: `Part ${i + 1} of ${chunks.length}:\n${chunk}` }
    ], { maxTokens: 900, signal })
    parts.push(`PART ${i + 1}/${chunks.length}${from ? ` [${from}–${to}]` : ''}\n${notes.trim()}`)
  }
  return parts
}

/** Digest until the notes fit the budget (a 2h meeting on Groq takes two rounds). */
export async function digestToFit(lines: string[], t: LlmTarget, budget: number, progress?: Progress, signal?: AbortSignal): Promise<string[]> {
  const size = Math.floor(budget * 0.6)
  let parts = await digestLines(lines, t, size, progress, signal)
  for (let round = 0; round < 3 && parts.length > 1 && parts.join('\n\n').length > budget * 0.7; round++) {
    const next = await digestLines(parts, t, size, progress, signal)
    if (next.length >= parts.length) return next // not shrinking any more — stop, never loop
    parts = next
  }
  return parts
}

/** Full transcript when it fits; otherwise cached or fresh part notes. */
export async function meetingMaterial(m: Meeting, t: LlmTarget, budget: number, progress?: Progress, signal?: AbortSignal): Promise<{ text: string; digest?: MeetingDigest }> {
  const lines = transcriptLines(m)
  const full = lines.join('\n')
  if (full.length <= budget * 0.7) return { text: `TRANSCRIPT\n${full}` }
  const parts = m.digest?.sourceChars === full.length ? m.digest.parts : await digestToFit(lines, t, budget, progress, signal)
  return {
    text: `MEETING NOTES (the transcript was condensed part by part)\n${parts.join('\n\n')}`,
    digest: { sourceChars: full.length, parts }
  }
}

// ─── Analysis ───────────────────────────────────────────────
const ANALYSIS_SYSTEM = `You are EVES, the meeting-intelligence engine of a software team. You read a meeting (often Hinglish — Hindi and English mixed) and return ONLY one JSON object: no markdown, no prose. Write every value in clear English.
{
 "mainGoal": "the single outcome the work discussed must achieve — one sentence",
 "tldr": "max 25 words",
 "summary": "5-8 sentences: what was discussed, decided and left open",
 "keyDecisions": [{"decision": "", "madeBy": "", "timestamp": "mm:ss"}],
 "actionItems": [{"task": "", "owner": "name or Unassigned", "dueDate": "as said, or empty", "priority": "HIGH|MEDIUM|LOW", "completed": false}],
 "intentions": [{"speaker": "", "explicitGoal": "", "hiddenAgenda": "", "sentiment": "POSITIVE|NEUTRAL|CAUTIOUS|NEGATIVE"}],
 "sentimentByMinute": [{"minute": 0, "score": 0.0, "dominantEmotion": ""}],
 "mainTopics": [{"topic": "", "durationPercent": 0, "startTimestamp": "mm:ss"}],
 "concerns": [""], "agreements": [""], "openQuestions": [""],
 "speakerProfiles": [{"name": "", "role": "", "communicationStyle": "", "agenda": "", "talkTimePercent": 0}],
 "meetingType": "SALES|ONE_ON_ONE|PLANNING|STANDUP|INTERVIEW|NEGOTIATION|OTHER",
 "urgency": "LOW|MEDIUM|HIGH|CRITICAL",
 "overallMood": "POSITIVE|NEUTRAL|TENSE|MIXED|PRODUCTIVE",
 "powerDynamics": "one or two sentences",
 "suggestedTags": ["3-6 short tags"]
}
Rules: speakers appear as S1, S2… — use a real name only when the meeting reveals it. Take talkTimePercent from the measured numbers given. sentimentByMinute has 6-20 points spread over the meeting (score -1..1). Timestamps come from the [mm:ss] marks. Never invent facts; use empty arrays when there is nothing.`

const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d)
const num = (v: unknown, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d)
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], d: T): T => (allowed.includes(v as T) ? (v as T) : d)
const list = <T>(v: unknown, map: (x: any) => T | null): T[] => (Array.isArray(v) ? v.map(map).filter((x): x is T => x != null) : [])
const strings = (v: unknown) => list(v, (x) => (typeof x === 'string' && x.trim() ? x : null))

/** Whatever the model returned → a MeetingAnalysis every chart can render. */
export function normalizeAnalysis(raw: any, m: Meeting, talk: Record<string, number>): MeetingAnalysis {
  const r = raw && typeof raw === 'object' ? raw : {}
  return {
    mainGoal: str(r.mainGoal),
    tldr: str(r.tldr, 'No summary returned'),
    summary: str(r.summary),
    keyDecisions: list(r.keyDecisions, (d) => (d?.decision ? { decision: str(d.decision), madeBy: str(d.madeBy, 'Team'), timestamp: str(d.timestamp) } : null)),
    actionItems: list(r.actionItems, (a) => (a?.task ? {
      task: str(a.task),
      owner: str(a.owner, 'Unassigned'),
      dueDate: str(a.dueDate),
      priority: oneOf(a.priority, ['HIGH', 'MEDIUM', 'LOW'] as const, 'MEDIUM'),
      completed: false
    } : null)),
    intentions: list(r.intentions, (i) => (i?.speaker ? {
      speaker: str(i.speaker),
      explicitGoal: str(i.explicitGoal),
      hiddenAgenda: str(i.hiddenAgenda),
      sentiment: oneOf(i.sentiment, ['POSITIVE', 'NEUTRAL', 'CAUTIOUS', 'NEGATIVE'] as const, 'NEUTRAL')
    } : null)),
    sentimentByMinute: list(r.sentimentByMinute, (p) => (p ? { minute: num(p.minute), score: Math.max(-1, Math.min(1, num(p.score))), dominantEmotion: str(p.dominantEmotion, 'neutral') } : null)),
    mainTopics: list(r.mainTopics, (t) => (t?.topic ? { topic: str(t.topic), durationPercent: num(t.durationPercent), startTimestamp: str(t.startTimestamp) } : null)),
    concerns: strings(r.concerns),
    agreements: strings(r.agreements),
    openQuestions: strings(r.openQuestions),
    speakerProfiles: list(r.speakerProfiles, (s) => (s?.name ? {
      name: str(s.name),
      role: str(s.role),
      communicationStyle: str(s.communicationStyle),
      agenda: str(s.agenda),
      talkTimePercent: talk[str(s.name)] ?? num(s.talkTimePercent)
    } : null)),
    meetingType: oneOf(r.meetingType, ['SALES', 'ONE_ON_ONE', 'PLANNING', 'STANDUP', 'INTERVIEW', 'NEGOTIATION', 'OTHER'] as const, 'OTHER'),
    urgency: oneOf(r.urgency, ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const, 'MEDIUM'),
    overallMood: oneOf(r.overallMood, ['POSITIVE', 'NEUTRAL', 'TENSE', 'MIXED', 'PRODUCTIVE'] as const, 'NEUTRAL'),
    // counted locally — cheaper and exact
    wordFrequency: wordFrequency(m),
    powerDynamics: str(r.powerDynamics),
    suggestedTags: strings(r.suggestedTags).slice(0, 6)
  }
}

export async function analyzeMeeting(m: Meeting, t: LlmTarget, budget: number, progress?: Progress, signal?: AbortSignal) {
  const { text, digest } = await meetingMaterial(m, t, budget, progress, signal)
  const talk = talkTime(m)
  const facts = [
    `Meeting: ${m.title} · ${new Date(m.date).toDateString()} · ${clock(m.duration)} long`,
    `Measured talk time: ${Object.entries(talk).map(([s, p]) => `${s} ${p}%`).join(', ') || 'unknown'}`
  ].join('\n')
  progress?.('summarising')
  const raw = await completeJson(t, [
    { role: 'system', content: ANALYSIS_SYSTEM },
    { role: 'user', content: `${facts}\n\n${text}` }
  ], { maxTokens: 4096, signal })
  return { analysis: normalizeAnalysis(raw, m, talk), digest }
}

// ─── Chat context ───────────────────────────────────────────
function analysisBrief(a?: MeetingAnalysis): string {
  if (!a) return ''
  const bullets = (title: string, items: string[]) => (items.length ? `${title}:\n${items.map((x) => `- ${x}`).join('\n')}` : '')
  return [
    'MEETING SUMMARY (EVES analysis)',
    a.mainGoal && `Main goal: ${a.mainGoal}`,
    `TL;DR: ${a.tldr}`,
    a.summary,
    bullets('Decisions', a.keyDecisions.map((d) => `${d.decision} — ${d.madeBy}${d.timestamp ? ` [${d.timestamp}]` : ''}`)),
    bullets('Action items', a.actionItems.map((i) => `${i.task} — ${i.owner}${i.dueDate ? `, due ${i.dueDate}` : ''} (${i.priority})`)),
    bullets('Open questions', a.openQuestions)
  ].filter(Boolean).join('\n')
}

/**
 * What of the meeting fits `budget`: the whole transcript when possible,
 * otherwise the summary, the most relevant part notes and raw excerpts around
 * the question's words (so answers can still quote exact lines).
 */
export function meetingForQuestion(m: Meeting, budget: number, question: string): string {
  const lines = transcriptLines(m)
  const brief = analysisBrief(m.analysis)
  const full = lines.join('\n')
  if (brief.length + full.length + 40 <= budget) return [brief, `FULL TRANSCRIPT (${clock(m.duration)})\n${full}`].filter(Boolean).join('\n\n')

  const q = terms(question)
  const out: string[] = brief ? [brief] : []
  let room = budget - brief.length

  const parts = (m.digest?.parts ?? []).map((p, i) => ({ p, i, score: overlap(p, q) }))
  const chosen = parts.slice().sort((a, b) => b.score - a.score || a.i - b.i).filter(({ p }) => (p.length + 2 <= room ? ((room -= p.length + 2), true) : false))
  if (chosen.length) out.push(`PART NOTES\n${chosen.sort((a, b) => a.i - b.i).map((x) => x.p).join('\n\n')}`)

  // raw windows (±2 turns) around the lines that mention the question's terms
  const hits = lines.map((l, i) => ({ i, score: overlap(l, q) })).filter((h) => h.score > 0).sort((a, b) => b.score - a.score)
  const taken = new Set<number>()
  const excerpts: string[] = []
  for (const { i } of hits) {
    const span = lines.slice(Math.max(0, i - 2), i + 3).filter((_, k) => !taken.has(Math.max(0, i - 2) + k))
    const text = span.join('\n')
    if (!span.length || text.length + 5 > room) continue
    for (let k = Math.max(0, i - 2); k < i + 3; k++) taken.add(k)
    excerpts.push(text)
    room -= text.length + 5
  }
  if (excerpts.length) out.push(`TRANSCRIPT EXCERPTS (matching the question)\n${excerpts.join('\n…\n')}`)
  if (!chosen.length && !excerpts.length && !brief) out.push(`TRANSCRIPT (opening part)\n${full.slice(0, room)}`)
  return out.join('\n\n')
}

// ─── Prompt pills ───────────────────────────────────────────
const TOOL_RULES: Record<'codex' | 'claude' | 'cursor', { name: string; rules: string }> = {
  codex: { name: 'Codex', rules: 'Work autonomously in small, verified steps; run the type-check/build after each step; keep diffs minimal and focused.' },
  claude: { name: 'Claude Code', rules: 'Start in plan mode: present the plan and wait for approval before editing; keep a running log of every file changed and why.' },
  cursor: { name: 'Cursor', rules: 'Use Agent mode; @-reference the files listed in the codebase map; apply edits file by file and show each diff.' }
}

export const isToolPill = (p?: PillId): p is 'codex' | 'claude' | 'cursor' => p === 'codex' || p === 'claude' || p === 'cursor'

function toolAsk(tool: 'codex' | 'claude' | 'cursor', hasVault: boolean) {
  const { name, rules } = TOOL_RULES[tool]
  return `Write the task-specific body of a production-grade prompt the user will paste into ${name}. EVES already added the header with section 0 (workspace) and section 1 (skill vault) — start at section 2 and use exactly these markdown headings:
## 2. MISSION — what to build and why, 2-3 sentences, from the meeting.
## 3. MEETING CONTEXT — the decisions, requirements, constraints, names and numbers that matter, with [mm:ss] references.
${hasVault ? '## 4. SKILLS TO LOAD — 2-6 exact skill paths from the vault catalog that fit this task, one line each saying why.\n' : '## 4. SKILLS TO LOAD — "none attached".\n'}## 5. CODEBASE MAP — real files/modules from the repository index to read or change (mark NEW files) and what changes in each.
## 6. IMPLEMENTATION PLAN — ordered, small, verifiable steps.
## 7. EXPECTED RESULT ON SCREEN — exactly what the user sees in the frontend when done: layout, components, states (empty/loading/error/success), interactions.
## 8. ACCEPTANCE CRITERIA — checkable bullets, including the exact verification commands (type check, build, tests) for this repository.
## 9. RULES — ${rules} Never invent files or APIs that are not in the repository; ask before destructive changes; follow the company standards in the vault when present.
Write it in English, addressed to the coding agent. Output only these sections — no preamble, no closing remarks.`
}

const ASKS: Record<Exclude<PillId, 'codex' | 'claude' | 'cursor'>, string> = {
  goal: 'What is the main goal of this meeting? State it in 1-2 sentences, then give: **Why it matters**, **Definition of done** (3-6 checkable bullets), **Owner & deadline** (as said, with [mm:ss]), **Not in scope** (anything ruled out).',
  how: 'Explain exactly what I have to build and how to build it in the company repository: 1) the change in one paragraph, 2) files/modules to touch (real paths from the repository index, NEW for new files) and what changes in each, 3) data / API / state changes, 4) step-by-step plan, 5) edge cases and risks, 6) how to verify it works.',
  frontend: 'Describe exactly what the user will see in the frontend once this is built: the page/screen, layout top to bottom, every component with its states (empty, loading, error, success), interactions, navigation and labels. Then give a faithful visual mock as ONE self-contained HTML document with inline CSS — no JavaScript, no external assets or fonts — inside a ```html code block. Match the product\'s existing look if the repository index reveals it; otherwise use a clean dark dashboard style.',
  actions: 'List every action item from the meeting as a markdown table: Task | Owner | Deadline | Priority | Time. Then list, in order, what I should do first.',
  risks: 'List the open questions, ambiguities and risks that could make the implementation wrong — unclear requirements, conflicts with the current codebase, things nobody decided. For each, give the exact question I should ask the team.'
}

export function pillAsk(pill: PillId, hasVault: boolean) {
  return isToolPill(pill) ? toolAsk(pill, hasVault) : ASKS[pill]
}

// ─── Paths in prompts ───────────────────────────────────────
const joinPath = (dir: string, file: string) => `${dir.replace(/[\\/]+$/, '')}/${file}`

/** Sections 0-1 of every coding-tool prompt — deterministic, never left to the model. */
export function toolPromptHeader(tool: 'codex' | 'claude' | 'cursor', m: Pick<Meeting, 'title' | 'date'>, s: AppSettings, catalog?: string): string {
  const p = (x: string) => `\`${stylePath(x, s.promptPathStyle)}\``
  const out = [
    `# ${TOOL_RULES[tool].name.toUpperCase()} TASK PROMPT`,
    `> Generated by EVES from the meeting "${m.title}" (${new Date(m.date).toDateString()}).`,
    '',
    '## 0. WORKSPACE',
    s.companyRepoPath
      ? `Company repository: ${p(s.companyRepoPath)}\nWork only inside this repository.`
      : 'Company repository: not attached in EVES — ask the user for the repository path before editing files.',
    ''
  ]
  if (s.referenceRepoPath) {
    out.push(
      `## 1. CENTRAL SKILLS REPOSITORY (${s.promptPathStyle === 'wsl' ? 'WSL PATH' : 'WINDOWS PATH'})`,
      "You have access to the project's official centralized skill specifications repository located at:",
      p(s.referenceRepoPath)
    )
    if (catalog) out.push('Master catalog index:', p(joinPath(s.referenceRepoPath, catalog)))
    out.push('Read the catalog first and load the skills listed in section 4 before writing any code.', '')
  }
  return out.join('\n')
}

// ─── Chat assembly ──────────────────────────────────────────
export interface ContextBlock {
  title: string
  text: string
}

const LANGUAGE = {
  english: 'Reply in clear, simple English.',
  hinglish: 'Reply in Hinglish — Hindi written in Roman script mixed with English, the way the user writes. Keep code, file paths and technical terms in English.'
}

/**
 * System prompt + trimmed history + the new question. Budget split: company
 * repo ≤ 22%, skill vault ≤ 14%, history ≤ 10%, meeting gets the rest.
 */
export function brainMessages(o: {
  meeting: Meeting
  history: ChatMessage[]
  pill?: PillId
  settings: AppSettings
  company?: ContextBlock | null
  vault?: ContextBlock | null
  budget: number
}): Msg[] {
  const { meeting, settings, budget } = o
  const latest = o.history[o.history.length - 1]
  const ask = o.pill ? pillAsk(o.pill, !!o.vault) : latest?.text ?? ''
  const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}\n…(trimmed)` : text)

  const company = o.company ? cut(o.company.text, budget * 0.22) : ''
  const vault = o.vault ? cut(o.vault.text, budget * 0.14) : ''

  const history: Msg[] = []
  let room = budget * 0.1
  for (const msg of o.history.slice(0, -1).reverse()) {
    if (msg.error || msg.text.length > room) break
    room -= msg.text.length
    history.unshift({ role: msg.role, content: msg.text })
  }

  const meetingRoom = budget - company.length - vault.length - (budget * 0.1 - room) - 2500
  const question = `${ask}\n${meeting.analysis?.mainGoal ?? ''}`
  const language = isToolPill(o.pill) ? 'Write the prompt in English.' : LANGUAGE[settings.brainLanguage]

  const system = [
    `You are EVES BRAIN — the user's senior engineering copilot at their company. You know three things: the recorded meeting below (speakers S1, S2…, times [mm:ss]), the company repository index, and the user's skill vault.`,
    'Ground every statement in that context. Cite [mm:ss] when you rely on what someone said. If something was not discussed or is not in the repository index, say so plainly instead of guessing.',
    'Use real file paths from the repository index and mark proposed files as NEW. Be concrete and structured: short headings, bullets, numbered steps, no filler.',
    language,
    '',
    `=== MEETING: ${meeting.title} (${new Date(meeting.date).toDateString()}, ${clock(meeting.duration)}) ===`,
    meetingForQuestion(meeting, Math.max(2000, meetingRoom), question),
    company && `\n=== ${o.company!.title} ===\n${company}`,
    vault && `\n=== ${o.vault!.title} ===\n${vault}`
  ].filter((x) => x !== '').join('\n')

  return [{ role: 'system', content: system }, ...history, { role: 'user', content: ask }]
}
