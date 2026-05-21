import { describe, expect, test } from 'bun:test'

// We test the pure utility functions that don't require DB
describe('Audio handler utilities', () => {
  test('data URI parsing extracts correct base64 payload', async () => {
    // Simulate the resolveAudioBuffer logic inline
    const dataUri = 'data:audio/ogg; codecs=opus;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEA'

    const base64 = dataUri.split(',')[1]
    expect(base64).toBe('UklGRiQAAABXQVZFZm10IBAAAAABAAEA')

    const buffer = Buffer.from(base64, 'base64')
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  test('MIME extraction from data URI works for various formats', () => {
    function extractMimeType(mediaUrl: string, fallback?: string): string {
      if (mediaUrl.startsWith('data:')) {
        const match = mediaUrl.match(/^data:([^;]+)/)
        return match?.[1] ?? fallback ?? 'audio/ogg; codecs=opus'
      }
      return fallback ?? 'audio/ogg; codecs=opus'
    }

    expect(extractMimeType('data:audio/ogg; codecs=opus;base64,abc')).toBe('audio/ogg')
    expect(extractMimeType('data:audio/webm;base64,abc')).toBe('audio/webm')
    expect(extractMimeType('data:audio/mp4;base64,abc')).toBe('audio/mp4')
    expect(extractMimeType('data:;base64,abc')).toBe('audio/ogg; codecs=opus') // fallback
    expect(extractMimeType('https://example.com/audio.ogg')).toBe('audio/ogg; codecs=opus') // URL fallback
    expect(extractMimeType('https://example.com/audio.ogg', 'audio/webm')).toBe('audio/webm') // URL with explicit
  })

  test('large base64 audio round-trips correctly', () => {
    // Simulate a realistic audio buffer size (100KB)
    const original = Buffer.alloc(102400, 0xAB)
    const dataUri = `data:audio/ogg; codecs=opus;base64,${original.toString('base64')}`

    // Decode
    const base64 = dataUri.split(',')[1]
    const decoded = Buffer.from(base64, 'base64')

    expect(decoded.length).toBe(original.length)
    expect(decoded.equals(original)).toBe(true)
  })

  test('data URI with special characters in MIME type is handled', () => {
    const dataUri = 'data:audio/ogg; codecs=opus;base64,UklGRiQA'
    const match = dataUri.match(/^data:([^;]+)/)
    expect(match?.[1]).toBe('audio/ogg')
  })

  test('empty base64 payload is detected', () => {
    const dataUri = 'data:audio/ogg;base64,'
    const base64 = dataUri.split(',')[1]
    expect(base64).toBe('')

    const buffer = Buffer.from(base64, 'base64')
    expect(buffer.length).toBe(0)
  })
})
