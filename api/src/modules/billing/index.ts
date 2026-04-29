import { Elysia, t } from 'elysia'
import { createCheckoutSession, createPortalSession, getSubscription } from './checkout.js'
import { handleWebhook } from './webhooks.js'
import { logger } from '../../infra/logger.js'

export const billingModule = new Elysia({ prefix: '/billing' })
  // Stripe webhook endpoint — NO auth (Stripe calls this directly)
  // Must be registered before appPlugin guards take effect on other routes
  .post('/webhook', async ({ request }) => {
    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return { error: 'Missing signature' }
    }

    try {
      // Read raw body for Stripe signature verification
      const rawBody = await request.text()
      await handleWebhook(rawBody, signature)
      return { received: true }
    } catch (err) {
      logger.error('Webhook error', { error: (err as Error).message })
      return { error: 'Webhook processing failed' }
    }
  }, {
    config: {
      // Skip body parsing so we get raw text
    },
  })

  // Authenticated endpoints

  // Create checkout session
  .post('/checkout', async ({ workspaceId, body }) => {
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
      return { error: 'Failed to create checkout session' }
    }
  }, {
    body: t.Object({
      tier: t.String(),
      period: t.Optional(t.String()),
      email: t.String(),
    }),
  })

  // Create portal session
  .post('/portal', async ({ workspaceId }) => {
    try {
      return await createPortalSession(workspaceId!)
    } catch (err) {
      return { error: 'Failed to create portal session' }
    }
  })

  // Get current subscription
  .get('/subscription', async ({ workspaceId }) => {
    return await getSubscription(workspaceId!)
  })
