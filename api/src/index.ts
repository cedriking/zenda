import { cors } from "@elysiajs/cors";
import { db } from "@zenda/db/client";
import { revokedTokens, workspaceMembers, workspaces } from "@zenda/db/schema";
import { and, eq, lt, sql } from "drizzle-orm";
import { Elysia } from "elysia";
import { jwtVerify } from "jose";
import {
  API_PORT,
  CORS_ORIGINS,
  isStripeLiveMode,
  JWT_SECRET,
  NODE_ENV,
  validateProductionEnv,
} from "./config/env.js";
import { logger } from "./infra/logger.js";
import { redis } from "./infra/redis.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { adminModule } from "./modules/admin/index.js";
import { translationModule } from "./modules/ai/translation.js";
import { analyticsModule } from "./modules/analytics/index.js";
import { appointmentModule } from "./modules/appointment/index.js";
import { processDueReminders } from "./modules/appointment/reminder-service.js";
import { authModule } from "./modules/auth/index.js";
import { availabilityModule } from "./modules/availability/index.js";
import { billingModule } from "./modules/billing/index.js";
import { ensureStripeProducts } from "./modules/billing/products.js";
import { stripe } from "./modules/billing/stripe.js";
import { businessModule } from "./modules/business/index.js";
import { customerModule } from "./modules/conversation/customer-endpoint.js";
import { conversationModule } from "./modules/conversation/index.js";
import { composioModule } from "./modules/integrations/composio/index.js";
import { knowledgeBaseModule } from "./modules/knowledge-base/index.js";
import { messagingModule } from "./modules/messaging/index.js";
import { monitoringModule } from "./modules/monitoring/index.js";
import { notificationModule } from "./modules/notification/index.js";
import { onboardingModule } from "./modules/onboarding/index.js";
import { queueModule } from "./modules/queue/index.js";
import { serviceModule } from "./modules/service/index.js";
import { settingsModule } from "./modules/settings/index.js";
import { staffModule } from "./modules/staff/index.js";
import { supportModule } from "./modules/support/index.js";
import { usageModule } from "./modules/usage/index.js";
import { wsModule } from "./modules/whatsapp/ws-handler.js";
import { workspaceModule } from "./modules/workspace/index.js";

// ── Startup validation ─────────────────────────────────────────────
validateProductionEnv();

if (stripe) {
  const mode = isStripeLiveMode() ? "LIVE" : "TEST";
  logger.info(`Stripe initialized in ${mode} mode`);
} else {
  logger.warn("Stripe not configured — billing features disabled");
}

const corsOrigins = CORS_ORIGINS.split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const jwtSecret = new TextEncoder().encode(JWT_SECRET);

const PUBLIC_PATHS = [
  "/auth",
  "/health",
  "/billing/webhook",
  "/billing/plans",
  "/ws",
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

const _app = new Elysia()
  .use(cors({ origin: corsOrigins, credentials: true }))
  .use(rateLimit())

  // ── Global auth derive ──────────────────────────────────────────
  .derive(async ({ headers, path }) => {
    if (isPublicPath(path)) {
      return {
        userId: null as string | null,
        workspaceId: null as string | null,
        workspace: null as Record<string, unknown> | null,
      };
    }

    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return {
        userId: null as string | null,
        workspaceId: null as string | null,
        workspace: null as Record<string, unknown> | null,
      };
    }

    try {
      const token = authHeader.slice(7);
      const { payload } = await jwtVerify(token, jwtSecret);
      const userId = (payload.sub as string) ?? null;
      const workspaceId =
        ((payload as Record<string, unknown>).workspaceId as string) ?? null;

      // Check if the token has been revoked
      const jti = (payload as Record<string, unknown>).jti as
        | string
        | undefined;
      if (jti) {
        const [revoked] = await db
          .select({ id: revokedTokens.id })
          .from(revokedTokens)
          .where(eq(revokedTokens.tokenJti, jti))
          .limit(1);
        if (revoked) {
          return {
            userId: null as string | null,
            workspaceId: null as string | null,
            workspace: null as Record<string, unknown> | null,
          };
        }
      }
      // biome-ignore lint/suspicious/noExplicitAny: workspace type resolved dynamically from DB
      let workspace: any = null;
      if (userId && workspaceId) {
        const [membership] = await db
          .select()
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.userId, userId),
              eq(workspaceMembers.workspaceId, workspaceId)
            )
          )
          .limit(1);

        if (membership) {
          const [ws] = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId))
            .limit(1);
          workspace = ws ?? null;
        }
      }

      return { userId, workspaceId, workspace };
    } catch {
      return {
        userId: null as string | null,
        workspaceId: null as string | null,
        workspace: null as Record<string, unknown> | null,
      };
    }
  })

  // ── Global auth guard ───────────────────────────────────────────
  .onBeforeHandle(({ userId, workspace, path }) => {
    if (isPublicPath(path)) {
      return;
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!workspace) {
      return new Response(
        JSON.stringify({ error: "Workspace not found or access denied" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  })

  // ── Health (public) ─────────────────────────────────────────────
  .get("/health", async () => {
    const checks: { db: boolean; redis: boolean; stripe: boolean } = {
      db: false,
      redis: false,
      stripe: false,
    };

    try {
      await db.execute(sql`SELECT 1`);
      checks.db = true;
    } catch {
      // db unreachable — health check reports degraded
    }

    try {
      await redis.ping();
      checks.redis = true;
    } catch {
      // redis unreachable — health check reports degraded
    }

    if (stripe) {
      try {
        await stripe.products.list({ limit: 1 });
        checks.stripe = true;
      } catch {
        // stripe unreachable — health check reports degraded
      }
    } else {
      checks.stripe = true;
    }

    const allOk = checks.db && checks.redis && checks.stripe;
    return {
      status: allOk ? "ok" : "degraded",
      ...checks,
      timestamp: new Date().toISOString(),
    };
  })

  // ── Public routes ───────────────────────────────────────────────
  .use(authModule)
  .use(billingModule)

  // ── Authenticated routes ────────────────────────────────────────
  .use(workspaceModule)
  .use(wsModule)
  .use(conversationModule)
  .use(appointmentModule)
  .use(serviceModule)
  .use(staffModule)
  .use(availabilityModule)
  .use(businessModule)
  .use(notificationModule)
  .use(usageModule)
  .use(onboardingModule)
  .use(knowledgeBaseModule)
  .use(customerModule)
  .use(analyticsModule)
  .use(queueModule)
  .use(adminModule)
  .use(monitoringModule)
  .use(translationModule)
  .use(supportModule)
  .use(composioModule) // Composio integration (authenticated)
  .use(messagingModule) // Consent management (authenticated)
  .use(settingsModule) // Settings endpoints (authenticated)

  // biome-ignore lint/suspicious/noExplicitAny: Elysia onError handler has complex generics
  .onError((handler: any) => {
    const { error, set, code } = handler;
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation error" };
    }
    const message =
      error instanceof Error ? error.message : "Internal server error";
    logger.error("Unhandled error", {
      error: message,
      ...(NODE_ENV !== "production" && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    });
    set.status = 500;
    return { error: "Internal server error" };
  })
  .listen(Number(API_PORT));

logger.info(`Zenda API running on port ${API_PORT}`);

// ── Seed Stripe products on startup ───────────────────────────────
ensureStripeProducts()
  .then(() => logger.info("Stripe products ensured"))
  .catch((err) =>
    logger.error("Failed to seed Stripe products", {
      error: (err as Error).message,
    })
  );

// ── Periodic cleanup of expired revoked tokens ─────────────────────
// Revoked tokens older than 7 days (max refresh token lifetime) are safe to remove
const REVOKED_TOKEN_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const REVOKED_TOKEN_MAX_AGE_DAYS = 7;

setInterval(async () => {
  try {
    const cutoff = new Date(
      Date.now() - REVOKED_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60 * 1000
    );
    const result = await db
      .delete(revokedTokens)
      .where(lt(revokedTokens.revokedAt, cutoff))
      .returning({ id: revokedTokens.id });
    if (result.length > 0) {
      logger.info("Cleaned up expired revoked tokens", {
        count: result.length,
      });
    }
  } catch (err) {
    logger.error("Failed to clean up revoked tokens", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}, REVOKED_TOKEN_CLEANUP_INTERVAL);

// ── Reminder scheduler: process due reminders every 60 seconds ──
const REMINDER_INTERVAL_MS = 60_000;

async function runReminderCycle() {
  try {
    const sent = await processDueReminders();
    if (sent > 0) {
      logger.info("Reminder cycle completed", { sent });
    }
  } catch (err) {
    logger.error("Reminder cycle failed", { error: (err as Error).message });
  }
}

// Stagger the first run 10 seconds after startup to let connections settle
setTimeout(() => {
  runReminderCycle();
  setInterval(runReminderCycle, REMINDER_INTERVAL_MS);
}, 10_000);

logger.info(
  `Reminder scheduler active (every ${REMINDER_INTERVAL_MS / 1000}s)`
);
