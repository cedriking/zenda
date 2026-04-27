import { logger } from '../../../infra/logger.js'

interface TranscriptionResult {
  text: string
  confidence: number
  language: string
  duration: number
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  options?: { language?: 'en' | 'es'; provider?: 'openai' | 'zai' },
): Promise<TranscriptionResult> {
  const provider = options?.provider ?? 'openai'

  try {
    if (provider === 'openai') {
      return await transcribeWithOpenAI(audioBuffer, options?.language)
    }
    return await transcribeWithZAI(audioBuffer, options?.language)
  } catch (err) {
    logger.error('Transcription failed', { provider, error: (err as Error).message })
    throw err
  }
}

async function transcribeWithOpenAI(
  audioBuffer: Buffer,
  language?: string,
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const formData = new FormData()
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/ogg; codecs=opus' })
  formData.append('file', blob, 'audio.ogg')
  formData.append('model', 'whisper-1')
  formData.append('response_format', 'verbose_json')
  if (language) formData.append('language', language)

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI Whisper error: ${err}`)
  }

  const data = await res.json() as {
    text: string
    language: string
    duration: number
    segments?: Array<{ avg_logprob: number }>
  }

  const avgConfidence = data.segments?.length
    ? Math.exp(data.segments.reduce((sum, s) => sum + s.avg_logprob, 0) / data.segments.length)
    : 0.9

  return {
    text: data.text,
    confidence: avgConfidence,
    language: data.language,
    duration: data.duration,
  }
}

async function transcribeWithZAI(
  audioBuffer: Buffer,
  language?: string,
): Promise<TranscriptionResult> {
  const baseUrl = process.env.ZAI_BASE ?? 'https://api.z.ai/v1'
  const apiKey = process.env.ZAI_API_KEY
  if (!apiKey) throw new Error('ZAI_API_KEY not configured')

  const formData = new FormData()
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/ogg; codecs=opus' })
  formData.append('file', blob, 'audio.ogg')
  formData.append('model', 'whisper')
  if (language) formData.append('language', language)

  const res = await fetch(`${baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Z.ai transcription error: ${err}`)
  }

  const data = await res.json() as { text: string; language?: string; duration?: number }

  return {
    text: data.text,
    confidence: 0.9,
    language: data.language ?? language ?? 'es',
    duration: data.duration ?? 0,
  }
}
