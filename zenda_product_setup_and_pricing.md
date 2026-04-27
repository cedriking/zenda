# Zenda — Product Setup, Architecture, and Launch Pricing

**Version:** 0.1  
**Date:** April 27, 2026  
**Product:** Zenda — AI Receptionist for appointment-based businesses  
**Primary market:** LATAM, starting with Spanish + English  
**Company/payment context:** Wyoming LLC, Stripe subscriptions  

---

## 1. Executive summary

Zenda is an affordable, multilingual AI receptionist for appointment-based businesses. It connects to the business owner’s WhatsApp through a desktop app, answers customers automatically, books appointments, sends reminders, follows up, escalates uncertain cases to the owner, and keeps the business calendar organized.

Zenda should not be positioned as a chatbot, automation tool, or CRM first. The strongest positioning is:

> **Zenda gives your business a professional AI receptionist for WhatsApp.**

The product has three repos/apps:

```txt
/app  -> Electron desktop app: WhatsApp connector + operational dashboard
/api  -> Bun backend: AI agent, database, tools, queues, billing state, appointments
/web  -> Marketing website: landing, pricing, account creation, checkout, download
```

The business data must live in the backend. The desktop app is the local WhatsApp bridge and the daily command center.

---

## 2. Market research summary

### 2.1 Closest product categories researched

Zenda sits between three product categories:

1. **WhatsApp CRM / shared inbox platforms**  
   Examples: WATI, respond.io, Callbell, Trengo, Zoko, SleekFlow.

2. **AI receptionist / AI phone agent products**  
   Examples: Goodcall, Yelp Receptionist/Host, Smith.ai AI/human receptionist services.

3. **Scheduling and booking platforms**  
   Examples: Calendly, Acuity, Setmore, SimplyBook, etc. These are less direct because they do not act as the receptionist inside WhatsApp.

Zenda’s closest commercial position is:

> **WhatsApp-first AI receptionist for appointment businesses, priced below mid-market WhatsApp CRMs and below AI phone receptionist tools.**

### 2.2 Relevant competitor pricing observed

| Product | Category | Pricing signal observed | Notes |
|---|---:|---:|---|
| WATI | WhatsApp Business API platform | Growth around $59/month annually; Pro around $119/month; Business around $279/month | Includes users; additional WhatsApp/template/message charges apply. |
| respond.io | Omnichannel messaging + AI agents | Starter $79/month; Growth $159/month; Advanced $279/month | AI agents included on Growth+ with fair use; WhatsApp fees not included. |
| Callbell | Messaging inbox / WhatsApp CRM | $15/user/month; WhatsApp from about $54/month consumable credits | More of a shared inbox/messaging CRM. |
| Trengo | Customer service / omnichannel inbox | Boost around €299/month annually; Pro around €499/month annually | Heavier team/enterprise positioning. |
| Zoko | WhatsApp commerce platform | AI agent add-on around $24.99/month plus per-resolution pricing; workflows add-ons | Commerce-oriented, especially e-commerce/Shopify. |
| Goodcall | AI phone receptionist | Starter $79/month; Growth $129/month; Scale $249/month | Phone-first, not WhatsApp-first. |
| Smith.ai | Human virtual receptionist | Starter $300/month for 30 calls; Basic $810/month for 90 calls | Premium human receptionist comparison anchor. |
| Yelp Host / Receptionist | AI host/receptionist | Host from $149/month; Receptionist from $99/month | Local-business AI receptionist signal. |

### 2.3 Pricing conclusion

For LATAM, Zenda should not copy US AI receptionist pricing directly. A $79–$149 entry price can work in the US, but it is too high for early LATAM adoption unless the business already has strong appointment volume.

For a brand-new product with no customers, the best strategy is:

1. **Launch below direct global AI receptionist tools.**
2. **Stay above “cheap chatbot” pricing.**
3. **Use plan limits that map to business value, not AI credits.**
4. **Avoid credit-based pricing in public.**
5. **Protect margins internally with AI usage routing, monthly caps, and fair-use controls.**

---

## 3. Recommended launch pricing

### 3.1 Public pricing model

Use USD as the base pricing because the company is a Wyoming LLC and payments will run through Stripe. For LATAM, the website can display approximate local currency where useful, but Stripe subscription objects should be maintained cleanly in USD first.

Recommended public structure:

| Plan | Monthly | Annual equivalent | Best for |
|---|---:|---:|---|
| Starter | $29/month | $24/month paid yearly — $288/year | Solo professionals |
| Pro | $69/month | $59/month paid yearly — $708/year | Small teams |
| Business | $149/month | $119/month paid yearly — $1,428/year | Busier teams needing assisted setup |

This is low enough for LATAM adoption, but not so low that every heavy user becomes unprofitable.

### 3.2 Optional founding customer pricing

To get the first 50–100 customers, offer founding pricing only for annual or first-year commitments:

| Plan | Founding monthly | Founding annual equivalent | Condition |
|---|---:|---:|---|
| Starter Founding | $19/month | $190/year | First 100 customers or first 3 months |
| Pro Founding | $49/month | $490/year | First 100 customers or first 3 months |
| Business Founding | $99/month | $990/year | Assisted setup limited by capacity |

Recommendation: do **not** make founding prices permanent unless explicitly framed as “locked while subscription remains active.” Otherwise future pricing migrations become painful.

### 3.3 Why not cheaper?

Do not launch at $9–$15/month. That makes the product look like a small WhatsApp bot and creates support expectations from customers who are least likely to tolerate product limitations. Zenda is replacing receptionist work, not selling message templates.

### 3.4 Why not more expensive?

Do not launch Starter at $79/month in LATAM. That matches US AI receptionist pricing but creates too much friction before Zenda has case studies, reliability reputation, and visible proof.

---

## 4. Plan limits and features

Public limits should be based on customer-understandable value units:

- AI-handled conversations/month
- Appointments/month
- Staff members
- Voice note minutes/month
- Knowledge base size
- Log retention
- Assisted setup availability

Internally, Zenda should track:

- Text tokens
- Audio transcription minutes
- Tool calls
- Provider cost per workspace
- Messages received/sent
- Conversation count
- Appointment count
- Queue size
- Escalation count

### 4.1 Starter — Solo Receptionist

**Price:** $29/month or $288/year  
**Target:** Solo professionals: barbers, nail techs, coaches, therapists, independent wellness providers, small beauty services.

Includes:

- 1 WhatsApp connection
- 1 business owner login
- Solo-mode dashboard
- AI receptionist for WhatsApp
- English + Spanish
- Client language detection
- Appointment booking
- Rescheduling
- Cancellation
- Confirmation messages
- Reminder messages
- Follow-up messages
- Human escalation
- Pause/resume automation per chat
- Internal Zenda calendar
- Services and business hours
- Basic knowledge base
- Voice note understanding
- Client memory
- Basic logs
- Auto-start desktop app

Suggested limits:

```txt
300 AI-handled conversations/month
150 appointments/month
120 voice-note minutes/month
1 active staff profile: the owner
30-day conversation/activity log retention
Basic support
```

### 4.2 Pro — Team Receptionist

**Price:** $69/month or $708/year  
**Target:** Small teams: salons, spas, clinics, small dental/health/wellness offices, training studios.

Includes everything in Starter, plus:

- Team-mode dashboard
- Up to 5 staff members
- Staff-specific availability
- Services assigned to staff
- Team calendar
- Appointment assignment
- Owner notification rules
- More advanced knowledge base
- Team-level analytics
- Assisted setup available as paid add-on or limited onboarding session

Suggested limits:

```txt
1,000 AI-handled conversations/month
500 appointments/month
300 voice-note minutes/month
Up to 5 staff members
90-day conversation/activity log retention
Priority support
```

### 4.3 Business — Advanced Receptionist

**Price:** $149/month or $1,428/year  
**Target:** Busier appointment businesses with more volume, more staff, or higher-value appointments.

Includes everything in Pro, plus:

- Up to 15 staff members
- Advanced routing rules
- More detailed analytics
- Advanced audit logs
- Exports
- Assisted onboarding included
- Higher queue priority
- More customization
- Early access to integrations

Suggested limits:

```txt
3,000 AI-handled conversations/month
1,500 appointments/month
800 voice-note minutes/month
Up to 15 staff members
180-day conversation/activity log retention
Priority support + assisted onboarding
```

### 4.4 Overage strategy

Do not interrupt operations immediately when limits are exceeded. Use soft limits first:

1. At 80% usage: notify owner.
2. At 95% usage: notify owner and recommend upgrade.
3. At 100% usage: continue core flows for a short grace period.
4. After grace period: restrict AI handling for new conversations or require upgrade.

Suggested overage language:

> Your plan includes generous AI usage for normal appointment handling. If your business grows beyond your plan limits, Zenda will notify you before any restriction and help you upgrade to the right plan.

Do not publicly mention tokens.

---

## 5. Target launch verticals

Zenda can serve any appointment-based business, but launch messaging should focus on a few sectors.

Recommended order:

### 5.1 First launch vertical: beauty and personal care

Examples:

- Nail studios
- Hair salons
- Barbers
- Lash/brow studios
- Spas
- Massage studios

Why:

- Heavy WhatsApp use in LATAM
- High appointment volume
- Low regulatory complexity
- Simple service menus
- Frequent rescheduling
- Strong pain around missed messages

### 5.2 Second vertical: wellness and coaching

Examples:

- Therapists
- Coaches
- Yoga/pilates instructors
- Nutrition coaches
- Holistic/wellness providers

Why:

- Solo businesses are common
- Owners dislike constant interruptions
- Appointment reminders are valuable
- English/Spanish support can be a differentiator

### 5.3 Third vertical: clinics and dental offices

Examples:

- Dental clinics
- Small medical/wellness clinics
- Aesthetic clinics

Why:

- Higher willingness to pay
- Clear value from reduced no-shows
- More complex scheduling, which makes Zenda more valuable

Important limitation:

Zenda must be clear that it handles appointment workflows, service/pricing FAQs, and scheduling. It does **not** manage medical, dental, legal, psychological, or financial records/advice in v1.

---

## 6. Product positioning

### 6.1 Primary positioning

> **A professional AI receptionist for your WhatsApp.**

### 6.2 Expanded positioning

> Zenda answers your clients, books appointments, sends reminders, follows up, and escalates only when you need to step in.

### 6.3 Emotional value

The strongest emotional promise is:

> **Your business gets a professional receptionist without hiring one.**

Secondary promises:

- Never miss another appointment request.
- Stop answering the same WhatsApp messages all day.
- Let clients book while you work.
- Keep your schedule organized automatically.
- Stay in control when human attention is needed.

### 6.4 Avoid these positioning traps

Do not lead with:

- “WhatsApp automation”
- “Chatbot”
- “AI workflow platform”
- “CRM”
- “AI credits”
- “Message automation engine”

These sound technical or commoditized.

---

## 7. Core product flow

### 7.1 Customer journey

```txt
1. Visitor lands on zenda.bot
2. Visitor selects plan
3. Visitor creates account with basic data
4. Visitor pays through Stripe Checkout
5. Visitor downloads desktop app
6. Visitor logs into desktop app
7. Visitor scans WhatsApp QR
8. Zenda starts onboarding conversation with owner
9. Owner configures business through conversational setup
10. Dashboard activates
11. Zenda starts handling client conversations
```

### 7.2 Website responsibility

The website is not the dashboard.

The website handles:

- Marketing
- Pricing
- FAQ
- Account creation
- Stripe checkout
- Download links
- Legal pages
- Help docs

The website should not handle:

- Operational dashboard
- Conversations
- Appointments
- WhatsApp QR
- Owner daily management

### 7.3 Desktop app responsibility

The desktop app is both:

1. The local WhatsApp connection bridge.
2. The operational command center.

It handles:

- Login
- WhatsApp connection QR
- Connection status
- Conversation view
- Human takeover
- Pause/resume auto mode
- Appointments
- Calendar
- Client profiles
- Services
- Staff/team
- Availability
- Knowledge base
- Receptionist settings
- Logs
- Owner onboarding conversation
- Auto-start

### 7.4 Backend responsibility

The backend handles:

- Auth
- Tenancy/workspaces
- Subscription state
- Business profile
- Services
- Staff
- Availability
- Appointments
- Customers
- Conversations
- Messages
- AI orchestration
- Provider routing
- Tool execution
- Memory
- Logs/audit trail
- Queues
- Reminder scheduling
- Notifications
- Billing webhooks
- Multilingual templates

---

## 8. Repository setup

### 8.1 Root structure

```txt
zenda/
  app/
    electron + shadcn desktop app
  api/
    Bun API backend
  web/
    marketing site + checkout/account entry
  packages/
    shared/
      types
      schemas
      i18n
      constants
```

If keeping separate repos, use the same logical structure:

```txt
zenda-app
zenda-api
zenda-web
zenda-shared
```

### 8.2 Shared package

Create a shared package for:

- TypeScript types
- Zod schemas
- API contracts
- Appointment statuses
- Conversation modes
- Plan constants
- i18n keys
- Tool definitions
- Event types

This prevents the app, web, and API from drifting apart.

---

## 9. Technical architecture

### 9.1 High-level architecture

```txt
Client on WhatsApp
      ↓
Desktop App WhatsApp Connector
      ↓
Zenda API
      ↓
Conversation Engine
      ↓
AI Agent Router
      ↓
Tools: calendar, services, availability, reminders, memory, escalation
      ↓
Response queued/sent through Desktop App
```

### 9.2 API stack

Recommended:

```txt
Runtime: Bun
Language: TypeScript
API framework: Elysia, Hono, or similar Bun-friendly framework
Database: PostgreSQL
ORM: Drizzle or Prisma
Queue: BullMQ/Redis, or database-backed queue for simpler v1
Realtime: WebSockets or SSE
Auth: Better Auth, Lucia-like pattern, or custom JWT/session layer
Billing: Stripe Billing + Checkout + webhooks
Storage: S3-compatible storage for voice notes/audio where needed
Observability: structured logs + error tracking
```

### 9.3 Desktop app stack

```txt
Electron
React
shadcn/ui
TailwindCSS
whatsapp-web.js
Local secure storage for desktop auth token/session metadata
Auto-start registration
Connection health monitor
Realtime API client
```

Business data should not be stored only locally. The desktop app may cache for UX, but backend is source of truth.

### 9.4 Web stack

```txt
Next.js
shadcn/ui
TailwindCSS
Stripe Checkout
Marketing pages
Account creation
Download page
Legal pages
```

---

## 10. WhatsApp connection model

### 10.1 Public explanation

Use this language:

> Zenda connects securely to your WhatsApp through the desktop app. Keep the app open during business hours so your receptionist can answer clients.

Do not publicly mention:

- whatsapp-web.js
- internal model providers
- database details
- scraping/session implementation details
- exact automation internals

### 10.2 Plan rule

For v1:

```txt
1 workspace = 1 WhatsApp connection = 1 active business WhatsApp number
```

### 10.3 Internal risk rule

Zenda should avoid bulk/mass messaging features. It should focus on inbound and appointment-related workflows:

- Answering incoming messages
- Booking appointments
- Confirming appointments
- Sending reminders
- Following up on an appointment request
- Owner-approved reactivation if needed

Do not build v1 around campaigns, broadcasts, cold outreach, scraping, or bulk sending.

### 10.4 Connection states

```txt
connected
connecting
qr_required
disconnected
session_expired
error
rate_limited
maintenance
```

When disconnected:

- Pause automations that require sending/receiving WhatsApp messages.
- Continue safe backend preparation.
- Queue safe actions.
- Notify owner.

---

## 11. AI provider strategy

Zenda should not depend on one model provider. Use a Provider Router.

### 11.1 Providers

```txt
Z.ai
OpenAI
Ollama
```

### 11.2 Provider roles

| Task | Primary | Fallback | Notes |
|---|---|---|---|
| Intent detection | Z.ai low-cost model or Ollama | OpenAI mini | Must be fast and cheap. |
| Language detection | Ollama or Z.ai | OpenAI | Use deterministic fallback. |
| Message classification | Ollama/Z.ai | OpenAI | Classify booking, reschedule, cancel, FAQ, complaint, escalation. |
| Tool planning | Z.ai stronger model | OpenAI | Needs structured output. |
| Final client response | Z.ai or OpenAI mini | OpenAI stronger | Must be natural in Spanish/English. |
| Complex uncertainty | OpenAI stronger | Human escalation | Do not over-spend if escalation is better. |
| Conversation summary | Ollama/Z.ai | OpenAI mini | Cheap recurring summarization. |
| Memory extraction | Z.ai/Ollama | OpenAI mini | Extract preferences, names, recurring needs. |
| Voice transcription | Z.ai ASR or OpenAI transcription | Other provider | Track cost per minute. |
| Voice understanding after transcript | Z.ai/OpenAI | Human escalation | Low-confidence transcripts escalate or clarify. |
| Internal QA/testing | Ollama | Z.ai/OpenAI | Useful for dev/test without burning API cost. |

### 11.3 Z.ai role

Use Z.ai as one of the primary cost-performance providers for text tasks, agentic reasoning, structured outputs, and potentially audio transcription.

Recommended use:

- Normal receptionist responses
- Tool-call planning
- Conversation summaries
- Memory extraction
- Spanish/English response generation
- Low-cost audio transcription if quality is sufficient

### 11.4 OpenAI role

Use OpenAI where reliability and language quality matter most:

- Fallback for complex conversations
- High-confidence Spanish/English polishing
- Audio transcription fallback
- Edge cases with ambiguity
- Premium model path for Business plan or important escalations

### 11.5 Ollama role

Use Ollama for low-cost, non-critical, high-volume support tasks:

- Local classification
- Internal testing
- Development tasks
- Simple summarization
- Potential embeddings/classifiers if server infrastructure supports it

Do not depend on the customer’s desktop hardware for core AI processing in v1. Ollama should run on Zenda-controlled infrastructure if used in production, or locally only for development/internal operations.

### 11.6 Provider Router concept

Create a service:

```txt
AIProviderRouter
  - selectModel(task, plan, language, risk, costBudget)
  - executeStructured(taskDefinition)
  - executeText(taskDefinition)
  - executeAudioTranscription(audioPayload)
  - retryWithFallback(error, confidence)
  - recordCost(workspaceId, provider, model, usage)
```

Decision criteria:

```txt
task_type
plan_tier
conversation_risk
estimated_cost
latency_requirement
language
confidence_score
provider_availability
workspace_monthly_margin
```

---

## 12. Audio / voice notes

### 12.1 v1 audio scope

Zenda should support voice notes from day one, but only as input:

- Receive WhatsApp voice notes.
- Store audio securely or temporarily.
- Transcribe voice notes.
- Detect language.
- Understand intent.
- Reply by text.
- Show transcript to owner.
- Allow owner to listen to original audio.

Do not make AI-generated voice replies default in v1.

### 12.2 Voice confidence rules

Escalate or clarify if:

- Transcription confidence is low.
- Audio is noisy.
- Client mentions urgent/emergency terms.
- Client gives complex or sensitive details.
- Zenda is not sure which appointment action is requested.

Example clarification:

> I understood that you want to book an appointment, but I missed the preferred time. What time works best for you?

Spanish:

> Entendí que quieres agendar una cita, pero no alcancé a identificar bien el horario. ¿Qué horario te funciona mejor?

---

## 13. AI receptionist behavior

### 13.1 Receptionist identity

Each workspace configures:

```txt
Receptionist name:
- Alex
- Sami
- Noa
- Ari
- Luca
- Nico
- Kai
- Eli
- Mika
- Cleo
- Custom

Tone:
- Professional
- Warm
- Friendly
- Elegant
- Casual
- Like the owner
```

Default recommendation:

```txt
Name: Noa or Alex
Tone: Professional + warm
```

### 13.2 Client introduction

English:

> Hi, I’m Noa, the receptionist for Luna Studio. I can help you book, reschedule, or answer questions about our services.

Spanish:

> Hola, soy Noa, la recepcionista de Luna Studio. Puedo ayudarte a agendar, reagendar o resolver dudas sobre nuestros servicios.

### 13.3 AI disclosure

Recommended default:

- Do not aggressively announce “I am an AI bot.”
- Present as the business receptionist.
- If asked directly, answer honestly.

Example:

> I’m Zenda, the digital receptionist for this business. I can help with appointments, services, availability, and basic questions. If something needs human attention, I’ll notify the owner.

Spanish:

> Soy Zenda, la recepcionista digital de este negocio. Puedo ayudarte con citas, servicios, disponibilidad y dudas básicas. Si algo necesita atención humana, aviso al propietario.

---

## 14. Appointment workflow

### 14.1 Booking flow

```txt
1. Client asks for appointment.
2. Zenda identifies service.
3. Zenda identifies preferred date/time.
4. Zenda checks availability.
5. Zenda offers available slot.
6. Client confirms.
7. Zenda creates appointment.
8. Zenda sends confirmation.
9. Owner receives notification depending on settings.
10. Reminder is scheduled.
```

Zenda should not silently book without confirmation. The client should always confirm the slot.

### 14.2 Confirmation message

English:

> Perfect, your appointment is confirmed for Tuesday, May 5 at 4:00 PM for a haircut with Luna Studio. I’ll remind you before your visit.

Spanish:

> Perfecto, tu cita quedó confirmada para el martes 5 de mayo a las 4:00 PM para corte de cabello en Luna Studio. Te recordaré antes de tu visita.

### 14.3 Reminder timing

Default:

```txt
Send reminder around 24 hours before the appointment, during business hours.
```

If the appointment is at 9:00 AM tomorrow and the business is open 10:00–18:00, send the reminder today before closing, not at 9:00 AM outside useful context.

Suggested rules:

```txt
If appointment is more than 24h away:
  schedule reminder at T-24h, adjusted into business hours.

If T-24h falls outside business hours:
  move to nearest safe business-hour window.

If appointment is next morning:
  send reminder previous business day before close.

If client does not confirm reminder:
  optionally notify owner or send one follow-up depending on settings.
```

### 14.4 Appointment statuses

```txt
requested
pending_confirmation
confirmed
reminder_sent
client_confirmed
reschedule_requested
rescheduled
cancel_requested
cancelled
completed
no_show
needs_attention
```

---

## 15. Human escalation and takeover

### 15.1 Conversation modes

```txt
auto
needs_attention
human_takeover
paused
queued_offline
closed
```

### 15.2 Human takeover

The owner can click:

```txt
[Take over]
```

Then Zenda stops replying in that chat.

The owner can later click:

```txt
[Return to auto mode]
```

Zenda should summarize what happened and continue naturally.

### 15.3 Always escalate when

- Client asks for a human.
- Zenda does not know the answer.
- Client asks for an unconfigured discount.
- Client disputes a price or policy.
- Client asks for refund.
- Client is angry, threatening, or abusive.
- Client asks for medical, legal, financial, or emergency advice.
- Client gives sensitive information unrelated to booking.
- Client wants a custom exception.
- Client asks for a service not listed.
- Client asks for appointment outside configured rules.
- Audio is unclear.
- Zenda detects potential emergency.
- Client asks about Zenda’s internal technology, model, provider, or implementation.

### 15.4 Clarify before escalation when possible

Zenda should ask one useful clarification if it can safely proceed:

- Missing date
- Missing time
- Missing service
- Missing staff preference
- Ambiguous client name
- Partially understood voice note

If clarification fails, escalate.

---

## 16. Owner notifications

### 16.1 Notification channels

Primary:

- Desktop app notification
- In-app notification center
- Optional WhatsApp owner notifications through the connected business account if safe and technically reliable

Future:

- Email
- Push/mobile app

### 16.2 Notification settings

```txt
Notify me when:
[x] A new appointment is booked
[x] An appointment is cancelled
[x] An appointment is rescheduled
[x] A client needs human attention
[x] A client asks for a discount
[x] Zenda is unsure
[x] WhatsApp disconnects
[ ] Every new client message
[ ] Every AI response sent
```

Notification style:

```txt
- Real-time
- Important only
- Daily summary
- Silent unless urgent
```

Default:

```txt
Important only + appointment changes
```

---

## 17. Dashboard design

### 17.1 Dashboard concept

The desktop dashboard should feel like a:

> **Receptionist Command Center**

Not a heavy CRM, not only a calendar, and not only an inbox.

### 17.2 Starter/Solo dashboard

Main sections:

- WhatsApp connection status
- Receptionist status
- Today’s appointments
- Needs attention
- Recent receptionist activity
- Active conversations
- Upcoming reminders
- Quick settings

Solo language:

- Your availability
- Your services
- Your appointments
- Your clients
- Your receptionist

### 17.3 Pro/Business dashboard

Add:

- Team calendar
- Staff filter
- Staff availability
- Unassigned appointments
- Appointments by staff
- Team performance
- Routing rules

Team language:

- Team members
- Staff availability
- Assigned staff
- Team calendar
- Receptionist routing

### 17.4 Main dashboard layout

```txt
Top bar:
WhatsApp Connected · Receptionist Online · Plan · Language

Left column:
Today’s Appointments

Center column:
Needs Attention

Right column:
Receptionist Activity

Bottom cards:
New leads · Booked this week · Response time · Missed messages prevented
```

---

## 18. Onboarding

### 18.1 Conversational onboarding

After the WhatsApp QR is connected, the owner should meet their receptionist through a first onboarding conversation.

Example:

> Hi, I’m Noa, your Zenda receptionist. I’ll help you configure your business so I can answer clients and book appointments correctly. Let’s start with your business hours.

Spanish:

> Hola, soy Noa, tu recepcionista de Zenda. Te ayudaré a configurar tu negocio para poder responder a tus clientes y agendar citas correctamente. Empecemos con tus horarios.

### 18.2 Onboarding data to collect

Required:

- Business name
- Business category
- Country/timezone
- Default language
- Services
- Service duration
- Prices or price display preference
- Business hours
- Appointment buffer rules
- Cancellation policy
- Refund policy if applicable
- Location or online appointment info
- Owner notification preference
- Receptionist name
- Receptionist tone
- Escalation rules

For Pro/Business:

- Staff members
- Staff services
- Staff availability
- Assignment rules

### 18.3 Onboarding completion

The dashboard should show:

```txt
Receptionist setup: 85% complete

Required to go live:
[x] WhatsApp connected
[x] Business hours
[x] At least one service
[x] Appointment rules
[ ] Cancellation policy
[ ] Receptionist tone
```

Allow activation once core requirements are complete.

---

## 19. Multilingual support

### 19.1 Languages for day one

```txt
English
Spanish
```

### 19.2 Language layers

There are three language layers:

1. App interface language
2. Business default receptionist language
3. Client conversation language

The client conversation language should be auto-detected. If the client writes in English, reply in English. If the client writes in Spanish, reply in Spanish.

### 19.3 Translatable business objects

- Service name
- Service description
- Price notes
- Cancellation policy
- Refund policy
- Reminder templates
- Confirmation templates
- Escalation messages
- Follow-up messages
- FAQs
- Location instructions

Zenda should generate initial translations and ask the owner to approve/edit.

---

## 20. Knowledge base and settings

### 20.1 Knowledge base objects

```txt
BusinessProfile
Service
FAQ
Policy
LocationInfo
StaffProfile
AvailabilityRule
PricingRule
DiscountRule
EscalationRule
```

### 20.2 Discount permissions

Zenda may discuss discounts only if configured.

Settings:

```txt
[x] Can mention service prices
[x] Can explain cancellation policy
[x] Can explain refund policy
[x] Can offer predefined discounts
[ ] Can create custom discounts
[ ] Can make exceptions without approval
```

Recommended defaults:

```txt
Can mention prices: ON if prices are configured
Can explain cancellation policy: ON if policy configured
Can offer predefined discounts: OFF until owner configures discount
Can create custom discounts: OFF always in v1
Can make exceptions: OFF always in v1
```

---

## 21. Data model

Minimum tables/entities:

```txt
User
Workspace
WorkspaceMember
Subscription
Plan
UsageRecord
WhatsAppConnection
BusinessProfile
ReceptionistProfile
Service
StaffMember
AvailabilityRule
Appointment
Customer
Conversation
Message
ConversationSummary
AgentMemory
KnowledgeBaseItem
Reminder
Escalation
Notification
AuditLog
QueueJob
ProviderUsage
AudioAsset
```

### 21.1 Appointment fields

```txt
id
workspace_id
customer_id
staff_member_id nullable
service_id
status
start_at
end_at
timezone
source_conversation_id
created_by: ai | owner | system
confirmation_status
reminder_status
notes
created_at
updated_at
cancelled_at
completed_at
```

### 21.2 Conversation fields

```txt
id
workspace_id
customer_id
channel: whatsapp
status/mode
last_message_at
language
assigned_to_owner boolean
needs_attention_reason
summary
created_at
updated_at
```

### 21.3 Message fields

```txt
id
conversation_id
workspace_id
external_message_id
sender_type: customer | ai | owner | system
content_type: text | audio | image | file | system
body
language
ai_provider nullable
ai_model nullable
tool_calls jsonb
status: received | queued | sent | failed
created_at
sent_at
```

### 21.4 Audit log examples

- AI sent message.
- AI created appointment.
- Owner took over conversation.
- Owner returned conversation to auto mode.
- AI escalated conversation.
- Reminder queued.
- Reminder sent.
- WhatsApp disconnected.
- WhatsApp reconnected.
- Setting changed.
- Service changed.
- Price changed.
- Staff availability changed.

---

## 22. Queues and offline behavior

### 22.1 Offline state

When the desktop app disconnects:

```txt
WhatsApp disconnected
Receptionist paused for WhatsApp sending/receiving
Backend continues safe preparation
Owner notified
```

### 22.2 Safe queue

Can be prepared while offline:

- Draft replies
- Appointment reminders
- Follow-up drafts
- Owner notifications
- Conversation summaries
- Suggested actions

### 22.3 Unsafe queue

Should not be finalized without connection:

- Sending WhatsApp messages
- Confirming delivery
- Processing messages never received by connector
- Appointment changes based on unconfirmed client replies

### 22.4 Reconnection UX

When connection returns:

```txt
Zenda is back online.

Queued actions:
- 3 reminders ready
- 1 follow-up ready
- 2 conversations waiting for sync

[Send safe queued actions] [Review first]
```

Default:

- Starter: send safe queued actions automatically.
- Pro/Business: allow configurable review behavior.

---

## 23. Stripe billing setup

### 23.1 Stripe products

Create three Stripe Products:

```txt
Zenda Starter
Zenda Pro
Zenda Business
```

Each product has two prices:

```txt
monthly
annual
```

Optional founding prices:

```txt
Zenda Starter Founding
Zenda Pro Founding
Zenda Business Founding
```

### 23.2 Checkout flow

```txt
1. User creates account.
2. User selects plan.
3. Backend creates Stripe Checkout Session.
4. Stripe handles payment.
5. Stripe webhook confirms subscription.
6. Backend activates workspace.
7. User is redirected to download page.
```

### 23.3 Webhooks to implement

```txt
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
customer.subscription.trial_will_end
```

### 23.4 Subscription states

```txt
trialing
active
past_due
unpaid
canceled
incomplete
paused
```

### 23.5 Tax/compliance note

Being a Wyoming LLC helps with US-based Stripe access and USD billing, but it does not remove tax obligations. Zenda should use Stripe Tax or a similar workflow to calculate, collect, and report tax/VAT/sales tax where required.

Operational recommendation:

- Start with USD pricing.
- Enable Stripe Tax once selling beyond a small beta.
- Keep invoices clean.
- Consult a US accountant for Wyoming LLC/federal filing.
- Consult local tax counsel if selling materially into Mexico or other LATAM countries.

---

## 24. Admin/internal tools

Zenda needs an internal admin panel, even if simple.

Required internal views:

- Workspaces
- Subscriptions
- Usage and provider costs
- WhatsApp connection health
- Error logs
- Conversation escalation logs
- Provider usage by workspace
- Refund/cancellation support
- Manual plan override
- Abuse/risk flags

This is important because early customer support will depend on visibility.

---

## 25. Security and privacy

### 25.1 Data rules

Zenda is for appointment operations, not sensitive record management.

Do not store:

- Medical records
- Dental records
- Legal case records
- Financial advice data
- Therapy notes
- Highly sensitive documents

Do store:

- Client name
- Phone number
- Appointment details
- Conversation history
- Service requested
- Preferences relevant to booking
- Business settings

### 25.2 AI privacy rule

Only send the minimum necessary context to model providers.

Use:

- Conversation summaries
- Business profile snippets
- Relevant service/policy chunks
- Current appointment state

Avoid sending full historical conversations unless necessary.

### 25.3 Security controls

- Workspace data isolation
- Encrypted secrets
- Secure desktop token storage
- Audit logs
- Owner-only login in v1
- Rate limits
- Provider key isolation
- Webhook signature verification
- Signed URLs for audio assets
- Data retention settings by plan

---

## 26. AI safety rules

Zenda must never pretend to be a professional advisor. It is an appointment receptionist.

### 26.1 Escalate regulated or sensitive advice

Always escalate:

- Medical advice
- Dental diagnosis
- Legal advice
- Financial advice
- Mental health crisis
- Emergency situations
- Medication instructions
- Complex refund disputes

### 26.2 Safe response example

English:

> I can help you schedule an appointment, but I can’t give medical advice. I’ll notify the business owner so they can guide you properly.

Spanish:

> Puedo ayudarte a agendar una cita, pero no puedo dar orientación médica. Avisaré al propietario para que pueda ayudarte correctamente.

---

## 27. Product roadmap

### Phase 1 — Private alpha

Goal: prove WhatsApp connection, appointment booking, and owner control.

Build:

- Desktop app login
- QR connection
- Basic dashboard
- AI response loop
- Internal calendar
- Services
- Availability
- Appointment creation
- Human takeover
- Logs
- Stripe test mode

### Phase 2 — Paid beta

Goal: sell to first real businesses.

Build:

- Stripe live mode
- Conversational onboarding
- English/Spanish support
- Voice note transcription
- Reminder scheduler
- Escalation rules
- Owner notifications
- Usage tracking
- Plan limits
- Download/update flow

### Phase 3 — Public launch

Goal: affordable self-serve LATAM product.

Build:

- Polished website
- Pricing page
- Support docs
- Error recovery
- Better analytics
- Assisted onboarding for Pro/Business
- Better AI router
- Provider cost dashboard
- Customer success playbooks

### Phase 4 — Expansion

Future features:

- Google Calendar sync
- WhatsApp Business API option for higher-tier customers
- Payments/deposits
- Mobile companion app
- Reviews/testimonials automation
- Instagram DM
- Multi-branch
- Advanced CRM

---

## 28. Google Calendar and integrations

For v1, use Zenda’s internal calendar as source of truth.

Why:

- The AI agent needs reliable control.
- Availability logic is simpler.
- Reschedules/cancellations are easier.
- Fewer integration edge cases.

Roadmap:

```txt
v1: Internal Zenda calendar
v1.1: Google Calendar export/sync
v1.2: Two-way Google Calendar integration
Later: Calendly, Outlook, external booking platforms
```

---

## 29. Legal/product disclaimers

Public product should say:

- Zenda helps manage appointments and customer communication.
- Zenda is not a medical, legal, financial, or emergency service.
- The business owner is responsible for reviewing and configuring policies, prices, services, and appointment rules.
- The desktop app must remain running and connected for WhatsApp handling.

Do not say:

- “Guaranteed no missed messages.”
- “Official WhatsApp API automation” unless later using official API.
- “Certified for healthcare/legal use.”
- “Unlimited AI” without fair-use rules.

---

## 30. Recommended development priorities

### Highest priority

1. Stable WhatsApp connector.
2. Reliable appointment state machine.
3. Human takeover and resume.
4. Clear dashboard.
5. Escalation safety.
6. Usage/cost tracking.
7. Stripe subscription state.
8. Bilingual templates.
9. Voice-note transcription.
10. Logs.

### Lower priority

- Pretty analytics.
- Complex CRM.
- External integrations.
- Multi-branch.
- Advanced staff permissions.
- AI voice replies.
- Marketing campaigns.

---

## 31. Final product definition for the team

```txt
Zenda is a multilingual AI receptionist for appointment-based businesses.

It consists of:
1. A marketing website for signup, pricing, checkout, and desktop app download.
2. A Bun API backend that stores all business data, runs the AI receptionist, manages appointments, queues, logs, memory, provider usage, and subscription state.
3. An Electron desktop app that connects to the business WhatsApp and acts as the owner’s operational dashboard.

Zenda answers customers automatically, books appointments after confirmation, sends reminders, understands voice notes, handles reschedules/cancellations, escalates uncertain conversations, and lets the owner take over or return a chat to auto mode.

Zenda supports English and Spanish from day one.

The product is priced for LATAM as an affordable mass-market receptionist, with Starter, Pro, and Business plans.
```

---

## 32. Source notes used for pricing research

Research was performed on April 27, 2026. Important pricing signals came from:

- WATI pricing page: https://www.wati.io/es/pricing/
- respond.io pricing page: https://respond.io/pricing
- Callbell pricing content: https://callbell.eu/en/
- Trengo pricing page: https://trengo.com/prices
- Zoko pricing page: https://www.zoko.io/pricing
- Goodcall pricing page: https://www.goodcall.com/pricing
- Smith.ai receptionist pricing: https://smith.ai/pricing/receptionists
- Yelp Host / Receptionist coverage: https://www.theverge.com/news/802529/yelp-ai-host-receptionist
- OpenAI API pricing: https://openai.com/api/pricing/
- Z.ai API pricing: https://docs.z.ai/guides/overview/pricing
- Z.ai coding plan documentation: https://docs.z.ai/devpack/overview
- Ollama website/docs: https://ollama.com/ and https://docs.ollama.com/quickstart
- Stripe pricing and Stripe Tax: https://stripe.com/en-mx/pricing and https://stripe.com/en-mx/tax
- WhatsApp linked devices and automation policy: https://faq.whatsapp.com/378279804439436 and https://faq.whatsapp.com/5957850900902049
