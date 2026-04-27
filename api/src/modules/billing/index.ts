import { Elysia, t } from 'elysia'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import { createCheckoutSession, createPortalSession, getSubscription } from './checkout.js'
import { handleWebhook } from './webhooks.js'
import { logger } from '../../infra/logger.js'

export const billingModule = new Elysia({ prefix: '/billing' })
  .use(authPlugin)
  .use(workspaceContext)

  // Stripe webhook endpoint (no auth — Stripe calls this)
  .post('/webhook', async ({ request, body }) => {
    const signature = request.headers.get('stripe-signature')
    if (!signature) return { error: 'Missing signature' }

    try {
      // Elysia parses JSON by default; for webhooks we need raw body
      // In production, use a separate endpoint with raw body parsing
      await handleWebhook(JSON.stringify(body), signature)
      return { received: true }
    } catch (err) {
      logger.error('Webhook error', { error: (err as Error).message })
      return { error: 'Webhook processing failed' }
    }
  })

  // Authenticated endpoints
  .requireAuth(true)
  .requireWorkspace(true)

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
