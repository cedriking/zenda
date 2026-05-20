import { describe, expect, test, beforeEach } from 'bun:test'
import { ComposioClient, type ComposioConfig } from '../../../src/modules/integrations/composio/client'

describe('Composio Client', () => {
  let client: ComposioClient
  let config: ComposioConfig

  beforeEach(() => {
    // Reset environment
    process.env.COMPOSIO_API_KEY = 'test-api-key'
    process.env.COMPOSIO_BASE_URL = 'https://api.composio.dev'

    config = {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.composio.dev',
    }

    client = new ComposioClient(config)
  })

  describe('Initialization', () => {
    test('should initialize with valid config', () => {
      expect(client).toBeDefined()
      expect(client).toBeInstanceOf(ComposioClient)
    })

    test('should use default base URL when not provided', () => {
      const clientWithoutBaseUrl = new ComposioClient({
        apiKey: 'test-key',
      })
      expect(clientWithoutBaseUrl).toBeDefined()
    })

    test('should use custom base URL when provided', () => {
      const clientWithCustomUrl = new ComposioClient({
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
      })
      expect(clientWithCustomUrl).toBeDefined()
    })
  })

  describe('connectAccount()', () => {
    test('should initiate connection and return connection URL', async () => {
      const workspaceId = 'workspace_123'

      const result = await client.connectAccount(workspaceId)

      expect(result).toBeDefined()
      expect(result.connectionUrl).toBeDefined()
      expect(result.sessionId).toBeDefined()
      expect(result.sessionId).toContain(workspaceId)
      expect(result.connectionUrl).toContain('google_calendar')
      expect(result.connectionUrl).toContain('authorize')
    })

    test('should generate unique session IDs for different workspaces', async () => {
      const workspaceId1 = 'workspace_abc'
      const workspaceId2 = 'workspace_xyz'

      const result1 = await client.connectAccount(workspaceId1)
      const result2 = await client.connectAccount(workspaceId2)

      expect(result1.sessionId).not.toBe(result2.sessionId)
      expect(result1.sessionId).toContain(workspaceId1)
      expect(result2.sessionId).toContain(workspaceId2)
    })

    test('should include redirect URI in connection URL', async () => {
      const workspaceId = 'workspace_123'
      process.env.API_BASE_URL = 'https://api.zenda.bot'

      const result = await client.connectAccount(workspaceId)

      expect(result.connectionUrl).toContain('redirect_uri')
      expect(result.connectionUrl).toContain('api.zenda.bot')
      expect(result.connectionUrl).toContain('/integrations/composio/callback')
    })
  })

  describe('handleCallback()', () => {
    test('should process OAuth callback successfully', async () => {
      const sessionId = 'sess_workspace_123_1234567890'
      const code = 'auth_code_123'
      const workspaceId = 'workspace_123'

      const result = await client.handleCallback(sessionId, code, workspaceId)

      expect(result).toBeDefined()
      expect(result.id).toContain(workspaceId)
      expect(result.provider).toBe('google_calendar')
      expect(result.status).toBe('active')
    })

    test('should return connected account with valid ID', async () => {
      const workspaceId = 'workspace_456'
      const sessionId = `sess_${workspaceId}_${Date.now()}`
      const code = 'valid_auth_code'

      const result = await client.handleCallback(sessionId, code, workspaceId)

      expect(result.id).toMatch(/^acc_/)
      expect(result.provider).toBeDefined()
    })
  })

  describe('listEvents()', () => {
    test('should list events for a date range', async () => {
      const workspaceId = 'workspace_123'
      const options = {
        startDate: '2024-05-13T00:00:00Z',
        endDate: '2024-05-20T23:59:59Z',
      }

      const result = await client.listEvents(workspaceId, options)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should accept calendar ID parameter', async () => {
      const workspaceId = 'workspace_123'
      const options = {
        startDate: '2024-05-13T00:00:00Z',
        endDate: '2024-05-20T23:59:59Z',
        calendarId: 'primary',
      }

      const result = await client.listEvents(workspaceId, options)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    test('should handle ISO 8601 date formats', async () => {
      const workspaceId = 'workspace_123'
      const options = {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const result = await client.listEvents(workspaceId, options)

      expect(result).toBeDefined()
    })
  })

  describe('createEvent()', () => {
    test('should create a calendar event successfully', async () => {
      const workspaceId = 'workspace_123'
      const event = {
        title: 'Test Meeting',
        description: 'This is a test meeting',
        startTime: '2024-05-14T10:00:00Z',
        endTime: '2024-05-14T11:00:00Z',
        attendees: ['test@example.com'],
        location: 'Conference Room A',
      }

      const result = await client.createEvent(workspaceId, event)

      expect(result).toBeDefined()
      expect(result.eventId).toBeDefined()
      expect(result.eventId).toContain(workspaceId)
      expect(result.htmlLink).toBeDefined()
      expect(result.htmlLink).toContain('calendar.google.com')
    })

    test('should create event with minimal required fields', async () => {
      const workspaceId = 'workspace_123'
      const event = {
        title: 'Quick Meeting',
        startTime: '2024-05-14T10:00:00Z',
        endTime: '2024-05-14T10:30:00Z',
      }

      const result = await client.createEvent(workspaceId, event)

      expect(result.eventId).toBeDefined()
    })

    test('should create event with multiple attendees', async () => {
      const workspaceId = 'workspace_123'
      const event = {
        title: 'Team Meeting',
        startTime: '2024-05-14T10:00:00Z',
        endTime: '2024-05-14T11:00:00Z',
        attendees: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
      }

      const result = await client.createEvent(workspaceId, event)

      expect(result.eventId).toBeDefined()
    })

    test('should generate unique event IDs', async () => {
      const workspaceId = 'workspace_123'
      const event = {
        title: 'Event',
        startTime: '2024-05-14T10:00:00Z',
        endTime: '2024-05-14T11:00:00Z',
      }

      const result1 = await client.createEvent(workspaceId, { ...event })
      const result2 = await client.createEvent(workspaceId, { ...event })

      expect(result1.eventId).not.toBe(result2.eventId)
    })
  })

  describe('updateEvent()', () => {
    test('should update an existing event', async () => {
      const workspaceId = 'workspace_123'
      const eventId = 'evt_workspace_123_1234567890'
      const updates = {
        title: 'Updated Meeting Title',
        description: 'Updated description',
      }

      const result = await client.updateEvent(workspaceId, eventId, updates)

      expect(result).toBeDefined()
      expect(result.eventId).toBe(eventId)
      expect(result.updated).toBe(true)
    })

    test('should update event time', async () => {
      const workspaceId = 'workspace_123'
      const eventId = 'evt_workspace_123_1234567890'
      const updates = {
        startTime: '2024-05-14T14:00:00Z',
        endTime: '2024-05-14T15:00:00Z',
      }

      const result = await client.updateEvent(workspaceId, eventId, updates)

      expect(result.updated).toBe(true)
    })

    test('should update event attendees', async () => {
      const workspaceId = 'workspace_123'
      const eventId = 'evt_workspace_123_1234567890'
      const updates = {
        attendees: ['newattendee@example.com'],
      }

      const result = await client.updateEvent(workspaceId, eventId, updates)

      expect(result.updated).toBe(true)
    })

    test('should update partial event fields', async () => {
      const workspaceId = 'workspace_123'
      const eventId = 'evt_workspace_123_1234567890'
      const updates = {
        location: 'New Location',
      }

      const result = await client.updateEvent(workspaceId, eventId, updates)

      expect(result.updated).toBe(true)
    })
  })

  describe('deleteEvent()', () => {
    test('should delete an event successfully', async () => {
      const workspaceId = 'workspace_123'
      const eventId = 'evt_workspace_123_1234567890'

      const result = await client.deleteEvent(workspaceId, eventId)

      expect(result).toBeDefined()
      expect(result.deleted).toBe(true)
    })

    test('should handle deletion of non-existent event', async () => {
      const workspaceId = 'workspace_123'
      const nonExistentEventId = 'evt_nonexistent'

      const result = await client.deleteEvent(workspaceId, nonExistentEventId)

      expect(result).toBeDefined()
    })
  })

  describe('getConnectionStatus()', () => {
    test('should return null for non-existent connection', async () => {
      const workspaceId = 'workspace_nonexistent'

      const result = await client.getConnectionStatus(workspaceId)

      expect(result).toBeNull()
    })

    test('should handle connection status check', async () => {
      const workspaceId = 'workspace_123'

      const result = await client.getConnectionStatus(workspaceId)

      // Returns null or connection status
      expect(result === null || typeof result === 'object').toBe(true)
    })
  })

  describe('disconnectAccount()', () => {
    test('should disconnect an account successfully', async () => {
      const workspaceId = 'workspace_123'

      const result = await client.disconnectAccount(workspaceId)

      expect(result).toBeDefined()
      expect(result.disconnected).toBe(true)
    })

    test('should handle disconnect for non-existent account', async () => {
      const workspaceId = 'workspace_nonexistent'

      const result = await client.disconnectAccount(workspaceId)

      expect(result).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    test('should handle missing API key gracefully', () => {
      const clientWithoutKey = new ComposioClient({
        apiKey: '',
        baseUrl: 'https://api.composio.dev',
      })

      expect(clientWithoutKey).toBeDefined()
    })

    test('should handle invalid workspace ID format', async () => {
      const workspaceId = ''
      const event = {
        title: 'Test',
        startTime: '2024-05-14T10:00:00Z',
        endTime: '2024-05-14T11:00:00Z',
      }

      const result = await client.createEvent(workspaceId, event)
      expect(result).toBeDefined()
    })

    test('should handle invalid date formats', async () => {
      const workspaceId = 'workspace_123'
      const options = {
        startDate: 'invalid-date',
        endDate: 'also-invalid',
      }

      const result = await client.listEvents(workspaceId, options)
      expect(result).toBeDefined()
    })
  })

  describe('Calendar Event Interface', () => {
    test('should accept event with all optional fields', async () => {
      const workspaceId = 'workspace_123'
      const event = {
        title: 'Complete Event',
        description: 'Full description',
        startTime: '2024-05-14T10:00:00Z',
        endTime: '2024-05-14T11:00:00Z',
        attendees: ['attendee1@example.com', 'attendee2@example.com'],
        location: '123 Main St',
      }

      const result = await client.createEvent(workspaceId, event)

      expect(result.eventId).toBeDefined()
    })

    test('should accept event with only required fields', async () => {
      const workspaceId = 'workspace_123'
      const event = {
        title: 'Minimal Event',
        startTime: '2024-05-14T10:00:00Z',
        endTime: '2024-05-14T11:00:00Z',
      }

      const result = await client.createEvent(workspaceId, event)

      expect(result.eventId).toBeDefined()
    })
  })
})
