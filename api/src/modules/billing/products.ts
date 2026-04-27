import { stripe } from './stripe.js'
import { PLANS } from '@zenda/shared'
import type { PlanTier, BillingPeriod } from '@zenda/shared'

// In production, these would be created in Stripe Dashboard and stored as env vars
// For now, we create them dynamically

const STRIPE_PRICES: Record<string, Record<BillingPeriod, string>> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? 'price_starter_monthly',
    annual: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? 'price_starter_annual',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? 'price_pro_monthly',
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? 'price_pro_annual',
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? 'price_business_monthly',
    annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL ?? 'price_business_annual',
  },
}

export function getPriceId(tier: PlanTier, period: BillingPeriod): string {
  return STRIPE_PRICES[tier]?.[period] ?? STRIPE_PRICES.starter.monthly
}

export async function ensureStripeProducts(): Promise<void> {
  for (const [tier, config] of Object.entries(PLANS)) {
    // Check if product exists (by lookup key pattern)
    try {
      const products = await stripe.products.list({ limit: 100 })
      const existing = products.data.find(p => p.name === config.name)

      if (!existing) {
        const product = await stripe.products.create({
          name: config.name,
          description: config.description,
          metadata: { tier },
        })

        // Create monthly price
        await stripe.prices.create({
          product: product.id,
          unit_amount: config.monthlyPriceCents,
          currency: 'usd',
          recurring: { interval: 'month' },
          metadata: { tier, period: 'monthly' },
        })

        // Create annual price
        await stripe.prices.create({
          product: product.id,
          unit_amount: config.annualPriceCents,
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: { tier, period: 'annual' },
        })
      }
    } catch {
      // Products might already exist — skip
    }
  }
}
