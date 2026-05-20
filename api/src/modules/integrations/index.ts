/**
 * Integrations Module
 *
 * This module provides server-side integrations for external services:
 * - Composio: Google Calendar and other productivity tools
 */

export * from './composio/index.js'

import { Elysia } from 'elysia'
import { composioRoutes } from './composio/index.js'

/**
 * Main integrations routes module
 * Registers all integration-related endpoints
 */
export const integrationsRoutes = new Elysia({ prefix: '/integrations' })
  .use(composioRoutes)

  /**
   * Get integration status for a workspace
   */
  .get('/:workspaceId', async ({ params }) => {
    const { db } = await import('@zenda/db/client')
    const { integrations, eq } = await import('drizzle-orm')

    const workspaceIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.workspaceId, params.workspaceId))

    return {
      integrations: workspaceIntegrations.map((integration) => ({
        id: integration.id,
        type: integration.type,
        provider: integration.provider,
        status: integration.status,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      })),
    }
  })

  /**
   * Health check for integrations
   */
  .get('/health', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      integrations: {
        composio: process.env.COMPOSIO_API_KEY ? 'configured' : 'not_configured',
      },
    }
  })
