import { transcribeAudio } from './index'
import { db } from '@zenda/db/client'
import { audioAssets } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'

type Language = 'en' | 'es'

/** Constrain the transcription language to the DB enum values (en | es). */
function toDbLanguage(lang?: string): Language {
  if (lang === 'en' || lang === 'es') return lang
  return 'en'
}

interface AudioMessageInput {
  messageId: string
  workspaceId: string
  mediaUrl: string // HTTP URL or base64 data URI (data:audio/ogg;base64,...)
  mimeType?: string
  duration?: number
}

type AudioHandlerResult = {
  transcript: string
  language: string
  audioAssetId: string
} | null

/**
 * Decode a base64 data URI or fetch from an HTTP URL into a Buffer.
 */
async function resolveAudioBuffer(mediaUrl: string): Promise<Buffer> {
  if (mediaUrl.startsWith('data:')) {
    // data:<mime>;base64,<payload>
    const base64 = mediaUrl.split(',')[1]
    if (!base64) throw new Error('Invalid data URI: missing base64 payload')
    return Buffer.from(base64, 'base64')
  }

  const response = await fetch(mediaUrl)
  if (!response.ok) {
    throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

/**
 * Extract MIME type from a data URI or default to WhatsApp voice note format.
 */
function extractMimeType(mediaUrl: string, fallback?: string): string {
  if (mediaUrl.startsWith('data:')) {
    const match = mediaUrl.match(/^data:([^;]+)/)
    return match?.[1] ?? fallback ?? 'audio/ogg; codecs=opus'
  }
  return fallback ?? 'audio/ogg; codecs=opus'
}

/**
 * Handle an incoming audio/voice note message:
 * 1. Resolve audio data (base64 data URI or HTTP URL → Buffer)
 * 2. Create an audio asset DB record
 * 3. Transcribe using Whisper (with ZAI fallback)
 * 4. Update the asset record with transcript
 * 5. Return transcript, detected language, and asset ID
 */
export async function handleAudioMessage(msg: AudioMessageInput): Promise<AudioHandlerResult> {
  const { messageId, workspaceId, mediaUrl, mimeType, duration } = msg

  try {
    // 1. Resolve audio buffer
    const audioBuffer = await resolveAudioBuffer(mediaUrl)

    // Detect MIME from data URI or use provided mimeType
    const detectedMime = extractMimeType(mediaUrl, mimeType)

    // 2. Create audio asset record
    const [asset] = await db.insert(audioAssets).values({
      messageId,
      workspaceId,
      storageKey: `inline:${messageId}`,
      durationSeconds: duration ?? null,
    }).returning()

    if (!asset) {
      throw new Error('Failed to create audio asset record')
    }

    // 3. Transcribe (OpenAI Whisper-1 → ZAI fallback handled internally)
    const result = await transcribeAudio(audioBuffer, {
      mimeType: detectedMime,
    })

    // 4. Check for silent/unintelligible audio
    const isSilentOrUnintelligible =
      !result.text.trim() ||
      result.text.trim().toLowerCase() === '[silence]' ||
      result.text.trim().toLowerCase() === '(silence)' ||
      (result.confidence !== undefined && result.confidence < 0.3)

    if (isSilentOrUnintelligible) {
      await db.update(audioAssets)
        .set({
          transcript: '[unintelligible]',
          language: toDbLanguage(result.language),
          confidence: result.confidence ?? 0,
        })
        .where(eq(audioAssets.id, asset.id))

      return {
        transcript: '[unintelligible]',
        language: toDbLanguage(result.language),
        audioAssetId: asset.id,
      }
    }

    // 5. Update asset with successful transcription
    await db.update(audioAssets)
      .set({
        transcript: result.text,
        language: toDbLanguage(result.language),
        confidence: result.confidence ?? null,
      })
      .where(eq(audioAssets.id, asset.id))

    return {
      transcript: result.text,
      language: toDbLanguage(result.language),
      audioAssetId: asset.id,
    }
  } catch (err) {
    console.error('[audio-handler] Failed to process audio message:', err)
    return null
  }
}
