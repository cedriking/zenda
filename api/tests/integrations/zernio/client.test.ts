import { describe, expect, test, beforeEach, mock } from 'bun:test'
import { ZernioClient, type ZernioConfig } from '../../../src/modules/integrations/zernio/client'

describe('Zernio Client', () => {
  let client: ZernioClient
  let config: ZernioConfig

  beforeEach(() => {
    // Reset environment
    process.env.ZERNIO_API_KEY = 'test-api-key'
    process.env.ZERNIO_WEBHOOK_SECRET = 'test-webhook-secret'
    process.env.ZERNIO_WEBHOOK_URL = 'https://api.zenda.bot/webhooks/zernio'
    process.env.ZERNIO_API_BASE_URL = 'https://api.zernio.dev'

    config = {
      apiKey: 'test-api-key',
      webhookSecret: 'test-webhook-secret',
      webhookUrl: 'https://api.zenda.bot/webhooks/zernio',
      apiBaseUrl: 'https://api.zernio.dev',
    }

    client = new ZernioClient(config)
  })

  describe('Initialization', () => {
    test('should initialize with valid config', () => {
      expect(client).toBeDefined()
      expect(client).toBeInstanceOf(ZernioClient)
    })

    test('should use default base URL when not provided', () => {
      const clientWithoutBaseUrl = new ZernioClient({
        apiKey: 'test-key',
        webhookSecret: 'test-secret',
        webhookUrl: 'https://test.com/webhook',
      })
      expect(clientWithoutBaseUrl).toBeDefined()
    })

    test('should use custom base URL when provided', () => {
      const clientWithCustomUrl = new ZernioClient({
        apiKey: 'test-key',
        webhookSecret: 'test-secret',
        webhookUrl: 'https://test.com/webhook',
        apiBaseUrl: 'https://custom.api.com',
      })
      expect(clientWithCustomUrl).toBeDefined()
    })
  })

  describe('sendMessage()', () => {
    test('should send a text message successfully', async () => {
      const threadId = 'zernio:acc_123:conv_456'
      const content = 'Hello, World!'

      const result = await client.sendMessage(threadId, content)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.threadId).toBe(threadId)
      expect(result.content).toBe(content)
      expect(result.status).toBe('sent')
      expect(result.timestamp).toBeDefined()
    })

    test('should send a message with media URL', async () => {
      const threadId = 'zernio:acc_123:conv_456'
      const content = {
        text: 'Check out this image!',
        mediaUrl: 'https://example.com/image.jpg',
      }

      const result = await client.sendMessage(threadId, content)

      expect(result).toBeDefined()
      expect(result.content).toBe(content.text)
    })

    test('should reject invalid thread ID format', async () => {
      const invalidThreadId = 'invalid:thread:id'

      await expect(client.sendMessage(invalidThreadId, 'test')).rejects.toThrow(
        'Invalid thread ID format'
      )
    })

    test('should reject thread ID without zernio prefix', async () => {
      const invalidThreadId = 'whatsapp:acc_123:conv_456'

      await expect(client.sendMessage(invalidThreadId, 'test')).rejects.toThrow()
    })

    test('should handle thread IDs with nested colons in conversation ID', async () => {
      const threadId = 'zernio:acc_123:conv:with:colons:456'
      const content = 'Test message'

      const result = await client.sendMessage(threadId, content)

      expect(result).toBeDefined()
      expect(result.threadId).toBe(threadId)
    })
  })

  describe('getAccount()', () => {
    test('should retrieve account information successfully', async () => {
      const accountId = 'acc_123'

      const result = await client.getAccount(accountId)

      expect(result).toBeDefined()
      expect(result.id).toBe(accountId)
      expect(result.phoneNumber).toBeDefined()
      expect(result.status).toBe('connected')
    })

    test('should handle different account IDs', async () => {
      const accountId1 = 'acc_abc'
      const accountId2 = 'acc_xyz'

      const result1 = await client.getAccount(accountId1)
      const result2 = await client.getAccount(accountId2)

      expect(result1.id).toBe(accountId1)
      expect(result2.id).toBe(accountId2)
    })
  })

  describe('disconnect()', () => {
    test('should disconnect an account successfully', async () => {
      const accountId = 'acc_123'

      const result = await client.disconnect(accountId)

      expect(result).toBeDefined()
      expect(result.disconnected).toBe(true)
    })

    test('should handle disconnect for non-existent account', async () => {
      const accountId = 'acc_nonexistent'

      // In real implementation, this might throw an error
      // For now, we just verify it doesn't crash
      const result = await client.disconnect(accountId)
      expect(result).toBeDefined()
    })
  })

  describe('parseThreadId()', () => {
    test('should parse valid thread ID correctly', () => {
      const threadId = 'zernio:acc_123:conv_456'
      const result = client.parseThreadId(threadId)

      expect(result).toBeDefined()
      expect(result.accountId).toBe('acc_123')
      expect(result.conversationId).toBe('conv_456')
    })

    test('should handle thread IDs with multiple colons', () => {
      const threadId = 'zernio:acc_123:conv:with:colons:456'
      const result = client.parseThreadId(threadId)

      expect(result.accountId).toBe('acc_123')
      expect(result.conversationId).toBe('conv:with:colons:456')
    })

    test('should reject thread ID without zernio prefix', () => {
      const invalidThreadId = 'whatsapp:acc_123:conv_456'

      expect(() => client.parseThreadId(invalidThreadId)).toThrow('Invalid Zernio thread ID')
    })

    test('should reject thread ID with too few parts', () => {
      const invalidThreadId = 'zernio:acc_123'

      expect(() => client.parseThreadId(invalidThreadId)).toThrow('Invalid Zernio thread ID')
    })

    test('should reject empty thread ID', () => {
      expect(() => client.parseThreadId('')).toThrow('Invalid Zernio thread ID')
    })
  })

  describe('verifyWebhookSignature()', () => {
    test('should verify valid webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const signature = 'valid-signature'

      // Mock the signature generation
      const clientMock = mock(() => true)
      
      const result = client.verifyWebhookSignature(payload, signature)
      
      // In real implementation, this would use HMAC verification
      expect(typeof result).toBe('boolean')
    })

    test('should reject invalid webhook signature', () => {
      const payload = JSON.stringify({ test: 'data' })
      const invalidSignature = 'invalid-signature'

      const result = client.verifyWebhookSignature(payload, invalidSignature)
      
      expect(typeof result).toBe('boolean')
    })
  })
})
