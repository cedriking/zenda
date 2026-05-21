import { describe, expect, test, mock, beforeEach, afterEach } from 'bun:test'
import { transcribeAudio } from '../../src/modules/ai/transcription/index'

// Mock fetch globally
const originalFetch = globalThis.fetch

function mockFetchByURL(handler: (url: string) => Response | Promise<Response>) {
  globalThis.fetch = mock(async (url: string, _init?: any) => {
    return handler(url)
  }) as any
}

describe('transcribeAudio', () => {
  beforeEach(() => {
    globalThis.fetch = originalFetch
    delete process.env.OPENAI_API_KEY
    delete process.env.ZAI_API_KEY
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
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

  test('transcribes with local Whisper successfully', async () => {
    const callOrder: string[] = []
    mockFetchByURL(async (url) => {
      if (url.includes('/health')) {
        return new Response(JSON.stringify({ status: 'ok', model: 'whisper-small' }))
      }
      if (url.includes('/transcribe')) {
        callOrder.push('local')
        return new Response(JSON.stringify({
          text: 'I want to book an appointment for tomorrow at 3pm',
          language: 'en',
          language_probability: 0.98,
          duration: 5.2,
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer)

    expect(result.text).toBe('I want to book an appointment for tomorrow at 3pm')
    expect(result.language).toBe('en')
    expect(result.duration).toBe(5.2)
    expect(result.confidence).toBe(0.98)
    expect(callOrder).toContain('local')
  })

  test('falls back to OpenAI when local Whisper is down', async () => {
    process.env.OPENAI_API_KEY = 'test-key'

    const callOrder: string[] = []
    mockFetchByURL(async (url) => {
      if (url.includes('/health')) {
        // Local server is down
        return new Response('Connection refused', { status: 502 })
      }
      if (url.includes('api.openai.com')) {
        callOrder.push('openai')
        return new Response(JSON.stringify({
          text: 'Fallback transcription from OpenAI',
          language: 'en',
          duration: 4.0,
          segments: [{ avg_logprob: -0.2 }],
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer)

    expect(result.text).toBe('Fallback transcription from OpenAI')
    expect(callOrder[0]).toBe('openai') // local failed health check, openai was first successful
  })

  test('falls back through full chain: local → OpenAI → ZAI', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.ZAI_API_KEY = 'test-zai-key'

    const callOrder: string[] = []
    mockFetchByURL(async (url) => {
      if (url.includes('/health')) {
        return new Response('Down', { status: 503 })
      }
      if (url.includes('api.openai.com')) {
        callOrder.push('openai')
        return new Response(JSON.stringify({ error: 'Rate limited' }), { status: 429 })
      }
      if (url.includes('api.z.ai')) {
        callOrder.push('zai')
        return new Response(JSON.stringify({
          text: 'ZAI fallback transcription',
          language: 'es',
          duration: 3.1,
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer)

    expect(result.text).toBe('ZAI fallback transcription')
    expect(result.language).toBe('es')
    expect(callOrder).toContain('openai')
    expect(callOrder).toContain('zai')
  })

  test('can explicitly choose provider: openai', async () => {
    process.env.OPENAI_API_KEY = 'test-key'

    const callOrder: string[] = []
    mockFetchByURL(async (url) => {
      if (url.includes('api.openai.com')) {
        callOrder.push('openai')
        return new Response(JSON.stringify({
          text: 'Direct OpenAI call',
          language: 'en',
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer, { provider: 'openai' })

    expect(result.text).toBe('Direct OpenAI call')
    expect(callOrder[0]).toBe('openai')
  })

  test('can explicitly choose provider: zai', async () => {
    process.env.ZAI_API_KEY = 'test-zai-key'

    const callOrder: string[] = []
    mockFetchByURL(async (url) => {
      if (url.includes('api.z.ai')) {
        callOrder.push('zai')
        return new Response(JSON.stringify({
          text: 'Direct ZAI call',
          language: 'en',
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer, { provider: 'zai' })

    expect(result.text).toBe('Direct ZAI call')
    expect(callOrder[0]).toBe('zai')
  })

  test('passes language option to transcription API', async () => {
    mockFetchByURL(async (url) => {
      if (url.includes('/health')) {
        return new Response(JSON.stringify({ status: 'ok' }))
      }
      if (url.includes('/transcribe')) {
        return new Response(JSON.stringify({
          text: 'Hola',
          language: 'es',
          language_probability: 0.95,
          duration: 2.0,
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer, { language: 'es' })

    expect(result.text).toBe('Hola')
    expect(result.language).toBe('es')
  })

  test('throws when all providers fail', async () => {
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.ZAI_API_KEY = 'test-zai-key'

    mockFetchByURL(async (url) => {
      if (url.includes('/health')) {
        return new Response('Down', { status: 503 })
      }
      return new Response(JSON.stringify({ error: 'Service unavailable' }), { status: 503 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    expect(transcribeAudio(audioBuffer)).rejects.toThrow()
  })

  test('handles local Whisper returning empty text (silent audio)', async () => {
    mockFetchByURL(async (url) => {
      if (url.includes('/health')) {
        return new Response(JSON.stringify({ status: 'ok' }))
      }
      if (url.includes('/transcribe')) {
        return new Response(JSON.stringify({
          text: '',
          language: 'en',
          language_probability: 1,
          duration: 1.0,
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer)

    expect(result.text).toBe('')
    expect(result.language).toBe('en')
  })

  test('handles various MIME types correctly', async () => {
    mockFetchByURL(async (url) => {
      if (url.includes('/health')) {
        return new Response(JSON.stringify({ status: 'ok' }))
      }
      if (url.includes('/transcribe')) {
        return new Response(JSON.stringify({
          text: 'Transcribed',
          language: 'en',
          language_probability: 0.9,
          duration: 2.0,
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)

    // Should not throw for any MIME type
    await transcribeAudio(audioBuffer, { mimeType: 'audio/webm' })
    await transcribeAudio(audioBuffer, { mimeType: 'audio/mp4' })
    await transcribeAudio(audioBuffer, { mimeType: 'audio/mpeg' })
    await transcribeAudio(audioBuffer, { mimeType: 'audio/wav' })
    await transcribeAudio(audioBuffer, { mimeType: 'audio/ogg; codecs=opus' })
  })

  test('OpenAI provider computes confidence from segment logprobs', async () => {
    process.env.OPENAI_API_KEY = 'test-key'

    mockFetchByURL(async (url) => {
      if (url.includes('api.openai.com')) {
        return new Response(JSON.stringify({
          text: 'Test with segments',
          language: 'en',
          duration: 3.0,
          segments: [
            { avg_logprob: -0.1 },
            { avg_logprob: -0.2 },
            { avg_logprob: -0.15 },
          ],
        }))
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    })

    const audioBuffer = Buffer.alloc(2048, 0xFF)
    const result = await transcribeAudio(audioBuffer, { provider: 'openai' })

    expect(result.text).toBe('Test with segments')
    expect(result.confidence).toBeGreaterThan(0.7)
    expect(result.confidence).toBeLessThanOrEqual(1)
  })
})
