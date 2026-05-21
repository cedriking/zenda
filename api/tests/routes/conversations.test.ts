import { describe, test, expect } from 'bun:test'
import { updateConversationModeSchema, sendMessageSchema } from '@zenda/shared'

describe('Conversation validation', () => {
  test('updateConversationModeSchema accepts valid mode', () => {
    const result = updateConversationModeSchema.safeParse({ mode: 'auto' })
    expect(result.success).toBe(true)
  })

  test('updateConversationModeSchema rejects invalid mode', () => {
    const result = updateConversationModeSchema.safeParse({ mode: 'invalid_mode' })
    expect(result.success).toBe(false)
  })

  test('updateConversationModeSchema accepts all valid modes', () => {
    const modes = ['auto', 'needs_attention', 'human_takeover', 'paused', 'queued_offline', 'closed']
    for (const mode of modes) {
      const result = updateConversationModeSchema.safeParse({ mode })
      expect(result.success, `mode "${mode}" should be valid`).toBe(true)
    }
  })

  test('sendMessageSchema accepts valid message', () => {
    const result = sendMessageSchema.safeParse({ body: 'Hello there!' })
    expect(result.success).toBe(true)
  })

  test('sendMessageSchema rejects empty body', () => {
    const result = sendMessageSchema.safeParse({ body: '' })
    expect(result.success).toBe(false)
  })

  test('sendMessageSchema accepts contentType', () => {
    const result = sendMessageSchema.safeParse({ body: 'Hi', contentType: 'text' })
    expect(result.success).toBe(true)
  })

  test('sendMessageSchema rejects invalid contentType', () => {
    const result = sendMessageSchema.safeParse({ body: 'Hi', contentType: 'invalid' })
    expect(result.success).toBe(false)
  })
})
