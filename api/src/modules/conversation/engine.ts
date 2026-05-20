import { db } from '@zenda/db/client'
import { conversations, messages, workspaces } from '@zenda/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { resolveOrCreateCustomer } from './customer-resolver.js'
import { detectLanguage } from './language-detector.js'
import { sendToWorkspace } from '../whatsapp/ws-handler.js'
import { handleAudioMessage } from '../ai/transcription/audio-handler.js'
import { getNextOnboardingQuestion, processOnboardingResponse } from '../onboarding/conversation-handler.js'
import { logger } from '../../infra/logger.js'
import type { OnboardingStep } from '@zenda/shared'

interface IncomingMessage {
  threadId?: string // Zernio thread ID format: zernio:{accountId}:{conversationId}
  phoneNumber: string // Legacy support - will be deprecated
  body: string
  contentType: 'text' | 'audio' | 'image' | 'file' | 'system'
  mediaUrl?: string
  timestamp: string
  externalMessageId?: string
  platform?: string // 'whatsapp', 'instagram', 'telegram', etc.
}

export async function processIncomingMessage(workspaceId: string, msg: IncomingMessage) {
  try {
    // 1. Detect language (for audio, body may be empty — refined after transcription)
    const language: 'en' | 'es' = detectLanguage(msg.body) || 'es'

    // 2. Find or create customer (using phone number or thread ID)
    const customer = await resolveOrCreateCustomer(workspaceId, msg.phoneNumber, language)

    // 3. Find or create conversation
    let conversation = await findActiveConversation(workspaceId, customer.id)
    if (!conversation) {
      conversation = await createConversation(workspaceId, customer.id, language, msg.threadId)
    }

    // 4. Store incoming message (placeholder body for audio, actual body for text)
    const isAudio = msg.contentType === 'audio' && !!msg.mediaUrl
    const storedMessage = await storeMessage(conversation.id, workspaceId, {
      senderType: 'customer',
      contentType: msg.contentType,
      body: isAudio ? '' : msg.body,
      language,
      externalMessageId: msg.externalMessageId,
    })

    // 5. For audio messages: transcribe and update the stored message
    let messageBody = msg.body
    let agentLanguage: 'en' | 'es' = language

    if (isAudio) {
      const transcription = await handleAudioMessage({
        messageId: storedMessage.id,
        workspaceId,
        mediaUrl: msg.mediaUrl!,
        mimeType: 'audio/ogg',
      })

      if (transcription) {
        messageBody = transcription.transcript
        agentLanguage = transcription.language as 'en' | 'es'

        await db
          .update(messages)
          .set({ body: transcription.transcript, language: agentLanguage })
          .where(eq(messages.id, storedMessage.id))
      } else {
        messageBody = '[Audio message — transcription unavailable]'

        await db
          .update(messages)
          .set({ body: messageBody })
          .where(eq(messages.id, storedMessage.id))
      }
    }

    // 6. Check if onboarding is incomplete — route to onboarding flow instead of AI agent
    const [ws] = await db
      .select({ onboardingStep: workspaces.onboardingStep })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1)

    const onboardingStep = (ws?.onboardingStep ?? 'not_started') as OnboardingStep
    if (onboardingStep !== 'ready') {
      // Workspace hasn't completed onboarding — handle via onboarding flow
      await handleOnboardingMessage(workspaceId, conversation.id, customer.id, messageBody, agentLanguage, msg)
      return
    }

    // 7. Check conversation mode — only process in auto mode
    if (conversation.mode !== 'auto') {
      // Notify owner if needs_attention or human_takeover
      if (conversation.mode === 'needs_attention') {
        sendToWorkspace(workspaceId, {
          type: 'notification',
          data: {
            id: crypto.randomUUID(),
            type: 'needs_attention',
            title: 'New message needs attention',
            body: `${customer.name ?? customer.phoneNumber}: ${messageBody.slice(0, 100)}`,
            createdAt: new Date().toISOString(),
          },
        })
      }
      return
    }

    // 8. Update conversation lastMessageAt
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, conversation.id))

    // 9. Route to AI agent (using transcribed text for audio, raw body for text)
    const { runAgent } = await import('../ai/agent.js')
    const aiResponse = await runAgent(workspaceId, conversation.id, customer.id, messageBody, agentLanguage)

    if (!aiResponse) {
      logger.warn('AI agent returned no response', { workspaceId, conversationId: conversation.id })
      return
    }

    // 10. Store AI response
    const responseMessage = await storeMessage(conversation.id, workspaceId, {
      senderType: 'ai',
      contentType: 'text',
      body: aiResponse.text,
      language: aiResponse.language,
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      toolCalls: aiResponse.toolCalls,
    })

    // 11. Send response back via Zernio using thread ID
    sendToWorkspace(workspaceId, {
      type: 'response.send',
      data: {
        conversationId: conversation.id,
        threadId: msg.threadId || conversation.threadId, // Use Zernio thread ID
        message: {
          id: responseMessage.id,
          body: aiResponse.text,
          senderType: 'ai',
          contentType: 'text',
          status: 'sent',
          createdAt: responseMessage.createdAt,
        },
      },
    })

    // 12. Send conversation update event
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
      threadId: msg.threadId,
      customerId: customer.id,
      language: agentLanguage,
      contentType: msg.contentType,
      platform: msg.platform,
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

async function createConversation(
  workspaceId: string,
  customerId: string,
  language: 'en' | 'es',
  threadId?: string // Zernio thread ID
) {
  const [conv] = await db
    .insert(conversations)
    .values({
      workspaceId,
      customerId,
      channel: 'whatsapp',
      mode: 'auto',
      language,
      threadId, // Store Zernio thread ID for routing
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

async function handleOnboardingMessage(
  workspaceId: string,
  conversationId: string,
  _customerId: string,
  messageBody: string,
  language: 'en' | 'es',
  msg: IncomingMessage,
) {
  // Get current onboarding step
  const questionData = await getNextOnboardingQuestion(workspaceId, language)

  if (!questionData) {
    // No question available (shouldn't happen if onboarding isn't complete)
    logger.warn('Onboarding question not found', { workspaceId })
    return
  }

  const currentStep = questionData.step

  // If this is the first message and step is whatsapp_connected,
  // send the greeting/question without processing the response
  if (currentStep === 'not_started') {
    // Just send the first question
    const responseMessage = await storeMessage(conversationId, workspaceId, {
      senderType: 'ai',
      contentType: 'text',
      body: questionData.question,
      language,
    })

    sendToWorkspace(workspaceId, {
      type: 'response.send',
      data: {
        conversationId,
        threadId: msg.threadId, // Use Zernio thread ID
        message: {
          id: responseMessage.id,
          body: questionData.question,
          senderType: 'ai',
          contentType: 'text',
          status: 'sent',
          createdAt: responseMessage.createdAt,
        },
      },
    })
    return
  }

  // Process the user's response for the current step
  const result = await processOnboardingResponse(workspaceId, currentStep, messageBody, language)

  // Build reply: acknowledgment + next question
  const nextQuestion = await getNextOnboardingQuestion(workspaceId, language)
  let reply = result.acknowledged
  if (nextQuestion && nextQuestion.step !== 'ready') {
    reply += `\n\n${nextQuestion.question}`
  } else if (nextQuestion?.step === 'ready') {
    reply += '\n\n' + (language === 'es'
      ? '¡Todo listo! Tu recepcionista IA está lista para atender a tus clientes.'
      : 'All set! Your AI receptionist is ready to serve your customers.')
  }

  // Store and send the reply
  const responseMessage = await storeMessage(conversationId, workspaceId, {
    senderType: 'ai',
    contentType: 'text',
    body: reply,
    language,
  })

  sendToWorkspace(workspaceId, {
    type: 'response.send',
    data: {
      conversationId,
      threadId: msg.threadId, // Use Zernio thread ID
      message: {
        id: responseMessage.id,
        body: reply,
        senderType: 'ai',
        contentType: 'text',
        status: 'sent',
        createdAt: responseMessage.createdAt,
      },
    },
  })

  logger.info('Onboarding step processed', {
    workspaceId,
    step: currentStep,
    nextStep: result.nextStep,
    language,
  })
}
