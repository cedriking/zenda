import Stripe from 'stripe'
import { stripe, STRIPE_WEBHOOK_SECRET } from './stripe.js'
import { db } from '@zenda/db/client'
import { subscriptions } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'

// Note: Elysia doesn't have raw body middleware built in.
// For Stripe webhooks, we need the raw body. This handler
// should be mounted as a separate Express-like route or
// Elysia needs raw body parsing enabled.
// For now, this handles the webhook logic assuming raw body is available.

export async function handleWebhook(rawBody: string, signature: string): Promise<void> {
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: (err as Error).message })
    throw new Error('Invalid signature')
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata?.workspaceId
      const tier = session.metadata?.tier as string
      const period = session.metadata?.period as string

      if (!workspaceId) break

      // Get subscription details from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      )

      await db
        .update(subscriptions)
        .set({
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          planTier: (tier ?? 'starter') as any,
          billingPeriod: (period ?? 'monthly') as any,
          status: 'active',
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.workspaceId, workspaceId))

      logger.info('Subscription activated', { workspaceId, tier })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const workspaceId = sub.metadata?.workspaceId

      if (!workspaceId) break

      await db
        .update(subscriptions)
        .set({
          status: sub.status as any,
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))

      logger.info('Subscription updated', { workspaceId, status: sub.status })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const workspaceId = sub.metadata?.workspaceId

      if (!workspaceId) break

      await db
        .update(subscriptions)
        .set({
          status: 'canceled',
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))

      logger.info('Subscription canceled', { workspaceId })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      const [sub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeCustomerId, customerId))
        .limit(1)

      if (sub) {
        await db
          .update(subscriptions)
          .set({ status: 'past_due', updatedAt: new Date() })
          .where(eq(subscriptions.id, sub.id))

        logger.warn('Payment failed', { workspaceId: sub.workspaceId })
      } else {
        logger.warn('Payment failed but no subscription found for customer', { stripeCustomerId: customerId })
      }
      break
    }

    default:
      logger.debug('Unhandled webhook event', { type: event.type })
  }
}

