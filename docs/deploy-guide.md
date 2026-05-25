# Deployment Guide — Zenda Production

**Last updated:** 2026-05-25 (CTO final status)
**Applies to:** Coolify deployment on VPS

## Deployment Status

| Item | Status | Verified |
|------|--------|----------|
| Founding page (/founding) | DEPLOYED | 200 OK (both /en and /es) |
| Stripe checkout (live mode) | WORKING | cs_live_ sessions confirmed |
| Founding checkout (trial + discount) | WORKING | founding=true creates trial sessions |
| Signup source tracking | WORKING | source=founding logged by API |
| Billing plans (4 tiers) | WORKING | Solo $29, Starter $49, Pro $89, Business $149 |
| All web pages (signup, login, pricing) | WORKING | All 200 OK |
| Download routes | BROKEN | GITHUB_TOKEN not set in web container |
| Founding coupon | PENDING | Need to run scripts/create-founding-coupon.ts |

## Remaining Steps (5 minutes)

### 1. Add GITHUB_TOKEN to Web service (2 min)
In Coolify → Web service → Environment:
```
GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXX
```
(Generate at GitHub Settings → Developer Settings → Personal Access Tokens → repo scope)
Then redeploy the web container.

### 2. Create founding coupon + set env var (3 min)
On any machine with the Stripe live secret key:
```bash
cd /home/zeus/projects/zenda
STRIPE_SECRET_KEY=sk_live_... bun run scripts/create-founding-coupon.ts
# Copy the output coupon ID
```
Then in Coolify → API service → Environment:
```
STRIPE_FOUNDING_COUPON_ID=<coupon_id_from_script>
```
Then redeploy the API container.

## Verification

```bash
# Downloads (after GITHUB_TOKEN set + rebuild)
curl -s -o /dev/null -w "%{http_code}" https://zenda.bot/api/download/macos
# Should return: 302 (redirect to GitHub asset)

# Founding coupon (after coupon created)
# Sign up, then try founding checkout — should see 14-day trial + 50% off in Stripe
```

## After All Steps Complete

Begin customer outreach:
1. Use templates in `docs/founding-customer-outreach.md`
2. Track pipeline in `docs/founding-customer-pipeline.md`
3. Share founding page link: `https://zenda.bot/founding`
4. Track UTM: source=whatsapp, campaign=founding_100
