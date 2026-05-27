/**
 * Integrations Module
 *
 * This module provides server-side integrations for external services:
 * - Composio: Google Calendar and other productivity tools
 */

export * from "./composio/index.js";

import { db } from "@zenda/db/client";
import { Elysia } from "elysia";
import { typedContext } from "../../middleware/typed-context.js";
import { composioModule as composioRoutes } from "./composio/index.js";

/**
 * Main integrations routes module
 * Registers all integration-related endpoints
 */
export const integrationsRoutes = new Elysia({ prefix: "/integrations" })
  .use(typedContext)
  .use(composioRoutes)

  /**
   * Get integration status for a workspace
   */
  .get(
    "/:workspaceId",
    async ({ params }: { params: { workspaceId: string } }) => {
      const workspaceIntegrations = await db.integration.findMany({
        where: { workspaceId: params.workspaceId },
      });

      return {
        integrations: workspaceIntegrations.map((integration) => ({
          id: integration.id,
          type: integration.type,
          provider: integration.provider,
          status: integration.status,
          createdAt: integration.createdAt,
          updatedAt: integration.updatedAt,
        })),
      };
    }
  )

  /**
   * Health check for integrations
   */
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    integrations: {
      composio: process.env.COMPOSIO_API_KEY ? "configured" : "not_configured",
    },
  }));
