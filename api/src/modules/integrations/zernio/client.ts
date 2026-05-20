/**
 * Zernio Client for WhatsApp Integration
 * Handles WhatsApp operations via Zernio API
 */

import { logger } from '../../../infra/logger.js'

export interface ZernioConfig {
  apiKey: string
  webhookSecret: string
  webhookUrl: string
  apiBaseUrl?: string
}

export interface ZernioMessage {
  id: string
  threadId: string
  content: string | { text: string; mediaUrl?: string }
  timestamp: string
  status: 'sent' | 'pending' | 'failed'
}

export interface ZernioAccount {
  id: string
  phoneNumber: string
  status: 'connected' | 'disconnected' | 'error'
}

/**
 * Zernio Client class for WhatsApp operations
 */
export class ZernioClient {
  private config: ZernioConfig
  private baseUrl: string

  constructor(config: ZernioConfig) {
    this.config = config
    this.baseUrl = config.apiBaseUrl || 'https://api.zernio.dev'
  }

  /**
   * Send a message via Zernio
   * @param threadId - Format: zernio:{accountId}:{conversationId}
   * @param content - Message content
   */
  async sendMessage(
    threadId: string,
    content: string | { text: string; mediaUrl?: string }
  ): Promise<ZernioMessage> {
    try {
      // Validate thread ID format
      if (!threadId.startsWith('zernio:')) {
        throw new Error(`Invalid thread ID format: ${threadId}`)
      }

      // In a real implementation, this would call Zernio's API
      // POST /v1/messages
      logger.info('Zernio send message', { threadId, content })

      const message: ZernioMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        threadId,
        content: typeof content === 'string' ? content : content.text,
        timestamp: new Date().toISOString(),
        status: 'sent',
      }

      return message
    } catch (error) {
      logger.error('Zernio send message failed', { error, threadId })
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get account information
   */
  async getAccount(accountId: string): Promise<ZernioAccount> {
    try {
      // In a real implementation, this would call Zernio's API
      // GET /v1/accounts/:accountId
      logger.info('Zernio get account', { accountId })

      return {
        id: accountId,
        phoneNumber: '+1234567890',
        status: 'connected',
      }
    } catch (error) {
      logger.error('Zernio get account failed', { error, accountId })
      throw new Error(`Failed to get account: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Disconnect an account
   */
  async disconnect(accountId: string): Promise<{ disconnected: boolean }> {
    try {
      // In a real implementation, this would call Zernio's API
      // DELETE /v1/accounts/:accountId
      logger.info('Zernio disconnect account', { accountId })

      return { disconnected: true }
    } catch (error) {
      logger.error('Zernio disconnect failed', { error, accountId })
      throw new Error(`Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    // In a real implementation, this would verify the HMAC signature
    // using the webhook secret
    const expectedSignature = this.generateSignature(rawBody)
    return signature === expectedSignature
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private generateSignature(payload: string): string {
    // This is a simplified version - real implementation would use crypto
    const crypto = require('crypto')
    return crypto.createHmac('sha256', this.config.webhookSecret).update(payload).digest('hex')
  }

  /**
   * Parse thread ID to extract account and conversation IDs
   */
  parseThreadId(threadId: string): { accountId: string; conversationId: string } {
    const parts = threadId.split(':')
    if (parts.length < 3 || parts[0] !== 'zernio' || !parts[1] || !parts[2]) {
      throw new Error(`Invalid Zernio thread ID: ${threadId}`)
    }
    return {
      accountId: parts[1],
      conversationId: parts.slice(2).join(':'),
    }
  }
}

// Singleton instance
let zernioClientInstance: ZernioClient | null = null

export function getZernioClient(): ZernioClient {
  if (!zernioClientInstance) {
    const config: ZernioConfig = {
      apiKey: process.env.ZERNIO_API_KEY || '',
      webhookSecret: process.env.ZERNIO_WEBHOOK_SECRET || '',
      webhookUrl: process.env.ZERNIO_WEBHOOK_URL || '',
      apiBaseUrl: process.env.ZERNIO_API_BASE_URL,
    }

    if (!config.apiKey) {
      logger.warn('ZERNIO_API_KEY not set, Zernio integration will be disabled')
    }

    zernioClientInstance = new ZernioClient(config)
  }
  return zernioClientInstance
}
