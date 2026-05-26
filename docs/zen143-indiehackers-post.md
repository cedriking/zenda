# ZEN-143: IndieHackers Shipping Post

**Platform:** indiehackers.com
**Format:** Shipping post (product launch story)
**Tone:** Technical founder, transparent, lessons learned
**CTA:** zenda.bot/founding

---

## Post

**Title:** Shipped: Zenda — an AI WhatsApp receptionist for LATAM appointment businesses

**Body:**

```
Hey IH community! Just shipped something and wanted to share the journey.

## What it is
Zenda is an AI receptionist that lives inside WhatsApp. It answers client messages, books appointments, sends reminders, and understands voice notes — built specifically for appointment businesses in Latin America (salons, barbershops, spas, dental clinics).

## The "aha" moment
I was talking to a salon owner in Mexico City who told me she loses 5-8 appointments DAILY because she can't answer WhatsApp while doing a client's hair. That's when it clicked — WhatsApp is the operating system for LATAM businesses, but nobody's building proper tools for it.

## Tech stack
- **Desktop app:** Electron (needs to run alongside WhatsApp Web)
- **AI:** Claude API for natural conversation, with business-context grounding
- **Voice notes:** Whisper for transcription, then Claude for understanding
- **Scheduling:** Custom calendar system that syncs with business hours
- **Multi-language:** 10+ languages, but optimized for Spanish voice notes
- **Payments:** Stripe for subscriptions
- **Frontend:** Next.js landing page + pricing

## What I learned selling to LATAM SMBs

**1. WhatsApp is everything**
These businesses don't use email. They don't check websites. 90%+ of bookings come through WhatsApp. If you're building for LATAM SMBs, you HAVE to be inside WhatsApp.

**2. Voice notes are non-negotiable**
In Mexico, ~70% of business WhatsApp messages are voice notes. Not text. If your AI can't understand audio, you've built a product nobody will use here.

**3. Trust > Features**
SMBs don't care about your AI architecture. They care that it won't say something weird to their clients. We had to build extensive guardrails and make the AI sound natural in Mexican Spanish (not generic "translator Spanish").

**4. Onboarding must be < 5 minutes**
Our users are not technical. If setup requires more than: download app → scan QR code → done, you lose them. We spent more time on onboarding UX than on the AI itself.

**5. Price sensitivity is real but manageable**
At $29/month (~$500 MXN), it's a real decision for a salon making $2K-5K/month. But when we frame it as "one recovered appointment pays for the whole month," it clicks. We offer 14-day free trials with no credit card.

## Numbers so far
- Launched: May 2026
- Markets: Mexico (CDMX, Guadalajara, Monterrey, Mérida, Cancún)
- Cold outreach: 90+ prospects via email and WhatsApp
- Active users: In onboarding (founding customers)
- Pricing: $29/mo Solo, $49/mo Starter, $89/mo Pro, $149/mo Business
- Founding offer: 14 days free + 50% off first 3 months

## What's next
- Expanding to Colombia and Brazil
- Building analytics dashboard (which messages converted to bookings, revenue recovered, etc.)
- Adding payment collection inside WhatsApp (Stripe integration)

## Ask
If you know anyone running an appointment business in LATAM, I'd appreciate an intro. Or if you've built for SMBs in emerging markets, I'd love to swap notes.

Try it free: https://zenda.bot/founding

Thanks for reading! Happy to answer questions about the tech, the market, or the go-to-market.
```

---

## Posting Instructions

1. Go to indiehackers.com
2. Click "New Post" → select "Shipping" as the format
3. Paste title and body
4. Add tags: `#shipping`, `#saaS`, `#latam`, `#whatsapp`, `#ai`
5. Post during 9-11am EST Tuesday-Thursday for best visibility
6. Respond to every comment within 4 hours
7. Cross-share on Twitter/X: "Just shipped on @IndieHackers — [link]"
