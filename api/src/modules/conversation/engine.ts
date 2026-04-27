import { db } from '@zenda/db/client'
import { conversations, messages } from '@zenda/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { resolveOrCreateCustomer } from './customer-resolver.js'
import { detectLanguage } from './language-detector.js'
import { sendToWorkspace } from '../whatsapp/ws-handler.js'
import { logger } from '../../infra/logger.js'

interface IncomingMessage {
  phoneNumber: string
  body: string
  contentType: 'text' | 'audio' | 'image' | 'file' | 'system'
  mediaUrl?: string
  timestamp: string
  externalMessageId?: string
}

export async function processIncomingMessage(workspaceId: string, msg: IncomingMessage) {
  try {
    // 1. Detect language
    const language = detectLanguage(msg.body)

    // 2. Find or create customer
    const customer = await resolveOrCreateCustomer(workspaceId, msg.phoneNumber, language)

    // 3. Find or create conversation
    let conversation = await findActiveConversation(workspaceId, customer.id)
    if (!conversation) {
      conversation = await createConversation(workspaceId, customer.id, language)
    }

    // 4. Check conversation mode — only process in auto mode
    if (conversation.mode !== 'auto') {
      // Queue message but don't auto-reply
      await storeMessage(conversation.id, workspaceId, {
        senderType: 'customer',
        contentType: msg.contentType,
        body: msg.body,
        language,
        externalMessageId: msg.externalMessageId,
      })

      // Notify owner if needs_attention or human_takeover
      if (conversation.mode === 'needs_attention') {
        sendToWorkspace(workspaceId, {
          type: 'notification',
          data: {
            id: crypto.randomUUID(),
            type: 'needs_attention',
            title: 'New message needs attention',
            body: `${customer.name ?? customer.phoneNumber}: ${msg.body.slice(0, 100)}`,
            createdAt: new Date().toISOString(),
          },
        })
      }
      return
    }

    // 5. Store incoming message
    const storedMessage = await storeMessage(conversation.id, workspaceId, {
      senderType: 'customer',
      contentType: msg.contentType,
      body: msg.body,
      language,
      externalMessageId: msg.externalMessageId,
    })

    // 6. Update conversation lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id))

    // 7. Route to AI agent
    const { runAgent } = await import('../ai/agent.js')
    const aiResponse = await runAgent(workspaceId, conversation.id, customer.id, msg.body, language)

    if (!aiResponse) {
      logger.warn('AI agent returned no response', { workspaceId, conversationId: conversation.id })
      return
    }

    // 8. Store AI response
    const responseMessage = await storeMessage(conversation.id, workspaceId, {
      senderType: 'ai',
      contentType: 'text',
      body: aiResponse.text,
      language: aiResponse.language,
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      toolCalls: aiResponse.toolCalls,
    })

    // 9. Send response back to desktop app -> WhatsApp
    sendToWorkspace(workspaceId, {
      type: 'response.send',
      data: {
        conversationId: conversation.id,
        message: {
          id: responseMessage.id,
          body: aiResponse.text,
          senderType: 'ai',
          contentType: 'text',
          status: 'sent',
          createdAt: responseMessage.createdAt,
        },
        phoneNumber: msg.phoneNumber,
      },
    })

    // 10. Send conversation update event
    sendToWorkspace(workspaceId, {
      type: 'conversation.update',
      data: {
        id: conversation.id,
        mode: conversation.mode,
        lastMessageAt: new Date().toISOString(),
        needsAttentionReason: null,
      },
    })

    logger.info('Message processed', {
      workspaceId,
      conversationId: conversation.id,
      customerId: customer.id,
      language,
    })
  } catch (error) {
    logger.error('Failed to process message', {
      workspaceId,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

async function findActiveConversation(workspaceId: string, customerId: string) {
  const [conv] = await db
    .select()
    .from(conversations)
    .where(and(
      eq(conversations.workspaceId, workspaceId),
      eq(conversations.customerId, customerId),
    ))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(1)
  return conv ?? null
}

async function createConversation(workspaceId: string, customerId: string, language: 'en' | 'es') {
  const [conv] = await db
    .insert(conversations)
    .values({
      workspaceId,
      customerId,
      channel: 'whatsapp',
      mode: 'auto',
      language,
    })
    .returning()
  return conv
}

async function storeMessage(
  conversationId: string,
  workspaceId: string,
  data: {
    senderType: 'customer' | 'ai' | 'owner' | 'system'
    contentType: 'text' | 'audio' | 'image' | 'file' | 'system'
    body: string
    language: 'en' | 'es'
    externalMessageId?: string
    aiProvider?: string
    aiModel?: string
    toolCalls?: unknown[]
  }
) {
  const [msg] = await db
    .insert(messages)
    .values({
      conversationId,
      workspaceId,
      senderType: data.senderType as any,
      contentType: data.contentType,
      body: data.body,
      language: data.language,
      externalMessageId: data.externalMessageId,
      aiProvider: data.aiProvider,
      aiModel: data.aiModel,
      toolCalls: data.toolCalls,
      status: data.senderType === 'customer' ? 'received' : 'queued',
    })
    .returning()
  return msg
}
