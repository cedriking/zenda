import { db } from "@zenda/db/client";
import Elysia from "elysia";
import { decrypt, encrypt } from "../../../infra/encryption.js";
import { logger } from "../../../infra/logger.js";
import { typedContext } from "../../../middleware/typed-context.js";
import { exchangeCodeForTokens, getAuthUrl, listCalendars } from "./client.js";

/**
 * Google Calendar integration routes.
 * Prefix: /integrations/google
 */
export const googleCalendarModule = new Elysia({
  prefix: "/integrations/google",
})
  .use(typedContext)

  /**
   * GET /connect
   * Returns the Google OAuth consent screen URL.
   */
  .get("/connect", ({ workspaceId }) => {
    if (!workspaceId) {
      return { authUrl: null, error: "No workspace" };
    }

    // State = workspaceId (in production, sign this with HMAC)
    const state = Buffer.from(JSON.stringify({ wid: workspaceId })).toString(
      "base64url"
    );
    const authUrl = getAuthUrl(state);

    return { authUrl };
  })

  /**
   * GET /callback
   * Public route — Google redirects here after user consents.
   * Exchanges the auth code for tokens and stores them encrypted.
   */
  .get("/callback", async ({ query, set }) => {
    const code = query.code as string;
    const state = query.state as string;
    const error = query.error as string;

    if (error) {
      logger.warn("Google OAuth callback error", { error });
      set.redirect = `zenda://integrations/google/connected?status=error&message=${encodeURIComponent(error)}`;
      return;
    }

    if (!code) {
      set.redirect =
        "zenda://integrations/google/connected?status=error&message=missing_code";
      return;
    }

    // Decode workspaceId from state
    let workspaceId: string;
    try {
      const parsed = JSON.parse(Buffer.from(state, "base64url").toString()) as {
        wid: string;
      };
      workspaceId = parsed.wid;
    } catch {
      set.redirect =
        "zenda://integrations/google/connected?status=error&message=invalid_state";
      return;
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Encrypt and store credentials
    const encryptedCreds = await encrypt(
      JSON.stringify({
        refreshToken: tokens.refreshToken,
        accessToken: tokens.accessToken,
        expiryDate: tokens.expiryDate,
      })
    );

    // Upsert integration row
    await db.integration.upsert({
      where: {
        id:
          (
            await db.integration.findFirst({
              where: {
                workspaceId,
                type: "google_calendar",
                provider: "google",
              },
              select: { id: true },
            })
          )?.id ?? "nonexistent",
      },
      create: {
        workspaceId,
        type: "google_calendar",
        provider: "google",
        credentials: encryptedCreds,
        status: "active",
        config: JSON.stringify({ email: tokens.email, calendarId: "primary" }),
      },
      update: {
        credentials: encryptedCreds,
        status: "active",
        config: JSON.stringify({ email: tokens.email, calendarId: "primary" }),
      },
    });

    logger.info("Google Calendar connected", {
      workspaceId,
      email: tokens.email,
    });

    set.redirect = "zenda://integrations/google/connected?status=success";
  })

  /**
   * GET /status
   * Returns whether Google Calendar is connected for this workspace.
   */
  .get("/status", async ({ workspaceId }) => {
    if (!workspaceId) {
      return { connected: false };
    }
    const integration = await db.integration.findFirst({
      where: {
        workspaceId,
        type: "google_calendar",
        provider: "google",
      },
    });

    if (!integration || integration.status !== "active") {
      return { connected: false };
    }

    const config = integration.config
      ? (JSON.parse(integration.config) as {
          email?: string;
          calendarId?: string;
        })
      : {};

    return {
      connected: true,
      email: config.email ?? null,
      selectedCalendarId: config.calendarId ?? "primary",
      lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
    };
  })

  /**
   * POST /disconnect
   * Disconnects Google Calendar for this workspace.
   */
  .post("/disconnect", async ({ workspaceId }) => {
    if (!workspaceId) {
      return { success: false, error: "No workspace" };
    }
    const integration = await db.integration.findFirst({
      where: {
        workspaceId,
        type: "google_calendar",
        provider: "google",
        status: "active",
      },
    });

    if (integration) {
      await db.integration.update({
        where: { id: integration.id },
        data: {
          status: "inactive",
          credentials: null,
        },
      });
    }

    logger.info("Google Calendar disconnected", { workspaceId });
    return { success: true };
  })

  /**
   * GET /calendars
   * Lists the user's Google Calendars (requires active connection).
   */
  .get("/calendars", async ({ workspaceId }) => {
    if (!workspaceId) {
      return { calendars: [] };
    }
    const integration = await db.integration.findFirst({
      where: {
        workspaceId,
        type: "google_calendar",
        provider: "google",
        status: "active",
      },
    });

    if (!integration?.credentials) {
      return { calendars: [] };
    }

    try {
      const creds = JSON.parse(await decrypt(integration.credentials)) as {
        refreshToken: string;
        accessToken: string;
        expiryDate: number;
      };

      let accessToken = creds.accessToken;
      if (Date.now() >= creds.expiryDate - 300_000) {
        const { refreshAccessToken } = await import("./client.js");
        accessToken = await refreshAccessToken(creds.refreshToken);
      }

      const calendars = await listCalendars(accessToken);
      return { calendars };
    } catch (err) {
      logger.error("Failed to list Google Calendars", {
        workspaceId,
        error: (err as Error).message,
      });
      return { calendars: [], error: "Failed to list calendars" };
    }
  })

  /**
   * POST /calendars/select
   * Saves the selected Google Calendar ID.
   */
  .post("/calendars/select", async ({ workspaceId, body }) => {
    if (!workspaceId) {
      return { success: false, error: "No workspace" };
    }
    const { calendarId } = body as { calendarId: string };

    const integration = await db.integration.findFirst({
      where: {
        workspaceId,
        type: "google_calendar",
        provider: "google",
        status: "active",
      },
    });

    if (!integration) {
      return { success: false, error: "Not connected" };
    }

    const existingConfig = integration.config
      ? (JSON.parse(integration.config) as Record<string, unknown>)
      : {};

    await db.integration.update({
      where: { id: integration.id },
      data: {
        config: JSON.stringify({ ...existingConfig, calendarId }),
      },
    });

    return { success: true };
  });
