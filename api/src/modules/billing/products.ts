import type { PlanTier } from "@zenda/shared";
import { PLANS } from "@zenda/shared";
import { logger } from "../../infra/logger.js";
import { stripe } from "./stripe.js";

export type BillingPeriod = "monthly" | "annual";

// Annual discount: 20% off equivalent monthly price
const ANNUAL_DISCOUNT = 0.8;

// Stripe price IDs per tier and billing period
const STRIPE_PRICES: Record<string, Record<BillingPeriod, string>> = {
  local_solo: {
    monthly:
      process.env.STRIPE_PRICE_LOCAL_SOLO_MONTHLY ??
      "UNCONFIGURED_local_solo_monthly",
    annual:
      process.env.STRIPE_PRICE_LOCAL_SOLO_ANNUALLY ??
      "UNCONFIGURED_local_solo_annually",
  },
  local_starter: {
    monthly:
      process.env.STRIPE_PRICE_LOCAL_STARTER_MONTHLY ??
      "UNCONFIGURED_local_starter_monthly",
    annual:
      process.env.STRIPE_PRICE_LOCAL_STARTER_ANNUALLY ??
      "UNCONFIGURED_local_starter_annually",
  },
  local_pro: {
    monthly:
      process.env.STRIPE_PRICE_LOCAL_PRO_MONTHLY ??
      "UNCONFIGURED_local_pro_monthly",
    annual:
      process.env.STRIPE_PRICE_LOCAL_PRO_ANNUALLY ??
      "UNCONFIGURED_local_pro_annually",
  },
  local_business: {
    monthly:
      process.env.STRIPE_PRICE_LOCAL_BUSINESS_MONTHLY ??
      "UNCONFIGURED_local_business_monthly",
    annual:
      process.env.STRIPE_PRICE_LOCAL_BUSINESS_ANNUALLY ??
      "UNCONFIGURED_local_business_annually",
  },
};

// Real Stripe price IDs match: price_ followed by alphanumeric chars
const STRIPE_PRICE_ID_RE = /^price_[A-Za-z0-9]+$/;

/**
 * Reverse lookup: find the tier associated with a known Stripe price ID.
 * Returns null if the price ID is not in our configured map.
 */
export function tierFromPriceId(priceId: string): PlanTier | null {
  for (const [tier, periods] of Object.entries(STRIPE_PRICES)) {
    for (const price of Object.values(periods)) {
      if (price === priceId) {
        return tier as PlanTier;
      }
    }
  }
  return null;
}

export function getPriceId(tier: PlanTier, period: BillingPeriod = "monthly"): string {
  const priceId = STRIPE_PRICES[tier]?.[period] ?? STRIPE_PRICES.local_solo.monthly;
  if (!STRIPE_PRICE_ID_RE.test(priceId)) {
    throw new Error(
      `Stripe price ID for tier "${tier}" period "${period}" is not configured.`
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

      const prices = await stripe.prices.list({
        product: productId,
        limit: 10,
      });

      // Find or create the monthly price
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

      // Find or create the annual price (20% discount)
      const annualCents = Math.round(config.monthlyPriceCents * 12 * ANNUAL_DISCOUNT);
      let annualPrice = prices.data.find(
        (p) =>
          p.recurring?.interval === "year" &&
          p.unit_amount === annualCents
      );
      if (!annualPrice) {
        annualPrice = await stripe.prices.create({
          product: productId,
          unit_amount: annualCents,
          currency: "usd",
          recurring: { interval: "year" },
          metadata: { tier, period: "annual" },
        });
        logger.info("Created Stripe annual price", { tier, priceId: annualPrice.id });
      }

      // Update the runtime price maps
      STRIPE_PRICES[tier] = { monthly: monthlyPrice.id, annual: annualPrice.id };
    } catch (err) {
      logger.error("Failed to ensure Stripe product", {
        tier,
        error: (err as Error).message,
      });
    }
  }
}
