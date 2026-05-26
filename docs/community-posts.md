# ZEN-143: Community Posts — Ready to Publish

## Reddit: r/Entrepreneur

**Title:** I built an AI receptionist that runs on WhatsApp and books appointments automatically. After 65+ cold emails with 0 replies, here's what I learned selling to LATAM SMBs.

**Body:**
Hey everyone,

I'm building Zenda — an AI receptionist that lives inside WhatsApp and handles appointment booking for small businesses (dentists, salons, barber shops, spas).

The idea came from watching my cousin's dental clinic in Mexico City. She spent 3+ hours/day on WhatsApp scheduling, rescheduling, and confirming appointments. I thought: what if a bot could do this?

So we built it. Here's what it does:
- Client texts the business WhatsApp number
- AI responds, checks availability, proposes time slots
- Client picks a time → appointment confirmed
- Automatic reminders sent 2 hours before
- Handles cancellations, rescheduling, price inquiries

**The hard part isn't the tech — it's selling to LATAM SMBs.**

What we've tried:
- 65+ cold emails → 0 replies (47% bounce rate on MX-verified emails)
- SEO landing pages in Spanish → some organic traffic but no signups yet
- Free tier ($0/mo, 25 contacts) → launched last week, no takers yet

What we're trying next:
- Direct WhatsApp outreach (dogfooding our own product)
- Reddit/community posting
- Freelancer platforms (offering setup as a service)

If you're building for SMBs in emerging markets, I'd love to hear what's worked for you. The email-to-SMB conversion channel seems completely broken in LATAM.

If you want to check it out: https://zenda.bot/founding (free tier available, no credit card)

Happy to answer questions about the tech stack (Next.js, Elysia, Bun, WhatsApp Business API) or the LATAM market.

---

## Reddit: r/smallbusiness

**Title:** Business owners who take appointments — how do you handle WhatsApp scheduling?

**Body:**
Curious how other appointment-based businesses handle the WhatsApp scheduling nightmare.

I ask because I built a tool (Zenda) that automates this — an AI reads incoming WhatsApp messages, checks your calendar, proposes available times, and books the appointment. All automatically.

But I'm realizing I might be solving a problem that doesn't feel urgent enough. Or maybe business owners don't mind spending hours on WhatsApp?

Would love to hear your experience:
1. How much time do you spend daily on appointment scheduling?
2. Have you tried any automation tools?
3. What's your biggest pain point with appointment management?

If you're curious about the tool: https://zenda.bot/founding (there's a free tier)

---

## Reddit: r/mexico (Spanish)

**Title:** Hice un asistente virtual por WhatsApp que agenda citas automáticamente para negocios

**Body:**
Hola r/mexico,

Soy desarrollador y construí Zenda, un asistente virtual que se conecta al WhatsApp Business de tu negocio y agenda citas automáticamente.

Funciona así:
1. Tu cliente te escribe por WhatsApp como siempre
2. La IA responde, revisa la disponibilidad y propone horarios
3. El cliente elige un horario → cita confirmada
4. Se envía un recordatorio 2 horas antes

Todo automático. No necesitas contratar a alguien para contestar WhatsApp.

Es gratis para hasta 25 contactos mensuales: https://zenda.bot/signup?coupon=aRgf7NZC

Ideal para:
- Clínicas dentales
- Salones de belleza / barberías
- Spas y clínicas estéticas
- Cualquier negocio que maneje citas

¿Alguien aquí tiene un negocio de citas? Me gustaría saber cuánto tiempo pasan contestando WhatsApp.

---

## IndieHackers: Shipping Post

**Title:** Shipped: Zenda — AI WhatsApp receptionist for appointment businesses (LATAM market)

**Body:**
Just shipped Zenda, an AI-powered WhatsApp receptionist for appointment-based businesses in Latin America.

**What it does:**
Automates the entire appointment booking flow on WhatsApp — from initial inquiry to confirmation and reminders.

**Why LATAM?**
- WhatsApp penetration in LATAM is 90%+ for business communication
- Small businesses in Mexico, Colombia, Argentina all run on WhatsApp
- No-show rate for appointments is 20-30% without reminders

**Tech stack:**
- Next.js 15 (web app + landing pages)
- Elysia + Bun (API)
- Drizzle ORM + PostgreSQL
- WhatsApp Business API (Kapso)
- Stripe (billing)

**Revenue: $0 after 2 months**

What we've tried:
- 65+ cold emails → 0 replies
- 7 SEO landing pages → organic traffic but no signups
- Free tier launched → no takers yet

Key learning: Cold email doesn't work for LATAM SMBs. These business owners live on WhatsApp, not email. We're pivoting to WhatsApp-first outreach.

**Next steps:**
- Direct WhatsApp outreach to prospects
- Reddit and community marketing
- Freelancer platform listings
- Product Hunt launch

If anyone has experience selling to SMBs in LATAM, I'd love to chat.

Check it out: https://zenda.bot

---

## Product Hunt: Upcoming Page

**Tagline:** The AI receptionist that lives inside your WhatsApp

**Description:**
Zenda is an AI-powered WhatsApp receptionist that handles appointment booking for your business automatically. Your clients text your WhatsApp as usual — Zenda responds, checks availability, proposes times, and confirms appointments. No app to install, no new number needed.

**Categories:** SaaS, Artificial Intelligence, Productivity

**Features:**
- AI-powered WhatsApp responses in Spanish, English, Portuguese
- Automatic appointment booking and confirmation
- Smart reminders to reduce no-shows by 40%
- Service catalog and pricing management
- Multi-staff scheduling
- Free tier: $0/month for up to 25 contacts
