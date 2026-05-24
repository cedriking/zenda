import { PLANS } from "@zenda/shared";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import { badRequest, serverError } from "../../utils/errors.js";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
} from "./checkout.js";
import { handleWebhook } from "./webhooks.js";

export const billingModule = new Elysia({ prefix: "/billing" })
  // Public: list available plans (no auth required)
  .get("/plans", () => PLANS)

  .use(typedContext)
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
      logger.error("Webhook processing error — returning 500 for Stripe retry", {
        error: message,
      });
      set.status = 500;
      return { error: "Webhook processing failed" };
    }
  })

  // Authenticated endpoints

  // Create checkout session
  .post(
    "/checkout",
    async ({ workspaceId, body, set }) => {
      const data = body as Record<string, string>;
      try {
        const session = await createCheckoutSession(
          workspaceId!,
          data.email,
          (data.tier ?? "local_solo") as any
        );
        return session;
      } catch (err) {
        logger.error("Checkout error", { error: (err as Error).message });
        return serverError(set, "Failed to create checkout session");
      }
    },
    {
      body: t.Object({
        tier: t.String(),
        email: t.String(),
      }),
    }
  )

  // Create portal session
  .post("/portal", async ({ workspaceId, set }) => {
    try {
      return await createPortalSession(workspaceId!);
    } catch (err) {
      logger.error("Portal error", { error: (err as Error).message });
      return serverError(set, "Failed to create portal session");
    }
  })

  // Get current subscription
  .get("/subscription", async ({ workspaceId, set }) => {
    try {
      return await getSubscription(workspaceId!);
    } catch (err) {
      logger.error("Subscription error", { error: (err as Error).message });
      return serverError(set, "Failed to get subscription");
    }
  });
