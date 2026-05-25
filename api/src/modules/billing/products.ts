import type { PlanTier } from "@zenda/shared";
import { PLANS } from "@zenda/shared";
import { logger } from "../../infra/logger.js";
import { stripe } from "./stripe.js";

// Stripe price IDs per tier (monthly only — no annual billing in WhatsApp-local model)
const STRIPE_PRICES: Record<string, string> = {
  local_solo:
    process.env.STRIPE_PRICE_LOCAL_SOLO_MONTHLY ?? "price_local_solo_monthly",
  local_starter:
    process.env.STRIPE_PRICE_LOCAL_STARTER_MONTHLY ??
    "price_local_starter_monthly",
  local_pro:
    process.env.STRIPE_PRICE_LOCAL_PRO_MONTHLY ?? "price_local_pro_monthly",
  local_business:
    process.env.STRIPE_PRICE_LOCAL_BUSINESS_MONTHLY ??
    "price_local_business_monthly",
};

export function getPriceId(tier: PlanTier): string {
  const priceId = STRIPE_PRICES[tier] ?? STRIPE_PRICES.local_solo;
  if (!priceId.startsWith("price_")) {
    throw new Error(
      `Stripe price ID for tier "${tier}" is not configured. Set STRIPE_PRICE_${tier.toUpperCase()}_MONTHLY or ensure products are synced at startup.`
    );
  }
  return priceId;
}

export async function ensureStripeProducts(): Promise<void> {
  if (!stripe) {
    return;
  }
  for (const [tier, config] of Object.entries(PLANS)) {
    try {
      const products = await stripe.products.list({ limit: 100 });
      const existing = products.data.find(
        (p) => p.name === config.name || p.metadata.tier === tier
      );

      let productId: string;
      if (existing) {
        productId = existing.id;
      } else {
        const product = await stripe.products.create({
          name: config.name,
          description: config.description,
          metadata: { tier },
        });
        productId = product.id;
        logger.info("Created Stripe product", { tier, productId });
      }

      // Find or create the monthly price
      const prices = await stripe.prices.list({
        product: productId,
        limit: 10,
      });
      let monthlyPrice = prices.data.find(
        (p) =>
          p.recurring?.interval === "month" &&
          p.unit_amount === config.monthlyPriceCents
      );

      if (!monthlyPrice) {
        monthlyPrice = await stripe.prices.create({
          product: productId,
          unit_amount: config.monthlyPriceCents,
          currency: "usd",
          recurring: { interval: "month" },
          metadata: { tier, period: "monthly" },
        });
        logger.info("Created Stripe price", { tier, priceId: monthlyPrice.id });
      }

      // Update the runtime price map so getPriceId() returns real IDs
      STRIPE_PRICES[tier] = monthlyPrice.id;
    } catch (err) {
      logger.error("Failed to ensure Stripe product", {
        tier,
        error: (err as Error).message,
      });
    }
  }
}
