import { logger } from '../../../infra/logger.js'
import { transcribeAudio } from './index.js'
import { db } from '@zenda/db/client'
import { audioAssets } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'

interface AudioMessage {
  messageId: string
  workspaceId: string
  mediaUrl: string
  mimeType: string
  duration?: number
}

export async function handleAudioMessage(msg: AudioMessage): Promise<{
  transcript: string
  language: string
  audioAssetId: string
} | null> {
  try {
    const audioBuffer = await downloadAudio(msg.mediaUrl)

    const [asset] = await db.insert(audioAssets).values({
      workspaceId: msg.workspaceId,
      messageId: msg.messageId,
      storageKey: msg.mediaUrl,
      durationSeconds: msg.duration ?? 0,
    }).returning()

    const result = await transcribeAudio(audioBuffer)

    await db.update(audioAssets).set({
      transcript: result.text,
      confidence: result.confidence,
      language: result.language as 'en' | 'es',
    }).where(eq(audioAssets.id, asset.id))

    logger.info('Audio transcribed', {
      messageId: msg.messageId,
      language: result.language,
      duration: result.duration,
    })

    return {
      transcript: result.text,
      language: result.language,
      audioAssetId: asset.id,
    }
  } catch (err) {
    logger.error('Audio handling failed', {
      messageId: msg.messageId,
      error: (err as Error).message,
    })
    return null
  }
}

async function downloadAudio(mediaUrl: string): Promise<Buffer> {
  const res = await fetch(mediaUrl)
  if (!res.ok) throw new Error(`Failed to download audio: ${res.status}`)
  const arrayBuf = await res.arrayBuffer()
  return Buffer.from(arrayBuf)
}
