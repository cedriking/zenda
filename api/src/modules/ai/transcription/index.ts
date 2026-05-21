export type TranscriptionProvider = 'local' | 'openai' | 'zai'

/** Local Whisper STT server URL — read lazily to avoid side effects from env.ts */
function getLocalWhisperUrl(): string {
  return process.env.WHISPER_LOCAL_URL ?? 'http://192.168.68.131:8001'
}

export interface TranscriptionOptions {
  language?: 'en' | 'es'
  provider?: TranscriptionProvider
  mimeType?: string
}

export interface TranscriptionResult {
  text: string
  confidence?: number
  language?: string
  duration?: number
}

/**
 * Transcribe audio buffer using the provider chain: local → OpenAI → ZAI.
 * Handles:
 * - Local faster-whisper (primary — low latency, no API cost)
 * - OpenAI Whisper-1 (cloud fallback)
 * - ZAI Whisper (cloud fallback)
 * - Unsupported formats → normalized MIME
 * - Silent/empty audio → returns empty text
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  options?: TranscriptionOptions,
): Promise<TranscriptionResult> {
  if (!audioBuffer || audioBuffer.length === 0) {
    return { text: '', confidence: 0, language: options?.language ?? 'en' }
  }

  // Minimum size check: < 1KB likely not real audio
  if (audioBuffer.length < 1024) {
    return { text: '', confidence: 0, language: options?.language ?? 'en' }
  }

  type ProviderEntry = { name: TranscriptionProvider; fn: () => Promise<TranscriptionResult> }
  const providers: ProviderEntry[] = []

  const preferred = options?.provider ?? 'local'

  // Build provider chain with preferred first, then fallbacks
  const allProviders: ProviderEntry[] = [
    { name: 'local', fn: () => transcribeWithLocal(audioBuffer, options) },
    { name: 'openai', fn: () => transcribeWithOpenAI(audioBuffer, options) },
    { name: 'zai', fn: () => transcribeWithZAI(audioBuffer, options) },
  ]

  // Put preferred first, then remaining in order
  const preferredIdx = allProviders.findIndex(p => p.name === preferred)
  if (preferredIdx >= 0) {
    providers.push(allProviders[preferredIdx])
    allProviders.splice(preferredIdx, 1)
  }
  providers.push(...allProviders)

  let lastError: Error | null = null

  for (const provider of providers) {
    try {
      const result = await provider.fn()
      return result
    } catch (err) {
      console.warn(`[transcription] ${provider.name} failed:`, err instanceof Error ? err.message : err)
      lastError = err instanceof Error ? err : new Error(String(err))
      continue
    }
  }

  // All providers failed
  throw lastError ?? new Error('All transcription providers failed')
}

/**
 * Determine the MIME type and file extension for the audio blob.
 * Defaults to WhatsApp voice note format (OGG/Opus).
 */
function resolveAudioMime(mimeType?: string): { mime: string; ext: string } {
  if (!mimeType) return { mime: 'audio/ogg; codecs=opus', ext: 'ogg' }

  const lower = mimeType.toLowerCase()

  if (lower.includes('ogg') || lower.includes('opus')) {
    return { mime: 'audio/ogg; codecs=opus', ext: 'ogg' }
  }
  if (lower.includes('webm')) {
    return { mime: 'audio/webm', ext: 'webm' }
  }
  if (lower.includes('mp4') || lower.includes('m4a')) {
    return { mime: 'audio/mp4', ext: 'm4a' }
  }
  if (lower.includes('mpeg') || lower.includes('mp3')) {
    return { mime: 'audio/mpeg', ext: 'mp3' }
  }
  if (lower.includes('wav')) {
    return { mime: 'audio/wav', ext: 'wav' }
  }

  // Unknown format — try as OGG (Whisper accepts many formats)
  return { mime: 'audio/ogg; codecs=opus', ext: 'ogg' }
}

/**
 * Transcribe using local faster-whisper server.
 * Expects the server at WHISPER_LOCAL_URL with /transcribe endpoint.
 */
async function transcribeWithLocal(
  audioBuffer: Buffer,
  options?: TranscriptionOptions,
): Promise<TranscriptionResult> {
  const baseUrl = getLocalWhisperUrl()
  if (!baseUrl) throw new Error('WHISPER_LOCAL_URL not configured')

  const { ext } = resolveAudioMime(options?.mimeType)
  const filename = `voice_note.${ext}`

  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array(audioBuffer)]), filename)

  if (options?.language) {
    formData.append('language', options.language)
  }

  // Health check first — fast fail if server is down
  const healthResponse = await fetch(`${baseUrl}/health`, {
    signal: AbortSignal.timeout(3000),
  }).catch(() => null)

  if (!healthResponse?.ok) {
    throw new Error('Local Whisper server unavailable')
  }

  const response = await fetch(`${baseUrl}/transcribe`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(60000), // 60s timeout for large audio
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Local Whisper error ${response.status}: ${errorBody}`)
  }

  const data = await response.json() as {
    text: string
    language: string
    language_probability: number
    duration: number
  }

  return {
    text: data.text ?? '',
    confidence: data.language_probability ?? undefined,
    language: data.language ?? options?.language,
    duration: data.duration,
  }
}

async function transcribeWithOpenAI(
  audioBuffer: Buffer,
  options?: TranscriptionOptions,
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const { mime, ext } = resolveAudioMime(options?.mimeType)
  const filename = `voice_note.${ext}`

  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array(audioBuffer)], { type: mime }), filename)
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')

  if (options?.language) {
    formData.append('language', options.language)
  }

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI Whisper error ${response.status}: ${errorBody}`)
  }

  const data = await response.json() as {
    text: string
    language?: string
    duration?: number
    segments?: Array<{ avg_logprob: number }>
  }

  // Compute confidence from segment log probabilities
  let confidence: number | undefined
  if (data.segments && data.segments.length > 0) {
    const avgLogProb = data.segments.reduce((sum, s) => sum + s.avg_logprob, 0) / data.segments.length
    confidence = Math.max(0, Math.min(1, (avgLogProb + 1)))
  }

  return {
    text: data.text ?? '',
    confidence,
    language: data.language ?? options?.language,
    duration: data.duration,
  }
}

async function transcribeWithZAI(
  audioBuffer: Buffer,
  options?: TranscriptionOptions,
): Promise<TranscriptionResult> {
  const apiKey = process.env.ZAI_API_KEY
  if (!apiKey) throw new Error('ZAI_API_KEY not configured')

  const { mime, ext } = resolveAudioMime(options?.mimeType)
  const filename = `voice_note.${ext}`

  const formData = new FormData()
  formData.append('file', new Blob([new Uint8Array(audioBuffer)], { type: mime }), filename)
  formData.append('model', 'whisper')

  if (options?.language) {
    formData.append('language', options.language)
  }

  const response = await fetch('https://api.z.ai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`ZAI Whisper error ${response.status}: ${errorBody}`)
  }

  const data = await response.json() as {
    text: string
    language?: string
    duration?: number
  }

  return {
    text: data.text ?? '',
    confidence: undefined,
    language: data.language ?? options?.language,
    duration: data.duration,
  }
}
