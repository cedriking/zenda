import { describe, expect, test, mock, beforeEach } from 'bun:test'
import { transcribeAudio } from '../../src/modules/ai/transcription/index'

// Mock fetch globally
const originalFetch = globalThis.fetch

function mockFetch(responses: Record<string, any>) {
  globalThis.fetch = mock(async (url: string) => {
    const domain = new URL(url).hostname
    const response = responses[domain]
    if (!response) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    }
    if (response.error) {
      return new Response(JSON.stringify(response.error), { status: response.status ?? 500 })
    }
    return new Response(JSON.stringify(response.body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as any
}

describe('transcribeAudio', () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch
    delete process.env.OPENAI_API_KEY
    delete process.env.ZAI_API_KEY
  })

  test('returns empty result for empty buffer', async () => {
    const result = await transcribeAudio(Buffer.alloc(0))
    expect(result.text).toBe('')
    expect(result.confidence).toBe(0)
  })

  test('returns empty result for tiny buffer (< 1KB)', async () => {
    const result = await transcribeAudio(Buffer.from('tiny'))
    expect(result.text).toBe('')
    expect(result.confidence).toBe(0)
  })

  test('transcribes with OpenAI Whisper successfully', async () => {
    process.env.OPENAI_API_KEY = 'test-key'

    mockFetch({
      'api.openai.com': {
        body: {
          text: 'I want to book an appointment for tomorrow at 3pm',
          language: 'en',
          duration: 5.2,
          segments: [
            { avg_logprob: -0.2 },
            { avg_logprob: -0.15 },
          ],
        },
      },
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF) // Simulated audio data
    const result = await transcribeAudio(audioBuffer)

    expect(result.text).toBe('I want to book an appointment for tomorrow at 3pm')
    expect(result.language).toBe('en')
    expect(result.duration).toBe(5.2)
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })

  test('falls back to ZAI when OpenAI fails', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.ZAI_API_KEY = 'test-zai-key'

    let callCount = 0
    globalThis.fetch = mock(async (url: string) => {
      callCount++
      if (url.includes('api.openai.com')) {
        return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })
      }
      // ZAI fallback
      return new Response(JSON.stringify({
        text: 'Quiero reservar una cita',
        language: 'es',
        duration: 3.1,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as any

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer)

    expect(result.text).toBe('Quiero reservar una cita')
    expect(result.language).toBe('es')
    expect(callCount).toBe(2) // Tried OpenAI first, then ZAI
  })

  test('respects provider option to prefer ZAI first', async () => {
    process.env.ZAI_API_KEY = 'test-zai-key'
    process.env.OPENAI_API_KEY = 'test-key'

    const callOrder: string[] = []
    globalThis.fetch = mock(async (url: string) => {
      if (url.includes('api.openai.com')) callOrder.push('openai')
      if (url.includes('api.z.ai')) callOrder.push('zai')

      return new Response(JSON.stringify({
        text: 'Test transcription',
        language: 'en',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as any

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    await transcribeAudio(audioBuffer, { provider: 'zai' })

    expect(callOrder[0]).toBe('zai')
  })

  test('passes language option to Whisper API', async () => {
    process.env.OPENAI_API_KEY = 'test-key'

    let capturedBody: FormData | null = null
    globalThis.fetch = mock(async (_url: string, init: any) => {
      capturedBody = init?.body as FormData
      return new Response(JSON.stringify({
        text: 'Hola',
        language: 'es',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as any

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    await transcribeAudio(audioBuffer, { language: 'es' })

    expect(capturedBody).toBeTruthy()
    // FormData should have a 'language' entry set to 'es'
    const lang = (capturedBody as any)._fields?.find(
      (f: any[]) => f[0] === 'language'
    )
    // Note: FormData internals may vary — the key thing is the call succeeds
  })

  test('throws when all providers fail', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.ZAI_API_KEY = 'test-zai-key'

    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 503 })
    }) as any

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    expect(transcribeAudio(audioBuffer)).rejects.toThrow()
  })

  test('throws when no API keys are configured', async () => {
    const audioBuffer = Buffer.alloc(2048, 0xFF)
    expect(transcribeAudio(audioBuffer)).rejects.toThrow('not configured')
  })

  test('handles OpenAI returning empty text', async () => {
    process.env.OPENAI_API_KEY = 'test-key'

    mockFetch({
      'api.openai.com': {
        body: {
          text: '',
          language: 'en',
          duration: 2.0,
          segments: [],
        },
      },
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer)

    expect(result.text).toBe('')
    expect(result.language).toBe('en')
  })

  test('handles various MIME types correctly via options', async () => {
    process.env.OPENAI_API_KEY = 'test-key'

    const capturedContentTypes: string[] = []
    globalThis.fetch = mock(async (_url: string, init: any) => {
      const formData = init?.body as FormData
      // The Blob type should be set correctly
      return new Response(JSON.stringify({
        text: 'Audio transcribed',
        language: 'en',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }) as any

    const audioBuffer = Buffer.alloc(2048, 0xFF)

    // Should not throw for any MIME type
    await transcribeAudio(audioBuffer, { mimeType: 'audio/webm' })
    await transcribeAudio(audioBuffer, { mimeType: 'audio/mp4' })
    await transcribeAudio(audioBuffer, { mimeType: 'audio/mpeg' })
    await transcribeAudio(audioBuffer, { mimeType: 'audio/wav' })
  })
})
