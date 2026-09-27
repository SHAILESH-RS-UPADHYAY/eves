// Deepgram live-streaming helpers shared by the EVES popup (meeting capture) and
// the brain's voice composer.

/** 'multi' = nova-3 code-switching (Hindi ↔ English in one sentence) — Hinglish. */
export function deepgramUrl(o: { language?: string; diarize?: boolean; keyterms?: string[] } = {}) {
  const language = o.language || 'multi'
  const params = new URLSearchParams({
    encoding: 'linear16',
    sample_rate: '16000',
    channels: '1',
    model: language === 'multi' ? 'nova-3' : 'nova-2',
    language,
    smart_format: 'true',
    interim_results: 'true',
    diarize: String(o.diarize ?? false),
    endpointing: '300'
  })
  // keyterm prompting (nova-3) — product names the brain listens for
  if (language === 'multi') o.keyterms?.forEach((k) => params.append('keyterm', k))
  return `wss://api.deepgram.com/v1/listen?${params}`
}

/** Float32 samples → 16-bit little-endian PCM, the encoding the socket expects. */
export function toPcm16(input: Float32Array): ArrayBuffer {
  const pcm = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return pcm.buffer
}
