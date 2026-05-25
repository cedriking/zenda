# Deployment Guide — Zenda Production

**Last updated:** 2026-05-25 (CTO — S3 download migration)
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
| Download fallback (email) | WORKING | mailto:hello@zenda.bot link shown |
| Download routes (S3) | PENDING | Needs R2 bucket + env vars |

## Setup: S3/R2 Downloads (replaces GitHub)

Desktop app downloads are now served from Cloudflare R2 (S3-compatible), not GitHub Releases. This keeps the repo private and provides a user-friendly download experience.

### Step 1: Create R2 bucket for downloads

In Cloudflare Dashboard → R2:
1. Create bucket named `zenda-downloads`
2. Enable public access (custom domain or r2.dev subdomain)
3. Note the public URL (e.g., `https://downloads.zenda.bot` or `https://pub-xxx.r2.dev`)

### Step 2: Set environment variables

**Coolify → Web service → Environment:**
```
S3_DOWNLOADS_ENDPOINT=https://xxx.r2.cloudflarestorage.com
S3_DOWNLOADS_ACCESS_KEY_ID=your_access_key
S3_DOWNLOADS_SECRET_ACCESS_KEY=your_secret_key
S3_DOWNLOADS_BUCKET=zenda-downloads
S3_DOWNLOADS_PUBLIC_URL=https://downloads.zenda.bot
```

Redeploy the web container.

### Step 3: Update GitHub Actions secrets

In GitHub repo → Settings → Secrets and variables → Actions, add:
```
S3_DOWNLOADS_ENDPOINT
S3_DOWNLOADS_ACCESS_KEY_ID
S3_DOWNLOADS_SECRET_ACCESS_KEY
S3_DOWNLOADS_BUCKET
```

### Step 4: Publish a release

Run the Publish workflow (GitHub Actions → Publish Desktop App → Run workflow).
This builds the DMG/EXE and uploads to R2.

### Step 5: Create latest.json manifest

After publishing, create `latest.json` in the R2 bucket root:
```json
{
  "version": "0.1.0",
  "platforms": {
    "macos": {
      "filename": "Zenda-0.1.0.dmg",
      "url": "https://downloads.zenda.bot/Zenda-0.1.0.dmg"
    },
    "windows": {
      "filename": "ZendaSetup-0.1.0.exe",
      "url": "https://downloads.zenda.bot/ZendaSetup-0.1.0.exe"
    }
  }
}
```

The download API routes read this manifest to redirect users to the correct file.

### Step 6 (Optional): Founding coupon

On any machine with the Stripe live secret key:
```bash
cd /home/zeus/projects/zenda
STRIPE_SECRET_KEY=sk_live_... bun run scripts/create-founding-coupon.ts
```
Then in Coolify → API service → Environment:
```
STRIPE_FOUNDING_COUPON_ID=<coupon_id_from_script>
```
Redeploy the API container.

## Verification

```bash
# Download routes (after S3 env vars set + rebuild)
curl -sI https://zenda.bot/api/download/macos | grep Location
# Should redirect to R2 URL

# Founding coupon (after coupon created)
# Sign up, then try founding checkout — should see 14-day trial + 50% off in Stripe
```

## After All Steps Complete

Begin customer outreach:
1. **START HERE:** `docs/day1-outreach-playbook.md` — copy-paste ready WhatsApp messages
2. Use templates in `docs/founding-customer-outreach.md`
3. Track pipeline in `docs/founding-customer-pipeline.md`
4. Share founding page link: `https://zenda.bot/founding`
5. Track UTM: source=whatsapp, campaign=founding_100
