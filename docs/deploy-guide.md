# Deployment Guide — Zenda Production

**Last updated:** 2026-05-25
**Applies to:** Coolify deployment on VPS

## What Needs Deploying

Multiple commits have accumulated that need a container rebuild:

| Commit | What it fixes | Impact |
|--------|--------------|--------|
| fa91347 | Founding page 500 — serialize translations | /founding page works |
| fe35b3a | Founding page locale — was hardcoded to "es" | English founding page works |
| d9911cd | Signup source tracking | API logs founding signups |
| 4f4a816 | Runbook: GITHUB_TOKEN required | Docs updated |
| 16cbf38 | Stripe price ID auto-discovery | Checkout works without price env vars |
| 33dee1b | Founding checkout: trial + discount | 14-day trial + 50% off works |
| a54f4cf | Download: private repo asset resolution | Desktop downloads work with token |

## Step-by-Step Deployment (10 minutes)

### 1. Add GITHUB_TOKEN to Web service (2 min)
In Coolify → Web service → Environment:
```
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXX
```
(Generate at GitHub Settings → Developer Settings → Personal Access Tokens → repo scope)

### 2. Add STRIPE_FOUNDING_COUPON_ID to API service (2 min)
In Coolify → API service → Environment:
```
STRIPE_FOUNDING_COUPON_ID=<from running scripts/create-founding-coupon.ts>
```

### 3. Rebuild BOTH containers (3 min)
In Coolify:
1. API service → Deploy → Redeploy (pulls latest commit, restarts)
2. Web service → Deploy → Redeploy (rebuilds with new NEXT_PUBLIC_* + GITHUB_TOKEN)

### 4. Verify (3 min)
```bash
# API health
curl https://api.zenda.bot/health
# Should return: {"status":"ok","stripe":true,...}

# Founding page
curl -s -o /dev/null -w "%{http_code}" https://zenda.bot/es/founding
# Should return: 200

# Downloads
curl -s -o /dev/null -w "%{http_code}" https://zenda.bot/api/download/macos
# Should return: 302 (redirect to GitHub asset)

# Checkout
curl -s https://api.zenda.bot/billing/checkout -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"tier":"local_solo","email":"test@test.com","founding":"true"}'
# Should return: {"url":"https://checkout.stripe.com/c/pay/cs_live_..."}
```

## After Deployment

Once verified, begin customer outreach:
1. Use templates in `docs/founding-customer-outreach.md`
2. Track pipeline in `docs/founding-customer-pipeline.md`
3. Share founding page link: `https://zenda.bot/founding`
