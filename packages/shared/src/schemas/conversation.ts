import { z } from 'zod'
import type { ConversationMode, MessageContentType } from '../types/enums.js'

export const updateConversationModeSchema = z.object({
  mode: z.enum([
    'auto',
    'needs_attention',
    'human_takeover',
    'paused',
    'queued_offline',
    'closed',
  ] as [ConversationMode, ...ConversationMode[]]),
})

export const sendMessageSchema = z.object({
  body: z.string().min(1),
  contentType: z.enum([
    'text',
    'audio',
    'image',
    'file',
    'system',
  ] as [MessageContentType, ...MessageContentType[]]).optional().default('text'),
})

export type UpdateConversationModeInput = z.infer<typeof updateConversationModeSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
