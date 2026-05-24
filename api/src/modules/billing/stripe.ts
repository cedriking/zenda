import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.warn('[stripe] STRIPE_SECRET_KEY not set — billing features disabled')
}

export const stripe = key ? new Stripe(key) : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!webhookSecret) {
  console.warn('[stripe] STRIPE_WEBHOOK_SECRET not set — webhook verification will fail')
}

export const STRIPE_WEBHOOK_SECRET = webhookSecret ?? ''
