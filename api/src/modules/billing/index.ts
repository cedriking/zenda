import { db } from "@zenda/db/client";
import type { PlanTier } from "@zenda/shared";
import { PLANS } from "@zenda/shared";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { badRequest, serverError } from "../../utils/errors.js";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
} from "./checkout.js";
import { handleWebhook } from "./webhooks.js";

/**
 * Type-only decoration for context properties provided by the global auth derive.
 * Removed typedContext to avoid runtime decoration overwriting derived auth values.
 * The global derive in index.ts provides userId/workspaceId at runtime.
 */
interface AuthContext {
  userId: string | null;
  workspaceId: string | null;
}

export const billingModule = new Elysia({ prefix: "/billing" })
  // Public: list available plans (no auth required)
  .get("/plans", () => PLANS)

  // Stripe webhook endpoint — NO auth (Stripe calls this directly)
  // No body schema defined so Elysia doesn't auto-parse — request.text() works
  .post("/webhook", async ({ request, set }) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return badRequest(set, "Missing signature");
    }

    try {
      const rawBody = await request.text();
      await handleWebhook(rawBody, signature);
      return { received: true };
    } catch (err) {
      const message = (err as Error).message;
      // Signature verification failures are permanent — no point retrying
      if (message === "Invalid signature") {
        return badRequest(set, "Invalid signature");
      }
      // Transient errors (DB down, network) — return non-200 so Stripe retries
      logger.error(
        "Webhook processing error — returning 500 for Stripe retry",
        {
          error: message,
        }
      );
      set.status = 500;
      return { error: "Webhook processing failed" };
    }
  })

  // Authenticated endpoints

  // Create checkout session
  .post(
    "/checkout",
    async (ctx) => {
      const { body, set } = ctx;
      const workspaceId = (ctx as unknown as AuthContext).workspaceId;
      if (!workspaceId) {
        set.status = 401;
        return { error: "Authentication required" };
      }
      const data = body as Record<string, string | undefined>;
      const tier = (data.tier ?? "free") as PlanTier;

      // Free tier: skip Stripe, create subscription record directly
      if (tier === "free") {
        try {
          const existing = await db.subscription.findFirst({
            where: { workspaceId },
          });
          if (existing) {
            // Already has a subscription — let them use the existing one
            return {
              url: `${process.env.APP_URL ?? "http://localhost:5173"}/dashboard?billing=free`,
            };
          }
          await db.subscription.create({
            data: {
              workspaceId,
              stripeCustomerId: `free_${workspaceId}`,
              stripeSubscriptionId: `free_${workspaceId}`,
              planTier: "free",
              status: "active",
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
          logger.info("Activated free tier", { workspaceId });
          return {
            url: `${process.env.APP_URL ?? "http://localhost:5173"}/dashboard?billing=free`,
          };
        } catch (err) {
          logger.error("Free tier activation error", {
            error: (err as Error).message,
          });
          return serverError(set, "Failed to activate free tier");
        }
      }

      try {
        const session = await createCheckoutSession(
          workspaceId,
          data.email,
          (data.tier ?? "local_solo") as PlanTier,
          data.founding === "true",
          (data.billingPeriod === "annual" ? "annual" : "monthly") as
            | "monthly"
            | "annual"
        );
        return session;
      } catch (err) {
        const message = (err as Error).message;
        logger.error("Checkout error", { error: message });
        if (message.includes("not configured")) {
          return badRequest(set, message);
        }
        return serverError(set, "Failed to create checkout session");
      }
    },
    {
      body: t.Object({
        tier: t.String(),
        email: t.Optional(t.String()),
        founding: t.Optional(t.String()),
        billingPeriod: t.Optional(t.String()),
      }),
    }
  )

  // Create portal session
  .post("/portal", async (ctx) => {
    const { set } = ctx;
    const workspaceId = (ctx as unknown as AuthContext).workspaceId;
    if (!workspaceId) {
      set.status = 401;
      return { error: "Authentication required" };
    }
    try {
      return await createPortalSession(workspaceId);
    } catch (err) {
      logger.error("Portal error", { error: (err as Error).message });
      return serverError(set, "Failed to create portal session");
    }
  })

  // Get current subscription
  .get("/subscription", async (ctx) => {
    const { set } = ctx;
    const workspaceId = (ctx as unknown as AuthContext).workspaceId;
    if (!workspaceId) {
      set.status = 401;
      return { error: "Authentication required" };
    }
    try {
      return await getSubscription(workspaceId);
    } catch (err) {
      logger.error("Subscription error", { error: (err as Error).message });
      return serverError(set, "Failed to get subscription");
    }
  });
