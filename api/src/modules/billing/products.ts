import type { PlanTier } from "@zenda/shared";
import { PLANS } from "@zenda/shared";
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
  return STRIPE_PRICES[tier] ?? STRIPE_PRICES.local_solo;
}

export async function ensureStripeProducts(): Promise<void> {
  if (!stripe) {
    return;
  }
  for (const [tier, config] of Object.entries(PLANS)) {
    try {
      const products = await stripe.products.list({ limit: 100 });
      const existing = products.data.find((p) => p.name === config.name);

      if (!existing) {
        const product = await stripe.products.create({
          name: config.name,
          description: config.description,
          metadata: { tier },
        });

        await stripe.prices.create({
          product: product.id,
          unit_amount: config.monthlyPriceCents,
          currency: "usd",
          recurring: { interval: "month" },
          metadata: { tier, period: "monthly" },
        });
      }
    } catch {
      // Products might already exist — skip
    }
  }
}
