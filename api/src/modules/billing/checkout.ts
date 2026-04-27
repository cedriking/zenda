import { stripe } from './stripe.js'
import { getPriceId } from './products.js'
import { db } from '@zenda/db/client'
import { subscriptions } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import type { PlanTier, BillingPeriod } from '@zenda/shared'

export async function createCheckoutSession(
  workspaceId: string,
  customerEmail: string,
  tier: PlanTier,
  period: BillingPeriod,
): Promise<{ url: string }> {
  // Get or create Stripe customer
  const customers = await stripe.customers.list({ email: customerEmail, limit: 1 })
  let customerId = customers.data[0]?.id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: customerEmail,
      metadata: { workspaceId },
    })
    customerId = customer.id
  } else {
    // Update workspace ID on existing customer
    await stripe.customers.update(customerId, {
      metadata: { workspaceId },
    })
  }

  const priceId = getPriceId(tier, period)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/dashboard?billing=success`,
    cancel_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/dashboard/settings?billing=cancel`,
    metadata: { workspaceId, tier, period },
    subscription_data: {
      metadata: { workspaceId, tier },
    },
  })

  return { url: session.url ?? '' }
}

export async function createPortalSession(workspaceId: string): Promise<{ url: string }> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1)

  if (!sub?.stripeCustomerId) {
    throw new Error('No Stripe customer found for this workspace')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/dashboard/settings`,
  })

  return { url: session.url }
}

export async function getSubscription(workspaceId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1)

  return sub ?? null
}
