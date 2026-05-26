# ZEN-121: Zenda Startup Feedback Loop Review

**Date:** 26 May 2026  
**Author:** CEO Agent (f3e40e21)  
**Company:** Zenda — AI WhatsApp Receptionist for LATAM

---

## Executive Summary

Zenda has operated for ~3 weeks with a 3-agent team (CEO, CMO, CTO). The company has shipped a working product (web, API, Stripe billing, Electron app), deployed SEO landing pages, and attempted outbound outreach via cold email and WhatsApp. **Zero paying customers acquired.** The gap is not product — it's distribution velocity and email verification infrastructure.

---

## Inner Loop: Making Existing Work Better

### 1. What Agents Did

**CEO (f3e40e21):**
- 127 issues created, 114 done (90% completion rate)
- Built Stripe billing (4 products, 8 prices, webhook, founding coupon)
- Created SEO landing pages (recepcionista-virtual-whatsapp, automatizar-citas-whatsapp)
- Built referral page, founding page, outreach dashboard
- Executed cold email campaign: 34 emails sent, 3 verified prospects reached, 0 replies
- Added founding badge to signup page for conversion optimization
- Created hiring ads (Workana, Upwork), PH launch kit, directory submissions, GBP guide

**CTO (23e31d25):**
- Fixed website crashes (ENVIRONMENT_FALLBACK error, middleware issues)
- Refactored checkout flow (client/server split, Suspense boundary)
- Currently building email verification script (ZEN-124) and agent health monitoring (ZEN-126)
- Improved API client (deduplicated refresh, error handling)

**CMO (b87eea18):**
- Assigned 5 issues (ZEN-115, 117-120)
- ZEN-117/118 blocked (Facebook/LinkedIn need manual execution, Kapso doesn't support them)
- Limited execution observed — no comments posted on ZEN-115 (cold email)

### 2. Where Humans Overrode Agents

- **Board rejected 6+ WhatsApp outreach requests:** Board didn't want to do manual WhatsApp outreach despite it being the primary acquisition channel. This forced a pivot to cold email.
- **Board cancelled ZEN-120 interaction:** Board cancelled the Hunter.io vs Workana question without answering.
- **Board provided AgentMail:** Board created an email API account and directed agents to use cold email instead of WhatsApp.
- **Board ignored multiple interactions:** At least 3 pending Board interactions across ZEN-114, ZEN-120 remain unanswered for multiple heartbeats.

### 3. Which Evals Failed

| Eval | Result | Root Cause |
|------|--------|------------|
| Cold email delivery | **75% bounce rate** | Guessed emails (contacto@, info@) don't work. Need verification. |
| Cold email reply rate | **0%** (3 verified prospects) | Too few prospects. Need volume (50+). |
| Customer acquisition | **0 paying customers** | Distribution gap: product works, nobody knows about it. |
| Board interaction response | **Low** | Multiple pending interactions unanswered. Board is busy or questions aren't framed correctly. |
| CMO execution | **Minimal** | CMO has 5 issues but limited visible output. May need better task scoping or different tools. |

### 4. Which Context Was Missing

- **Prospect email verification:** No way to verify emails before sending. CTO now building this (ZEN-124).
- **Agent health visibility:** Backend engineer was in error state with no alerts. CTO building monitoring (ZEN-126).
- **Board decision latency:** No escalation path when Board doesn't respond to interactions for 5+ heartbeats.
- **LATAM market data:** No verified data on which businesses have WhatsApp + email + appointment-based models.
- **Conversion analytics:** No tracking of cold email → signup → checkout → payment funnel.

### 5. Which Skills Need Narrowing

- **CMO outreach skills:** Facebook Groups and LinkedIn are assigned to CMO but blocked — Kapso doesn't support these channels. Should reassign to Board/human or remove.
- **Cold email guessing:** Stop generating inferred emails. Only use verified emails (ZEN-124 fixes this).
- **Board interaction framing:** Interactions should have fewer options and clearer urgency signals.

### 6. Which Workflows to Kill

| Workflow | Reason |
|----------|--------|
| Guessed email outreach | 75-100% bounce rate. Waste of AgentMail quota and sender reputation. |
| WhatsApp outreach via agents | Board owns this manually. Agents can't execute. |
| Facebook/LinkedIn via Kapso | Kapso doesn't support these. Blocked indefinitely. |
| Freelancer platform posting | Needs manual account creation. No agent can do this. |

### 7. Which to Move Up an Autonomy Level

| Workflow | Current Level | Proposed Level |
|----------|---------------|----------------|
| Email verification | Manual (none) | **Automated** — CTO building script (ZEN-124) |
| Prospect sourcing | Agent guesses | **Tool-assisted** — verify before sending |
| SEO page creation | Agent creates, pushes | **Autonomous** — already works well |
| Billing/checkout | Agent built | **Autonomous** — running, Stripe healthy |
| Cold email sending | Agent sends manually | **Semi-auto** — verify then auto-send |

---

## Outer Loop: What's Next

### New Customer Segments to Explore

1. **Dental clinics** — High-value, appointment-based, active WhatsApp users in LATAM. Already have `/dental` vertical page.
2. **Fitness/personal training** — Recurring appointments, high WhatsApp usage, willing to pay for automation.
3. **Pet grooming** — Growing LATAM market, appointment-based, WhatsApp-native.
4. **Real estate agencies** — Property showing scheduling via WhatsApp.

### Product Ideas

- **Free WhatsApp chatbot builder** — Lead magnet: let businesses try the AI before paying
- **Google Calendar sync** — Most requested feature for appointment businesses
- **Multi-location support** — Silvia Galvan has 5 locations; this is a selling point

### Pricing Changes

- **Free tier** — Current pricing starts at $29/mo. A free tier (limited messages) could drive signups.
- **Annual discount** — No annual pricing visible on site despite Stripe prices being set up.
- **Per-appointment pricing** — Instead of flat monthly, charge per appointment booked (aligns with value).

### Partnership Opportunities

- **Google Business Profile integration** — Auto-respond to GBP messages via WhatsApp
- **Meta Business Suite** — WhatsApp Business API integration
- **Practice management software** — Dental/medical scheduling tools

### Competitor Moves

- **Main competitors:** Calendly (not WhatsApp-native), Twilio (too technical), ManyChat (marketing, not scheduling)
- **Gap:** No competitor does WhatsApp-native appointment scheduling with AI in LATAM. This is our moat.

### Churn Risk

- **No customers yet** = no churn. But once we get customers, key risks:
  - AI response quality (wrong booking times, misunderstood requests)
  - WhatsApp number blocking (Meta spam policies)
  - Price sensitivity in LATAM market ($29/mo is significant for small salons)

### Regulatory Shifts

- **WhatsApp Business API terms** — Meta could restrict automated messaging
- **LATAM data privacy** — Mexico's Ley Federal de Protección de Datos Personales
- **AI regulation** — Upcoming LATAM AI governance frameworks

---

## Recommendations (Priority Order)

1. **CRITICAL: Get verified emails** — CTO's ZEN-124 is the highest priority. Without this, cold email is dead.
2. **Create free tier** — Lower barrier to entry. Let businesses try Zenda with 50 free messages/mo.
3. **Annual pricing** — Already set up in Stripe, just needs to be exposed on the pricing page.
4. **Google Calendar integration** — Highest-requested feature for appointment businesses.
5. **Kill blocked workflows** — Close ZEN-117/118, reassign or remove.
6. **Agent health monitoring** — CTO's ZEN-126. Prevent silent failures.
7. **Board interaction SLA** — Establish 3-heartbeat response time for interactions.

---

## Metrics Dashboard

| Metric | Current | Target (30 days) |
|--------|---------|------------------|
| Paying customers | 0 | 10 |
| Verified prospect emails | 3 | 50 |
| Cold emails delivered | 3 | 100 |
| Website visitors/day | Unknown | 500 |
| Signup conversion rate | Unknown | 5% |
| SEO pages ranking | 0 (new) | 3 in top 10 |
| Agent issues completed | 114 | 150 |
| Board interaction response time | 5+ heartbeats | <3 heartbeats |
