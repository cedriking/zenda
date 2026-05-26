# Zenda Acquisition Strategy — May 2026

## Current State
- **Product:** Live at zenda.bot, fully functional WhatsApp AI receptionist
- **Pricing:** Free tier ($0/25 contacts) + 4 paid plans ($29-$149/mo)
- **Pages:** 7 SEO pages, founding page, pricing, referral, partner (pending deploy)
- **Email campaign:** EXHAUSTED — 89+ emails, 33 prospects, 3 cadences, 0 replies
- **Customers:** 0 paying, 0 free signups

## Channel Analysis

### Exhausted Channels
| Channel | Effort | Result | Verdict |
|---------|--------|--------|---------|
| Cold email | 89+ emails, 3 cadences | 0 replies | DEAD — LATAM SMBs don't respond to cold email |
| Inferred email addresses | 9 emails | 100% bounce | DEAD — can't guess emails accurately |
| Email outreach volume | 33 verified prospects | 47% bounce even on verified | LOW QUALITY |

### Ready to Launch (blocked by Coolify deploy)
| Channel | Status | Blocker |
|---------|--------|---------|
| Google Ads | Campaign structured, GA tracking coded | Coolify down (ZEN-145) |
| Partner program | /partners page coded, 20% commission model | Coolify down (ZEN-145) |
| /demo page (WhatsApp chat sim) | Coded on founding page | Coolify down (ZEN-145) |

### Ready to Execute (no deploy needed)
| Channel | Action Needed | Expected ROI |
|---------|---------------|-------------|
| Reddit posts | Manual login required | Medium — r/Entrepreneur, r/smallbusiness |
| IndieHackers post | Manual login required | Medium — indie hacker community |
| Product Hunt launch | Setup upcoming page | High — PH traffic is qualified |
| Workana listing | Create service listing | Medium — LATAM freelancers |
| Upwork listing | Create service listing | Medium — global freelancers |
| WhatsApp direct outreach | Find numbers, message manually | HIGH — dogfooding our product |

### Future Channels (require investment)
| Channel | Cost | Expected Timeline |
|---------|------|-------------------|
| Google Ads | $150-300/month | 7 days after Coolify fix |
| Facebook/Instagram Ads | $150-300/month | 14 days |
| YouTube ads | $300+/month | 30 days |
| Conference/event sponsorship | $500+ | 60 days |

## Priority Actions (Next 7 Days)

### 1. Fix Coolify (CRITICAL — ZEN-145)
Everything else depends on this. CTO needs to:
- Check Coolify dashboard for failed builds
- Trigger manual redeploy
- Verify GitHub webhook is active

### 2. Google Ads Launch (ZEN-144)
Once Coolify is fixed:
- Set NEXT_PUBLIC_GA_MEASUREMENT_ID env var
- Create Google Ads account
- Launch with $5/day budget
- Target: Mexico, Colombia, Argentina
- See docs/google-ads-campaign.md for full structure

### 3. Community Marketing (ZEN-143)
Manual posts needed (no API access):
- Reddit: r/Entrepreneur, r/smallbusiness, r/mexico
- IndieHackers: Shipping post
- Product Hunt: Coming soon page
- See docs/community-posts.md for templates

### 4. Partner Recruitment
Target partners:
- Freelance web developers in LATAM
- Social media managers in MX/CO/AR
- Business consultants
- WhatsApp Business solution providers
- Offer 20% recurring commission
- See /partners page (once deployed)

## Revenue Model

| Plan | Monthly | Annual (20% off) | Target |
|------|---------|------------------|--------|
| Free | $0 | $0 | Lead gen |
| Solo | $29 | $23/mo | Individual professional |
| Starter | $49 | $39/mo | Small business |
| Pro | $89 | $71/mo | Growing business |
| Business | $149 | $119/mo | Multi-location |

### Break-even Analysis
- Google Ads CPA estimate: $20-50/signup
- Average plan value: $49/mo
- Break-even: 1-2 months per customer
- Target: 10 customers = $490/mo MRR

## Founding Offer
- Coupon: `aRgf7NZC`
- 50% off all plans for founding members
- Promoted on /founding page
- Valid until 100 signups or 90 days
