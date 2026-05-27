import { db, Prisma } from "@zenda/db/client";
import type Stripe from "stripe";
import { logger } from "../../infra/logger.js";
import { resetUsageOnPlanChange } from "../usage/enforcement.js";
import { tierFromPriceId } from "./products.js";
import { STRIPE_WEBHOOK_SECRET, stripe } from "./stripe.js";

type PlanTier = string;
type BillingPeriod = string;
type SubscriptionStatus = string;

/**
 * Record a Stripe event as processed. Returns true if this is a new event
 * (inserted successfully), false if it was already processed (duplicate).
 */
async function markEventProcessed(
  eventId: string,
  eventType: string
): Promise<boolean> {
  try {
    await db.processedStripeEvent.create({
      data: {
        id: eventId,
        eventType,
      },
    });
    return true;
  } catch (err: unknown) {
    // PostgreSQL unique violation (23505) means already processed
    const pgErr = err as { code?: string } | undefined;
    if (
      pgErr?.code === "23505" ||
      (err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002")
    ) {
      logger.info("Duplicate Stripe event skipped", { eventId, eventType });
      return false;
    }
    throw err;
  }
}

async function handleCheckoutCompleted(event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const workspaceId = session.metadata?.workspaceId;
  const tier = session.metadata?.tier as string;
  const period = session.metadata?.billingPeriod as string;

  if (!workspaceId) {
    return;
  }

  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  // Stripe API returns current_period_start/end at runtime even though
  // the v18 TypeScript types don't include them on Subscription directly.
  const stripeSubscription = (await stripe.subscriptions.retrieve(
    session.subscription as string
  )) as unknown as Stripe.Subscription & {
    current_period_start: number;
    current_period_end: number;
  };

  await db.subscription.update({
    where: { workspaceId },
    data: {
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      planTier: (tier ?? "local_solo") as PlanTier,
      billingPeriod: (period ?? "monthly") as BillingPeriod,
      status: "active",
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      updatedAt: new Date(),
    },
  });

  logger.info("Subscription activated", { workspaceId, tier });
}

async function handleSubscriptionUpdated(event: Stripe.Event): Promise<void> {
  const sub = event.data.object as Stripe.Subscription & {
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };
  const workspaceId = sub.metadata?.workspaceId;

  if (!workspaceId) {
    return;
  }

  const newPriceId = sub.items.data[0]?.price.id;
  const newTier = detectTierFromPrice(newPriceId);

  if (newTier) {
    const current = await db.subscription.findFirst({
      where: { workspaceId },
      select: { planTier: true },
    });

    if (current && isDowngrade(current.planTier, newTier)) {
      logger.info("Plan downgrade detected — resetting usage", {
        workspaceId,
        from: current.planTier,
        to: newTier,
      });
      await resetUsageOnPlanChange(workspaceId);
    }
  }

  await db.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: {
      ...(newTier ? { planTier: newTier as PlanTier } : {}),
      status: sub.status as SubscriptionStatus,
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date(),
    },
  });

  logger.info("Subscription updated", {
    workspaceId,
    status: sub.status,
    newTier,
  });
}

// Note: Elysia doesn't have raw body middleware built in.
// For Stripe webhooks, we need the raw body. This handler
// should be mounted as a separate Express-like route or
// Elysia needs raw body parsing enabled.
// For now, this handles the webhook logic assuming raw body is available.

export async function handleWebhook(
  rawBody: string,
  signature: string
): Promise<void> {
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error("Webhook signature verification failed", {
      error: (err as Error).message,
    });
    throw new Error("Invalid signature");
  }

  // Idempotency: process the event first, THEN mark as processed.
  // This ensures that if the handler crashes, the event is NOT marked
  // as processed and Stripe will retry it.
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspaceId;

      if (!workspaceId) {
        break;
      }

      await db.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: "canceled",
          updatedAt: new Date(),
        },
      });

      logger.info("Subscription canceled", { workspaceId });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const sub = await db.subscription.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (sub) {
        await db.subscription.update({
          where: { id: sub.id },
          data: { status: "past_due", updatedAt: new Date() },
        });

        logger.warn("Payment failed", { workspaceId: sub.workspaceId });
      } else {
        logger.warn("Payment failed but no subscription found for customer", {
          stripeCustomerId: customerId,
        });
      }
      break;
    }

    default:
      logger.debug("Unhandled webhook event", { type: event.type });
  }

  // Only mark processed AFTER the handler succeeds
  await markEventProcessed(event.id, event.type);
}

const TIER_RANK: Record<string, number> = {
  local_solo: 0,
  local_starter: 1,
  local_pro: 2,
  local_business: 3,
};

function detectTierFromPrice(priceId: string | undefined): string | null {
  if (!priceId) {
    return null;
  }
  return tierFromPriceId(priceId);
}

function isDowngrade(from: string, to: string): boolean {
  return (TIER_RANK[from] ?? 0) > (TIER_RANK[to] ?? 0);
}
