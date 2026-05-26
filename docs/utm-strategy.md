# UTM Parameter Strategy — Zenda

**Owner:** CMO
**Date:** May 2026
**Related:** ZEN-144, ZEN-145, ZEN-147

---

## 1. UTM Naming Convention

### Standard format

All lowercase, hyphen-separated, no spaces, no special characters.

| Parameter | Format | Example |
|-----------|--------|---------|
| `utm_source` | Platform name | `google`, `facebook`, `linkedin`, `partner`, `email` |
| `utm_medium` | Marketing medium | `cpc`, `social`, `email`, `referral`, `organic` |
| `utm_campaign` | `{product}-{channel}-{type}-{version}` | `zenda-latam-search-v1`, `zenda-partner-launch-v1` |
| `utm_content` | Specific creative/placement | `zenda-dental-h1d1`, `partner-whatsapp-msg-1` |
| `utm_term` | Keyword or targeting (auto for ads) | `recepcionista virtual dental` |

### utm_content naming convention

Format: `{adgroup-or-segment}-{creative-identifier}`

| Component | Format | Example |
|-----------|--------|---------|
| Ad group | Ad group slug | `zenda-dental`, `zenda-belleza`, `zenda-general-citas` |
| Creative ID | `h{N}d{N}` (headline N, description N) | `h1d1`, `h2d1`, `h3d2` |
| Sitelink | `sitelink-{description}` | `sitelink-trial`, `sitelink-pricing` |
| Partner | `partner-{partner_id}` | `partner-abc123` |
| Email | `email-{sequence}-{step}` | `email-nurture-1`, `email-followup-3` |
| Social | `social-{platform}-{post_type}` | `social-fb-benefit`, `social-li-case-study` |

---

## 2. Channel-Specific UTM Templates

### Google Ads (Search)

Set at campaign level using Final URL template:

```
https://zenda.bot/founding?utm_source=google&utm_medium=cpc&utm_campaign=zenda-latam-search-v1&utm_content={creative}&utm_term={keyword}&matchtype={matchtype}&adpos={adposition}
```

ValueTrack parameters used:
- `{creative}` — auto-fills with Google's creative ID
- `{keyword}` — auto-fills with the matched keyword
- `{matchtype}` — `e` (exact), `p` (phrase), or `b` (broad)
- `{adposition}` — e.g. `1t1` (top position 1)

**Custom parameter at ad group level (recommended):**

| Ad group | Custom parameter `{adgroup_slug}` |
|----------|-----------------------------------|
| zenda-dental | `dental` |
| zenda-belleza | `belleza` |
| zenda-general-citas | `general` |

Alternative (simpler) Final URL template using custom parameters:

```
https://zenda.bot/founding?utm_source=google&utm_medium=cpc&utm_campaign=zenda-latam-search-v1&utm_content={adgroup_slug}-{creative}&utm_term={keyword}
```

### Facebook Ads

```
https://zenda.bot/founding?utm_source=facebook&utm_medium=cpc&utm_campaign=zenda-latam-facebook-v1&utm_content={ad-set-name}-{ad-name}
```

### LinkedIn Ads

```
https://zenda.bot/founding?utm_source=linkedin&utm_medium=cpc&utm_campaign=zenda-latam-linkedin-v1&utm_content={creative-name}
```

### Partner Referrals

```
https://zenda.bot/founding?utm_source=partner&utm_medium=referral&utm_campaign=zenda-partner-program&utm_content=partner-{PARTNER_ID}&partner_ref={PARTNER_ID}
```

The `partner_ref` parameter is the primary attribution mechanism (read by the signup form). UTM parameters are for analytics only.

### Email Campaigns

```
https://zenda.bot/founding?utm_source=email&utm_medium=email&utm_campaign=zenda-latam-cold-v1&utm_content=email-{sequence}-{step}
```

### Social Organic Posts

```
https://zenda.bot/founding?utm_source={platform}&utm_medium=social&utm_campaign=zenda-latam-organic-v1&utm_content=social-{platform}-{post_type}
```

---

## 3. Conversion Tracking Architecture

### How to attribute which ad group/keyword drove each conversion

**Primary method: Google Ads ValueTrack + GA4**

1. Google Ads passes `{keyword}`, `{matchtype}`, `{creative}`, and `{adposition}` in the URL
2. GA4 captures these as page-level parameters on landing
3. When a user signs up, the GA4 event includes the UTM parameters from the session
4. Google Ads conversion action links the click to the conversion via GCLID (Google Click ID)

**Secondary method: First-party tracking**

- Store UTM parameters in a cookie/localStorage on landing page visit
- On form submission, include UTM params in the signup payload
- This ensures attribution even if GA4 has sampling or consent issues

**Partner attribution:**

- `partner_ref` parameter stored in cookie/localStorage on landing
- Passed to signup form as hidden field
- Server-side: associate the signup with the partner's account
- 30-day cookie window for partner attribution

### Attribution model

- **Google Ads:** Use Google's data-driven attribution (default). Google optimizes bids based on this.
- **Cross-channel:** GA4 uses last-click by default. Acceptable for now given limited channels.
- **Partner:** First-party `partner_ref` wins. If a user clicks a partner link but later converts via Google Ads, the partner still gets credit (separate tracking system).

---

## 4. Dashboard & Reporting

### Key metrics to track (weekly)

| Metric | Source | Target |
|--------|--------|--------|
| Impressions | Google Ads | Monitor |
| Clicks | Google Ads | Monitor |
| CTR | Calculated | > 3% |
| CPC | Google Ads | < $1.00 |
| Conversions (signups) | GA4 + Google Ads | Monitor |
| CPA | Calculated | < $15 |
| Conversion rate | Calculated | > 3% |
| Revenue per conversion | Stripe | > $49 (Starter plan) |

### Report structure (weekly)

1. **Spend:** Total spend, spend by ad group, spend by country
2. **Performance:** CTR, CPC, conversion rate by ad group
3. **Top keywords:** Best performing by conversion volume and CPA
4. **Negative keyword additions:** New negatives added based on search term reports
5. **Partner referrals:** Clicks and conversions from partner links
6. **Recommendations:** Budget changes, pause/resume, new keywords

---

## 5. Naming Convention Quick Reference

### Campaign naming pattern

```
{brand}-{geo}-{channel}-{type}-{version}
```

| Component | Values |
|-----------|--------|
| brand | `zenda` |
| geo | `latam`, `mx`, `co`, `ar` |
| channel | `search`, `display`, `facebook`, `linkedin`, `email`, `partner` |
| type | `acquisition`, `retargeting`, `launch`, `promo` |
| version | `v1`, `v2`, etc. |

### Examples

- `zenda-latam-search-acquisition-v1`
- `zenda-mx-facebook-retargeting-v1`
- `zenda-latam-email-nurture-v1`
- `zenda-latam-partner-acquisition-v1`

### Versioning rules

- New version when: significant keyword changes, new ad copy, targeting changes
- Same version for: bid adjustments, budget changes, negative keyword additions
- Document version changes in the campaign log
