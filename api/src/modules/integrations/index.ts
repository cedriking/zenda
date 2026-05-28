/**
 * Integrations Module
 *
 * This module provides server-side integrations for external services:
 * - Google Calendar: Direct Google Calendar API integration
 */

// biome-ignore lint/performance/noBarrelFile: re-export for convenience
export * from "./google/index.js";

import { db } from "@zenda/db/client";
import { Elysia } from "elysia";
import { typedContext } from "../../middleware/typed-context.js";
import { googleCalendarModule } from "./google/index.js";

/**
 * Main integrations routes module
 * Registers all integration-related endpoints
 */
export const integrationsRoutes = new Elysia({ prefix: "/integrations" })
  .use(typedContext)
  .use(googleCalendarModule)

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
      googleCalendar: process.env.GOOGLE_CLIENT_ID
        ? "configured"
        : "not_configured",
    },
  }));
