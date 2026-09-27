// node core/utils/llm.test.mts — exercises the client against a fake fetch (no network, no keys)
import assert from 'node:assert/strict'
import { complete, completeJson, extractJson, ModelUnavailableError, retryDelay, sseEvents, stream, type LlmTarget } from './llm.ts'

const target: LlmTarget = { provider: 'groq', label: 'GROQ', base: 'https://fake.local/v1', model: 'm', key: 'k' }
const enc = new TextEncoder()
const body = (chunks: string[]) => new ReadableStream<Uint8Array>({
  start(c) { chunks.forEach((x) => c.enqueue(enc.encode(x))); c.close() }
})
const sse = (...deltas: string[]) => [
  ...deltas.map((d) => `data: ${JSON.stringify({ choices: [{ delta: { content: d } }] })}\n\n`),
  'data: [DONE]\n\n'
]

// retry hints
assert.equal(retryDelay('7', ''), 7000)
assert.equal(retryDelay(null, 'Rate limit reached. Please try again in 1m2.5s.'), 62500)
assert.equal(retryDelay(null, 'Please try again in 7.66s'), 7660)
assert.equal(retryDelay(null, 'nope'), null)

// JSON salvage
assert.deepEqual(extractJson('```json\n{"a":1,"b":{"c":2}}\n```'), { a: 1, b: { c: 2 } })
assert.deepEqual(extractJson('Sure! Here it is: {"ok":true} Hope that helps.'), { ok: true })
assert.throws(() => extractJson('no json here'))

// SSE lines split across chunks
const got: string[] = []
for await (const d of sseEvents(body(['data: {"x":1}\n\nda', 'ta: {"x":2}\r\n\r\n: ping\n\ndata: [DONE]\n\ndata: {"x":3}\n']))) got.push(d)
assert.deepEqual(got, ['{"x":1}', '{"x":2}'])

// fake fetch: scripted responses, records every request
let script: Response[] = []
const calls: { url: string; body: any }[] = []
globalThis.fetch = (async (url: string, init: RequestInit) => {
  calls.push({ url, body: JSON.parse(String(init.body)) })
  const next = script.shift()
  if (!next) throw new Error('unexpected fetch')
  return next
}) as typeof fetch

// 429 → retried after Retry-After, then streamed
script = [
  new Response('{"error":{"message":"slow down"}}', { status: 429, headers: { 'retry-after': '0' } }),
  new Response(body(sse('Hel', 'lo'))),
]
const deltas: string[] = []
assert.equal(await stream(target, [{ role: 'user', content: 'hi' }], (d) => deltas.push(d)), 'Hello')
assert.deepEqual(deltas, ['Hel', 'lo'])
assert.equal(calls.length, 2)
assert.equal(calls[1].url, 'https://fake.local/v1/chat/completions')
assert.equal(calls[1].body.stream, true)
assert.equal(calls[1].body.max_completion_tokens, 4096) // groq gets an explicit cap

// bad key → actionable message, no retry
calls.length = 0
script = [new Response('{"error":{"message":"Invalid API Key"}}', { status: 401 })]
await assert.rejects(complete(target, []), /rejected the API key/)
assert.equal(calls.length, 1)

// broken JSON gets one repair round-trip; gemini is steered by instructions, not response_format
calls.length = 0
const gemini: LlmTarget = { ...target, provider: 'gemini', label: 'GEMINI' }
const reply = (content: string) => new Response(JSON.stringify({ choices: [{ message: { content } }] }))
script = [reply('Here you go: {"ok": tru'), reply('{"ok": true}')]
assert.deepEqual(await completeJson(gemini, [{ role: 'user', content: 'json please' }]), { ok: true })
assert.equal(calls.length, 2)
assert.equal(calls[0].body.response_format, undefined)
assert.equal(calls[0].body.max_completion_tokens, undefined)

// retired / unknown models surface as ModelUnavailableError (callers switch models)
script = [new Response('{"error":{"message":"The model `llama-3.3-70b-versatile` does not exist"}}', { status: 404 })]
await assert.rejects(complete(target, []), ModelUnavailableError)
script = [new Response('{"error":{"message":"The model `x` has been decommissioned","code":"model_decommissioned"}}', { status: 400 })]
await assert.rejects(complete(target, []), ModelUnavailableError)
script = [new Response('{"error":{"message":"messages: required"}}', { status: 400 })]
await assert.rejects(complete(target, []), (e: unknown) => !(e instanceof ModelUnavailableError))

console.log('llm: ok')
