import { Elysia, t } from 'elysia'
import { createCheckoutSession, createPortalSession, getSubscription } from './checkout.js'
import { handleWebhook } from './webhooks.js'
import { logger } from '../../infra/logger.js'
import { badRequest, serverError } from '../../utils/errors.js'

export const billingModule = new Elysia({ prefix: '/billing' })
  // Stripe webhook endpoint — NO auth (Stripe calls this directly)
  // No body schema defined so Elysia doesn't auto-parse — request.text() works
  .post('/webhook', async ({ request, set }) => {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return badRequest(set, 'Missing signature')
    }

    try {
      const rawBody = await request.text()
      await handleWebhook(rawBody, signature)
      return { received: true }
    } catch (err) {
      logger.error('Webhook error', { error: (err as Error).message })
      return serverError(set, 'Webhook processing failed')
    }
  })

  // Authenticated endpoints

  // Create checkout session
  .post('/checkout', async ({ workspaceId, body, set }) => {
    const data = body as Record<string, string>
    try {
      const session = await createCheckoutSession(
        workspaceId!,
        data.email,
        (data.tier ?? 'starter') as any,
        (data.period ?? 'monthly') as any,
      )
      return session
    } catch (err) {
      logger.error('Checkout error', { error: (err as Error).message })
      return serverError(set, 'Failed to create checkout session')
    }
  }, {
    body: t.Object({
      tier: t.String(),
      period: t.Optional(t.String()),
      email: t.String(),
    }),
  })

  // Create portal session
  .post('/portal', async ({ workspaceId, set }) => {
    try {
      return await createPortalSession(workspaceId!)
    } catch (err) {
      logger.error('Portal error', { error: (err as Error).message })
      return serverError(set, 'Failed to create portal session')
    }
  })

  // Get current subscription
  .get('/subscription', async ({ workspaceId, set }) => {
    try {
      return await getSubscription(workspaceId!)
    } catch (err) {
      logger.error('Subscription error', { error: (err as Error).message })
      return serverError(set, 'Failed to get subscription')
    }
  })
