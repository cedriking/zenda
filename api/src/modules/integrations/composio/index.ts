import { Elysia } from "elysia";
import { authBase } from "../../../middleware/auth.js";
import { typedContext } from "../../../middleware/typed-context.js";

/**
 * Composio integration module
 * Handles Google Calendar and other external integrations via Composio
 */
export const composioModule = new Elysia({ prefix: "/integrations/composio" })
  .use(typedContext)
  .use(authBase)
  /**
   * Get connection URL for Google Calendar
   */
  .get("/connect/:workspaceId", async ({ params, workspaceId, set }) => {
    if (!workspaceId || params.workspaceId !== workspaceId) {
      set.status = 403;
      return { error: "Workspace access denied" };
    }
    // TODO: Implement connection flow
    return {
      connectionUrl: "",
      workspaceId: params.workspaceId,
    };
  })

  /**
   * Callback handler after user authorizes
   */
  .get("/callback", async ({ query }) => {
    // TODO: Implement callback handler
    return { status: "connected" };
  })

  /**
   * Test connection
   */
  .post("/test/:workspaceId", async ({ params, workspaceId, set }) => {
    if (!workspaceId || params.workspaceId !== workspaceId) {
      set.status = 403;
      return { error: "Workspace access denied" };
    }
    // TODO: Implement connection test
    return {
      status: "ok",
      workspaceId: params.workspaceId,
    };
  })

  /**
   * Health check for Composio integration
   */
  .get("/health", () => ({
    status: "ok",
    integration: "composio",
    timestamp: new Date().toISOString(),
  }));
