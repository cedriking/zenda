import { Elysia } from 'elysia'
import { getZernioClient } from './client.js'
import { processIncomingMessage } from '../../conversation/engine.js'
import { logger } from '../../../infra/logger.js'

/**
 * Parse Zernio thread ID: zernio:{accountId}:{conversationId}
 *
 * @param threadId - Thread ID to parse
 * @returns Parsed account and conversation IDs
 */
export function parseThreadId(threadId: string): { accountId: string; conversationId: string } {
  const parts = threadId.split(':')
  if (parts.length < 3 || parts[0] !== 'zernio') {
    throw new Error(`Invalid Zernio thread ID: ${threadId}`)
  }
  return {
    accountId: parts[1],
    conversationId: parts.slice(2).join(':'), // Handle nested colons
  }
}

/**
 * Find workspace by Zernio account ID and platform
 * This queries the integrations table to find the associated workspace
 *
 * @param accountId - Zernio account ID
 * @param platform - Platform type (whatsapp, instagram, etc.)
 * @returns Workspace ID or null if not found
 */
async function getWorkspaceByZernioAccount(
  accountId: string,
  platform: string
): Promise<string | null> {
  try {
    const { db } = await import('@zenda/db/client')
    const { integrations } = await import('@zenda/db/schema')
    const { eq, and } = await import('drizzle-orm')

    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.provider, 'zernio'),
          eq(integrations.type, platform)
        )
      )
      .limit(1)

    if (!integration) {
      return null
    }

    const config = JSON.parse(integration.config || '{}')
    // Check if this account ID matches
    if (config.accountId === accountId) {
      return integration.workspaceId
    }

    return null
  } catch (error) {
    logger.error('Failed to query workspace by Zernio account', {
      error: error instanceof Error ? error.message : String(error),
      accountId,
      platform,
    })
    return null
  }
}

/**
 * Process incoming message from Zernio webhook
 * This extracts message data and forwards it to the conversation engine
 *
 * @param thread - Chat SDK thread object
 * @param message - Chat SDK message object
 */
async function processZernioMessage(thread: any, message: any) {
  try {
    const raw = message.raw as any

    // Extract platform and conversation info
    const platform = raw.platform || 'whatsapp' // 'whatsapp', 'instagram', 'telegram', etc.
    const senderPhone = raw.sender?.phoneNumber
    const senderId = raw.sender?.id

    // Build thread ID: zernio:{accountId}:{conversationId}
    const threadId = thread.id

    // Extract account and conversation IDs from thread ID
    const { accountId, conversationId } = parseThreadId(threadId)

    // Find workspace by Zernio account ID
    const workspaceId = await getWorkspaceByZernioAccount(accountId, platform)
    if (!workspaceId) {
      logger.warn('No workspace found for Zernio account', { accountId, platform })
      return
    }

    // Determine message content type
    const messageType = raw.message?.type || 'text'
    const mediaUrl = raw.message?.mediaUrl

    // Process the message through our conversation engine
    await processIncomingMessage(workspaceId, {
      phoneNumber: senderPhone || senderId,
      body: message.text || '',
      contentType: messageType as 'text' | 'audio' | 'image' | 'file' | 'system',
      mediaUrl,
      timestamp: new Date(raw.timestamp || Date.now()).toISOString(),
      externalMessageId: message.id,
    })

    logger.info('Zernio message processed', {
      workspaceId,
      threadId,
      platform,
      messageType,
    })
  } catch (error) {
    logger.error('Error processing Zernio message', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Initialize Zernio bot with message handlers
 * This should be called during API initialization
 *
 * @returns Initialized bot instance
 */
export async function initializeZernioBot() {
  try {
    const zernio = getZernioClient()
    const bot = await zernio.initialize()

    // Register handler for incoming messages
    bot.onNewMessage(/.*/, async (thread: any, message: any) => {
      await processZernioMessage(thread, message)
    })

    logger.info('Zernio bot initialized with message handlers')

    return bot
  } catch (error) {
    logger.error('Failed to initialize Zernio bot', {
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

/**
 * Zernio webhook routes
 * Provides endpoints for receiving webhooks from Zernio
 */
export const zernioWebhookRoutes = new Elysia({ prefix: '/webhooks/zernio' })

  /**
   * Main webhook endpoint for Zernio
   * Receives messages from all connected platforms (WhatsApp, IG, Telegram, etc.)
   */
  .post('/', async ({ request, body, headers }) => {
    try {
      const zernio = getZernioClient()

      // Convert Elysia request to Web API Request for the adapter
      const webhookRequest = new Request(request.url, {
        method: request.method,
        headers: headers as HeadersInit,
        body: JSON.stringify(body),
      })

      // Let the Zernio adapter handle the webhook
      // It verifies signatures and routes to our message handlers
      const response = await zernio.handleWebhook(webhookRequest)
      const responseData = await response.json()

      // If the adapter processed the message successfully, we're done
      if (responseData.status === 'ok') {
        return { status: 'ok' }
      }

      // Handle errors from adapter
      logger.warn('Zernio webhook processing issue', { responseData })
      return { status: 'error', code: responseData.code || 'unknown' }
    } catch (error) {
      logger.error('Zernio webhook error', {
        error: error instanceof Error ? error.message : String(error),
      })
      return { status: 'error', code: 'processing_failed' }
    }
  })

  /**
   * Health check for webhook configuration
   */
  .get('/health', () => {
    return {
      status: 'ok',
      webhook: 'configured',
      timestamp: new Date().toISOString(),
    }
  })

  /**
   * Test endpoint for webhook connectivity
   */
  .post('/test', async ({ body }) => {
    try {
      const { threadId, message } = body as { threadId?: string; message?: string }

      if (!threadId || !message) {
        return {
          status: 'error',
          code: 'invalid_request',
          message: 'threadId and message are required',
        }
      }

      const zernio = getZernioClient()
      await zernio.sendMessage(threadId, message)

      return {
        status: 'ok',
        message: 'Test message sent successfully',
      }
    } catch (error) {
      logger.error('Webhook test failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      return {
        status: 'error',
        code: 'test_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  })
