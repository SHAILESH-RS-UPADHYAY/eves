// One client for Groq, Gemini (AI Studio) and OpenAI — all three speak the
// OpenAI chat-completions dialect, so no SDKs. Kept free of runtime imports so
// `node core/utils/llm.test.mts` can exercise it directly.
import type { AiProvider } from '../../src/types'

export interface LlmTarget {
  provider: AiProvider
  label: string
  base: string
  model: string
  key: string
}

export type Msg = { role: 'system' | 'user' | 'assistant'; content: string }

/** The provider retired the model or the key can't use it — the caller may switch models. */
export class ModelUnavailableError extends Error {}
const MODEL_GONE = /model_not_found|decommissioned|does not exist|not found for API version|is not supported/i

interface CallOptions {
  json?: boolean
  maxTokens?: number
  signal?: AbortSignal
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason) }, { once: true })
  })

/** How long a 429 asks us to wait: Retry-After header, or Groq's "try again in 1m2.5s". */
export function retryDelay(header: string | null, body: string): number | null {
  if (header && Number.isFinite(Number(header))) return Number(header) * 1000
  const m = /try again in (?:(\d+)m)?([\d.]+)s/i.exec(body)
  return m ? (Number(m[1] ?? 0) * 60 + Number(m[2])) * 1000 : null
}

/** Provider error → a sentence that says what to do. */
export function describeError(t: Pick<LlmTarget, 'label' | 'model'>, status: number, body: string) {
  let detail = body.slice(0, 280)
  try {
    const j = JSON.parse(body)
    detail = (Array.isArray(j) ? j[0]?.error : j.error)?.message ?? detail
  } catch { /* not JSON — keep the raw text */ }
  if (status === 401 || status === 403) return `${t.label} rejected the API key (${status}) — check it in Settings → API Keys.`
  if (status === 404) return `${t.label} has no model "${t.model}" — pick another in Settings → Brain. (${detail})`
  if (status === 413) return `The request is too large for ${t.label} — switch the brain to Gemini for very long meetings. (${detail})`
  if (status === 429) return `${t.label} rate limit reached — ${detail}`
  return `${t.label} error ${status}: ${detail}`
}

async function request(t: LlmTarget, body: object, signal?: AbortSignal): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${t.base}/chat/completions`, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t.key}` },
      body: JSON.stringify({ model: t.model, ...body })
    })
    if (res.ok) return res
    const text = await res.text()
    const wait = retryDelay(res.headers.get('retry-after'), text) ?? 2000 * 2 ** attempt
    if ((res.status === 429 || res.status >= 500) && attempt < 3 && wait <= 65_000) {
      await sleep(wait, signal)
      continue
    }
    const message = describeError(t, res.status, text)
    throw (res.status === 404 || (res.status === 400 && MODEL_GONE.test(text))) ? new ModelUnavailableError(message) : new Error(message)
  }
}

/**
 * Groq counts requested output tokens against its per-minute budget, so it gets
 * an explicit cap; Gemini/OpenAI keep their defaults (newer OpenAI models reject
 * non-default temperature). Gemini gets JSON through instructions only.
 */
function tuning(t: LlmTarget, o: CallOptions) {
  return {
    ...(t.provider === 'groq' && { max_completion_tokens: o.maxTokens ?? 4096, temperature: o.json ? 0.2 : 0.5 }),
    ...(o.json && t.provider !== 'gemini' && { response_format: { type: 'json_object' } })
  }
}

export async function complete(t: LlmTarget, messages: Msg[], o: CallOptions = {}): Promise<string> {
  const res = await request(t, { messages, ...tuning(t, o) }, o.signal)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error(`${t.label} returned an empty answer`)
  return text
}

/** Streams the reply, calling onDelta per token batch; resolves with the full text. */
export async function stream(t: LlmTarget, messages: Msg[], onDelta: (text: string) => void, o: CallOptions = {}): Promise<string> {
  const res = await request(t, { messages, stream: true, ...tuning(t, o) }, o.signal)
  let full = ''
  for await (const data of sseEvents(res.body!)) {
    const delta = JSON.parse(data).choices?.[0]?.delta?.content
    if (delta) {
      full += delta
      onDelta(delta)
    }
  }
  if (!full) throw new Error(`${t.label} returned an empty answer`)
  return full
}

/** `data:` payloads of a server-sent-events body, until [DONE]. */
export async function* sseEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) return
    buf += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim()
      buf = buf.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') return
      if (data) yield data
    }
  }
}

/** The outermost {...} of a reply — models wrap JSON in fences or prose despite instructions. */
export function extractJson<T>(text: string): T {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('The model did not return JSON')
  return JSON.parse(text.slice(start, end + 1)) as T
}

export async function completeJson<T>(t: LlmTarget, messages: Msg[], o: CallOptions = {}): Promise<T> {
  const text = await complete(t, messages, { ...o, json: true })
  try {
    return extractJson<T>(text)
  } catch {
    // one repair round-trip — models occasionally truncate or trail prose
    const fixed = await complete(t, [
      ...messages,
      { role: 'assistant', content: text },
      { role: 'user', content: 'That was not valid JSON. Reply with the corrected JSON object only.' }
    ], { ...o, json: true })
    return extractJson<T>(fixed)
  }
}

const NON_CHAT = /embed|tts|whisper|dall-e|image|audio|realtime|transcribe|moderation|guard|veo|imagen|aqa|computer-use|playai|orpheus/i

/** Chat-capable model ids the key can use — doubles as the key check. */
export async function listModels(t: Pick<LlmTarget, 'label' | 'base' | 'key'>): Promise<string[]> {
  const res = await fetch(`${t.base}/models`, { headers: { Authorization: `Bearer ${t.key}` } })
  const text = await res.text()
  if (!res.ok) throw new Error(describeError({ ...t, model: '' }, res.status, text))
  const ids: string[] = (JSON.parse(text).data ?? []).map((m: { id: string }) => String(m.id).replace(/^models\//, ''))
  return ids.filter((id) => !NON_CHAT.test(id)).sort()
}
