# Stripe Live Mode Activation Runbook

**Prerequisite:** Stripe account at https://dashboard.stripe.com
**Time required:** 15 minutes
**Goal:** Enable real payments on zenda.bot

---

## Step 1: Activate Stripe Account (2 min)

1. Go to https://dashboard.stripe.com/account/onboarding
2. Complete the business verification (business name, address, bank account)
3. Wait for activation email (usually instant for US/International)

## Step 2: Create Products & Prices (5 min)

From the zenda project root, run:

```bash
STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE bun run scripts/stripe-setup.ts
```

This script will:
- Create 4 products: Zenda Solo, Starter, Pro, Business
- Create monthly prices: $29, $49, $89, $149 USD
- Print the env vars you need to set

**Note:** As of commit `16cbf38`, the API automatically discovers price IDs from
Stripe at startup. The `STRIPE_PRICE_*` env vars are now optional — the code
will find or create the correct prices in Stripe and use them automatically.
You can still set them explicitly to override the auto-discovered values.

## Step 3: Register Webhook Endpoint (3 min)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://api.zenda.bot/billing/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Click on the new endpoint → "Signing secret" → "Reveal"
7. Copy the `whsec_...` value

## Step 4: Update Coolify Environment Variables (3 min)

Go to your Coolify instance and update these env vars for the **API** service:

```
STRIPE_SECRET_KEY=sk_live_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX
```

**Optional** — price ID env vars (auto-discovered from Stripe at startup):
```
STRIPE_PRICE_LOCAL_SOLO_MONTHLY=price_XXXXXXXX
STRIPE_PRICE_LOCAL_STARTER_MONTHLY=price_XXXXXXXX
STRIPE_PRICE_LOCAL_PRO_MONTHLY=price_XXXXXXXX
STRIPE_PRICE_LOCAL_BUSINESS_MONTHLY=price_XXXXXXXX
```

For the **Web** service:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXXXXXXXXXX
```

## Step 5: Rebuild Web Container (2 min)

The `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is a build-time variable for Next.js.
You must rebuild the web container for it to take effect:

```bash
# In Coolify: trigger a redeploy of the web service
# Or via docker compose:
docker compose -f docker-compose.prod.yml up -d --build web
```

## Step 6: Verify (1 min)

After the services restart, test the billing:

1. Go to https://zenda.bot/es/signup — create a test account
2. Go to https://zenda.bot/es/pricing — click a plan
3. You should see a Stripe Checkout page (not an error)

## Troubleshooting

**"Failed to create checkout session"**
- Verify `STRIPE_SECRET_KEY` starts with `sk_live_`
- Verify the API container was rebuilt after the latest commit (price IDs are auto-discovered)
- Check API logs in Coolify — should show "Created Stripe product/price" or "Synced price" messages

**"Invalid request: invalid_price"**
- The price IDs in env vars don't match what's in Stripe
- Re-run the stripe-setup script to get correct IDs

**Stripe Checkout shows but returns to error page**
- Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint signing secret
- Verify `APP_URL=https://zenda.bot` is set in API env vars
- Check webhook logs at https://dashboard.stripe.com/webhooks
