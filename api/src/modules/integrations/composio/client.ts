/**
 * Composio Client for Google Calendar Integration
 * Uses Vercel AI SDK pattern for tool execution
 */

import { logger } from '../../../infra/logger.js'

export interface ComposioConfig {
  apiKey: string
  baseUrl?: string
}

export interface CalendarEvent {
  title: string
  description?: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
  attendees?: string[]
  location?: string
}

export interface ConnectedAccount {
  id: string
  provider: string
  status: 'active' | 'inactive' | 'error'
}

/**
 * Composio Client class for Google Calendar operations
 *
 * This client follows the Vercel AI SDK pattern where:
 * 1. Connect account first to get authorization
 * 2. Use tools to execute calendar operations
 * 3. Manage connection lifecycle
 */
export class ComposioClient {
  private config: ComposioConfig
  private baseUrl: string

  constructor(config: ComposioConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://api.composio.dev'
  }

  /**
   * Connect a Google Calendar account for a workspace
   * Returns the connection URL that the user should visit to authorize
   */
  async connectAccount(workspaceId: string): Promise<{ connectionUrl: string; sessionId: string }> {
    try {
      // In a real implementation, this would call Composio's API to create a connection
      // For now, we'll return a mock response that follows the expected pattern

      const sessionId = `sess_${workspaceId}_${Date.now()}`

      // This would normally be: POST /v1/connections
      const connectionUrl = `${this.baseUrl}/v1/connections/google_calendar/authorize?session_id=${sessionId}&redirect_uri=${encodeURIComponent(`${process.env.API_BASE_URL || 'http://localhost:3001'}/integrations/composio/callback`)}`

      logger.info('Composio connection initiated', { workspaceId, sessionId })

      return {
        connectionUrl,
        sessionId,
      }
    } catch (error) {
      logger.error('Composio connect account failed', { error, workspaceId })
      throw new Error(`Failed to initiate connection: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Handle OAuth callback and complete connection
   */
  async handleCallback(sessionId: string, code: string, workspaceId: string): Promise<ConnectedAccount> {
    try {
      // In a real implementation, exchange the code for an access token
      // POST /v1/connections/callback

      logger.info('Composio callback processed', { sessionId, workspaceId })

      return {
        id: `acc_${workspaceId}`,
        provider: 'google_calendar',
        status: 'active',
      }
    } catch (error) {
      logger.error('Composio callback failed', { error, sessionId })
      throw new Error(`Failed to complete connection: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * List calendar events for a date range
   */
  async listEvents(
    workspaceId: string,
    options: {
      startDate: string
      endDate: string
      calendarId?: string
    }
  ): Promise<CalendarEvent[]> {
    try {
      // In a real implementation, this would use Composio's tools
      // GET /v1/tools/google_calendar/list_events

      logger.info('Composio list events', { workspaceId, options })

      // Mock response - in production this would call the actual API
      return []
    } catch (error) {
      logger.error('Composio list events failed', { error, workspaceId })
      throw new Error(`Failed to list events: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Create a new calendar event
   */
  async createEvent(workspaceId: string, event: CalendarEvent): Promise<{ eventId: string; htmlLink: string }> {
    try {
      // In a real implementation, this would use Composio's tools
      // POST /v1/tools/google_calendar/create_event

      logger.info('Composio create event', { workspaceId, event })

      // Mock response - in production this would call the actual API
      const eventId = `evt_${workspaceId}_${Date.now()}`

      return {
        eventId,
        htmlLink: `https://calendar.google.com/calendar/event?eid=${eventId}`,
      }
    } catch (error) {
      logger.error('Composio create event failed', { error, workspaceId })
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    workspaceId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<{ eventId: string; updated: boolean }> {
    try {
      // In a real implementation, this would use Composio's tools
      // PATCH /v1/tools/google_calendar/update_event

      logger.info('Composio update event', { workspaceId, eventId, updates })

      return {
        eventId,
        updated: true,
      }
    } catch (error) {
      logger.error('Composio update event failed', { error, workspaceId, eventId })
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(workspaceId: string, eventId: string): Promise<{ deleted: boolean }> {
    try {
      // In a real implementation, this would use Composio's tools
      // DELETE /v1/tools/google_calendar/delete_event

      logger.info('Composio delete event', { workspaceId, eventId })

      return { deleted: true }
    } catch (error) {
      logger.error('Composio delete event failed', { error, workspaceId, eventId })
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Get connection status for a workspace
   */
  async getConnectionStatus(workspaceId: string): Promise<ConnectedAccount | null> {
    try {
      // In a real implementation, this would check the connection status
      // GET /v1/connections/:workspaceId

      return null
    } catch (error) {
      logger.error('Composio get connection status failed', { error, workspaceId })
      return null
    }
  }

  /**
   * Disconnect a calendar account
   */
  async disconnectAccount(workspaceId: string): Promise<{ disconnected: boolean }> {
    try {
      // In a real implementation, this would revoke the connection
      // DELETE /v1/connections/:workspaceId

      logger.info('Composio disconnect account', { workspaceId })

      return { disconnected: true }
    } catch (error) {
      logger.error('Composio disconnect account failed', { error, workspaceId })
      throw new Error(`Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

// Singleton instance
let composioClientInstance: ComposioClient | null = null

export function getComposioClient(): ComposioClient {
  if (!composioClientInstance) {
    const config: ComposioConfig = {
      apiKey: process.env.COMPOSIO_API_KEY || '',
      baseUrl: process.env.COMPOSIO_BASE_URL,
    }

    if (!config.apiKey) {
      logger.warn('COMPOSIO_API_KEY not set, Composio integration will be disabled')
    }

    composioClientInstance = new ComposioClient(config)
  }
  return composioClientInstance
}
