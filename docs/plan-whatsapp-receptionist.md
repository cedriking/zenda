# Zenda WhatsApp Receptionist - Implementation Plan

## Overview

This plan maps every feature from the `docs/zenda-whatsapp-receptionist-guidelines.md` to concrete implementation tasks, organized by bounded context. Each section notes what already exists vs. what needs building.

---

## Phase 1: Type System & Sending Policy Engine (Sections 8, 9, 10)

The sending policy engine is the safety backbone. Everything else depends on it.

### 1.1 Shared Types (`packages/shared/`)

**New file: `packages/shared/src/messaging/types.ts`**

Define and export:
- `AppointmentMessagingConsent` (from guidelines §8.3)
- `ZendaMessagePurpose` enum (from §10.1)
- `WhatsAppChannelType` (from §10.2)
- `SendDecision` type (from §10.3)
- `AppointmentAuditEvent` (from §17)
- Outbound limit constants (from §9)

### 1.2 Database Schema Changes (`packages/db/src/schema/`)

**Add to schema or new tables:**

- `messagingConsent` table — stores `AppointmentMessagingConsent` per customer per business. Fields: `businessId`, `customerId`, `phoneNumber`, `status` (unknown/allowed/limited/opted_out), `source` enum, `allowedPurposes` text array, `capturedAt`, `lastInboundMessageAt`, `lastOutboundMessageAt`, `notes`. Unique on `(workspaceId, customerId)`.

- `outboundMessageLog` table — per-customer outbound counter. Fields: `workspaceId`, `customerId`, `conversationId`, `outboundSinceLastInbound` (int), `lastInboundAt`, `lastOutboundAt`, `purposeOfLastOutbound`. Used to enforce the "max 3 outbound without reply" rule.

- `sentReminderLog` table — tracks reminder deduplication. Fields: `appointmentId`, `reminderType` (day_before / same_day), `sentAt`. Unique on `(appointmentId, reminderType)` to prevent duplicate reminders.

- Update `receptionistProfiles` schema — add columns:
  - `personalityPreset` text (professional/warm/minimal/premium/friendly, default 'professional')
  - `greetingStyle` text
  - `formalityLevel` text (1-5 scale as int)
  - `concisenessLevel` text (1-5 scale as int)
  - `warmthLevel` text (1-5 scale as int)
  - `useEmoji` boolean default false
  - `speaksAsBusiness` boolean default false (vs first-person singular)
  - `proactivelySuggestTimes` boolean default true
  - `confirmsBeforeBooking` boolean default true
  - `notifyOwnerEveryAppointment` boolean default true
  - `cancellationPolicyStrictness` text (lenient/standard/strict)
  - `priceDisplayMode` already exists
  - `refundHandlingMode` text
  - `discountHandlingMode` text
  - `depositHandlingMode` text

- Update `businessProfiles` schema — add columns:
  - `cancellationWindowHours` int (default 24)
  - `reschedulingWindowHours` int (default 2)
  - `depositRequired` boolean default false
  - `depositAmountCents` int
  - `approvedCancellationText` text
  - `approvedRefundText` text
  - `approvedDiscountText` text
  - `emergencyEscalationInstructions` text
  - `sensitiveTopics` text array (topics requiring auto-escalation)

- Update `workspaces` schema — add:
  - `maxRemindersPerAppointment` int default 2
  - `maxOutboundWithoutReply` int default 3
  - `outboundLimitsConfig` jsonb (for configurable safe-range limits)

### 1.3 Sending Policy Engine (`api/src/modules/messaging/sending-policy.ts`)

**New module: `api/src/modules/messaging/`**

Implement `canSendOutboundMessage()` (from §10.4) as a pure function:
- Input: channel, purpose, consent status, appointment context, outbound count, duplicate check, appointment time
- Returns `SendDecision`
- Unit-testable with no DB dependencies

### 1.4 Outbound Rate Tracker (`api/src/modules/messaging/outbound-tracker.ts`)

Tracks per-customer outbound counts:
- `incrementOutbound(workspaceId, customerId)` — bumps counter after successful send
- `resetOnInbound(workspaceId, customerId)` — resets to 0 when customer replies
- `getCount(workspaceId, customerId)` — returns current count
- Uses `outboundMessageLog` table for persistence

### 1.5 Reminder Deduplication Guard (`api/src/modules/messaging/reminder-guard.ts`)

Before any reminder send:
- Check `sentReminderLog` for existing reminder of same type on same appointment
- Check appointment not cancelled/completed
- Check appointment time not passed
- Check consent status
- Returns boolean + reason

---

## Phase 2: Consent Management (Section 8)

### 2.1 Consent Service (`api/src/modules/messaging/consent-service.ts`)

- `recordConsent(input)` — create or update consent record
- `getConsent(workspaceId, customerId)` — retrieve consent status
- `optOut(workspaceId, customerId)` — mark opted_out, cancel pending automated messages, send confirmation, notify owner
- `isAllowedToSend(workspaceId, customerId, purpose)` — check if specific purpose is allowed
- `detectOptOutIntent(messageBody)` — NLP pattern matching for opt-out phrases (§8.4)
- `generateConsentConfirmation(customerLanguage)` — natural language confirmation (§8.4)

### 2.2 Consent API Routes (`api/src/modules/messaging/index.ts`)

- `GET /consent/:customerId` — get consent status
- `POST /consent` — record consent
- `POST /consent/opt-out` — process opt-out
- Integrate into the conversation engine so inbound messages auto-detect opt-out intent

### 2.3 Integrate Consent into Conversation Engine

Update `api/src/modules/conversation/engine.ts`:
- On every inbound message, update `lastInboundMessageAt` in consent record
- On first customer message ever, create consent with source `customer_inbound_message`
- If customer says booking keywords, update consent source to `whatsapp_booking`
- On opt-out intent detected, call `optOut()` and short-circuit (no AI response, just confirmation)

---

## Phase 3: Assistant Personality System (Section 6)

### 3.1 Personality Presets (`packages/shared/src/personality/presets.ts`)

Define 5 preset configs (§6.2):
- Professional, Warm, Minimal, Premium, Friendly
- Each preset defines: system prompt fragments, greeting templates, confirmation style, formality, conciseness, warmth, emoji usage

### 3.2 Personality Validator (`api/src/modules/ai/personality-validator.ts`)

- `validatePersonalityConfig(config)` — rejects disallowed presets (§6.3)
- `validateCustomInstructions(text)` — blocks unsafe custom instructions (angry, rude, aggressive, flirty, manipulative, etc.)
- Returns `{ valid: boolean, sanitizedConfig?, reason? }`

### 3.3 Enhanced System Prompt Builder

Update `api/src/modules/ai/system-prompts.ts`:
- Inject personality preset into system prompt
- Apply formality/warmth/conciseness levels
- Inject business-specific approved texts (cancellation, refund, pricing)
- Include the canonical prompt rules from §22
- Add scope boundary rules from §4 (allowed/disallowed categories)
- Add natural language rules from §7

### 3.4 Personality API Routes

Update `api/src/modules/business/index.ts`:
- `PUT /receptionist/personality` — update personality preset + all dimensions
- `POST /receptionist/validate-instructions` — validate custom instructions before saving
- Enforce `personalityValidator` on all updates

---

## Phase 4: Enhanced Appointment Flows (Sections 11, 12, 15, 16)

### 4.1 Natural Language Intent Classifier (`api/src/modules/ai/intent-classifier.ts`)

Classify customer intent from natural language:
- Intents: book, confirm, reschedule, cancel, check_availability, ask_price, ask_location, ask_hours, ask_human, ask_reminder, opt_out, ambiguous
- Use pattern matching + LLM fallback for ambiguous cases
- Returns: `{ intent, confidence, extractedEntities? }`

### 4.2 Enhanced Booking Flow Tool

Update `api/src/modules/ai/tools/book-appointment.ts`:
- Multi-turn: collect info one question at a time
- Store partial booking state in conversation context
- Never ask more than 1 question at a time
- Confirm details before writing to calendar (§11.2)
- Return confirmation only after successful DB write

### 4.3 Enhanced Confirmation Flow

Update `api/src/modules/ai/tools/confirm-appointment.ts`:
- Confirm critical details naturally before finalizing
- Show service, staff, date, time, location in confirmation
- Do NOT claim confirmed until DB write succeeds (§11.2)

### 4.4 Enhanced Rescheduling Flow

Update `api/src/modules/ai/tools/reschedule-appointment.ts`:
- Identify existing appointment first
- Check availability for new time
- Offer available options naturally
- Update calendar
- Send clear confirmation
- Apply rescheduling window from business config

### 4.5 Enhanced Cancellation Flow

Update `api/src/modules/ai/tools/cancel-appointment.ts`:
- Identify the appointment
- Confirm if ambiguous
- Apply business cancellation policy (window hours, strictness)
- Cancel calendar event
- Apply deposit handling if configured
- Notify owner if within cancellation window

### 4.6 Enhanced Reminder Service

Update `api/src/modules/appointment/reminder-service.ts`:
- Apply sending policy engine before sending
- Check consent status
- Check deduplication guard
- Check appointment not past
- Natural language reminders (§15), no robotic prompts
- Confirmation requests only if business explicitly requires
- Update reminder templates to be warm and natural

### 4.7 Follow-Up Service (`api/src/modules/messaging/follow-up-service.ts`)

**New file:**
- Track incomplete booking flows
- Send max 1 follow-up if customer stops responding during booking
- Use natural language (§16 examples)
- Never send repeated follow-ups
- Respect outbound limits

---

## Phase 5: Human Escalation (Section 13)

### 5.1 Enhanced Escalation Service

Update `api/src/modules/ai/tools/escalate-to-human.ts`:
- Support all escalation triggers from §13 (upset customer, out of scope, sensitive topic, tool failure, complex policy, refund request, emergency)
- Natural escalation language (§13.1)
- Emergency detection pattern + safe response (§13.2)
- Create escalation record with reason
- Notify business owner via notification service + WebSocket

### 5.2 Escalation Detection in Conversation Engine

Update `api/src/modules/conversation/engine.ts`:
- Detect when AI confidence is low → auto-escalate
- Detect emergency keywords → special emergency flow
- Detect sensitive topic from business config → auto-escalate
- Set conversation mode to `human_takeover`

---

## Phase 6: Outbound Message Queue with Policy (Sections 9, 18, 19)

### 6.1 Persistent Message Queue (`api/src/modules/queue/persistent-queue.ts`)

**New file — replace in-memory queue:**
- Use PostgreSQL as backing store (new `outboundQueue` table)
- Per-business limits
- Per-customer limits (using outbound tracker)
- Duplicate suppression
- Retry with exponential backoff (max 5)
- Dead-letter queue for permanently failed messages
- Appointment-time validation before send
- Cancellation validation before send
- Business connector status check

### 6.2 Queue Processor (`api/src/modules/queue/processor.ts`)

**New file:**
- Runs on interval or event-driven
- For each queued message:
  1. Run sending policy engine
  2. If allowed, send via WhatsApp connector
  3. If not allowed, drop + log reason + optionally notify owner
  4. On failure, retry or dead-letter
- Emergency kill switch: `POST /queue/kill-switch` — pauses all outbound

### 6.3 Offline Revalidation (`api/src/modules/queue/offline-revalidator.ts`)

**New file (replaces current offline-queue.ts):**
- When WhatsApp connector reconnects:
  1. Do NOT blindly replay old messages
  2. Revalidate each queued message against current state
  3. Drop expired appointment reminders
  4. Drop messages for cancelled appointments
  5. Drop duplicate confirmations
  6. Drop messages for opted-out customers
  7. Notify owner if important messages couldn't be delivered

### 6.4 Business App Coexistence Connector Rules

Enforce in sending policy + queue:
- One business per WhatsApp number
- No cold outreach, marketing, broadcasts
- No scraped contacts, high-volume imports
- No repeated outbound nudges
- No sending after opt-out
- No automatic retry loops beyond configured limit
- No sending if connector session unstable
- All validated in `canSendOutboundMessage()`

---

## Phase 7: Enhanced Audit & Privacy (Section 17)

### 7.1 Audit Integration

Update `api/src/modules/audit/logger.ts`:
- Add helper functions for each `AppointmentAuditEvent.action` type
- Auto-audit all: message sent/received, appointment created/updated/cancelled, human escalation, opt-out, policy-blocked send
- Include channel, channel provider, actor, metadata

### 7.2 Audit Query API

**New routes in `api/src/modules/audit/index.ts`:**
- `GET /audit` — list with filters (entity type, action, date range)
- `GET /audit/export` — CSV export for compliance

### 7.3 Privacy Guards

- Minimize customer data in AI prompts (only what's needed for current task)
- Never expose customer A's data to customer B
- Never reveal internal business notes unless configured as customer-facing
- All appointment actions auditable via audit module

---

## Phase 8: Desktop App Dashboard Updates (Section 14)

### 8.1 Business Configuration UI

**New/updated pages in `app/`:**

- **Identity settings** (`/dashboard/settings/business`):
  - Assistant name, business name, type, locations, staff, services, languages, timezone

- **Scheduling settings** (`/dashboard/settings/scheduling`):
  - Business hours, booking rules, min notice, max booking window, appointment duration, buffer times, staff assignment, cancellation window, rescheduling window, deposit

- **Communication settings** (`/dashboard/settings/communication`):
  - Personality preset selector (5 options with previews)
  - Greeting style, formality slider, conciseness slider, warmth slider
  - Emoji toggle
  - Reminder behavior config
  - Owner notification config
  - Human escalation behavior
  - Approved pricing/cancellation/refund/discount text editors

- **Safety settings** (`/dashboard/settings/safety`):
  - Allowed scope config
  - Sensitive topics list
  - Opt-out handling
  - Max reminder count
  - Emergency escalation instructions

### 8.2 WhatsApp Connection UI

Update `/dashboard/settings` or new `/dashboard/settings/whatsapp`:
- Show Business App Coexistence branding (§3, §19.1)
- Professional client-facing explanation (not "Baileys")
- Connection status
- Migration path info for official WABA

### 8.3 Consent Management UI

**New page: `/dashboard/settings/consent`:**
- View customer consent statuses
- Manual consent override
- View opt-out history

---

## Phase 9: AI Agent Safety Hardening (Sections 4, 5, 21, 22)

### 9.1 Scope Enforcement in System Prompt

Update `system-prompts.ts` to include:
- Allowed message categories (§4.1)
- Disallowed categories (§4.2)
- Ambiguous message redirect template (§4.3)
- Behavior standards (§5)
- All 18 AI agent implementation rules (§21)
- Canonical system instruction (§22)

### 9.2 Tool Call Safety

Update all AI tools:
- Never bypass sending policy engine
- Never claim appointment action succeeded before DB write
- Never invent availability, prices, policies
- All tools return structured results that the agent must relay honestly
- On tool failure, trigger escalation

### 9.3 Input Sanitization

**New file: `api/src/modules/ai/input-guard.ts`**
- Strip prompt injection attempts from customer messages
- Limit message length
- Flag suspicious patterns
- Log blocked attempts to audit

---

## Phase 10: QA & Testing (Section 23)

### 10.1 Integration Test Suite

**New: `api/tests/receptionist/`**

Tests for each QA checklist item (§23):
- Booking flow (happy path + edge cases)
- Rescheduling flow
- Cancellation flow
- Reminder flow (deduplication, expired, post-cancellation)
- Human escalation (all triggers)
- Tool failure handling
- Calendar write confirmation order
- Opt-out detection and enforcement
- Marketing message blocking
- Unknown purpose blocking
- Duplicate reminder blocking
- Outbound limits enforcement
- Customer data isolation
- Sensitive request escalation
- Personality preset validation
- Unsafe instruction rejection
- Consent flow
- Queue revalidation after offline

### 10.2 E2E Test Scenarios

**New: `app/tests/receptionist/`**

End-to-end desktop app tests for:
- Full booking conversation
- Reschedule via natural language
- Cancel via natural language
- Opt-out via natural language
- Escalation trigger
- Personality change reflected in conversation

---

## Implementation Order & Dependencies

```
Phase 1 (Types + Policy Engine)     ← no dependencies, start here
  ↓
Phase 2 (Consent)                   ← depends on Phase 1 types + schema
  ↓
Phase 6 (Persistent Queue)          ← depends on Phase 1 policy engine
  ↓
Phase 3 (Personality)               ← depends on Phase 1 schema changes
Phase 4 (Appointment Flows)         ← depends on Phase 2 consent + Phase 1 policy
Phase 5 (Escalation)                ← depends on Phase 4 tools
  ↓
Phase 7 (Audit)                     ← depends on Phase 4 + Phase 6 for full coverage
Phase 9 (Safety Hardening)          ← depends on Phase 3 + Phase 4
  ↓
Phase 8 (Dashboard UI)              ← depends on all backend phases
  ↓
Phase 10 (QA)                       ← depends on all phases
```

## Estimated Scope

| Phase | New Files | Modified Files | Key Complexity |
|-------|-----------|----------------|----------------|
| 1 | 4-5 | 3-4 (schema, shared exports) | Medium — type definitions + policy logic |
| 2 | 2-3 | 2 (engine, consent routes) | Medium — consent lifecycle |
| 3 | 2-3 | 3 (system-prompts, business routes, schema) | Medium — prompt engineering |
| 4 | 2-3 | 5-6 (tools, reminder, engine) | High — multi-turn flows |
| 5 | 1 | 2-3 (escalate tool, engine) | Low-Medium |
| 6 | 3-4 | 2 (queue index, whatsapp module) | High — persistent queue |
| 7 | 1 | 2 (audit, engine) | Low |
| 8 | 0 | 5-8 (desktop app pages) | Medium — UI work |
| 9 | 1 | 3-4 (tools, system-prompt) | Medium |
| 10 | 10-15 | 0 | Medium — test writing |

**Total: ~25 new files, ~25-35 modified files**

## Key Design Decisions

1. **Sending policy is a pure function** — no DB, no side effects. Easy to test, easy to compose.
2. **Consent is checked at two levels** — conversation engine (high level) and sending policy (low level before every outbound).
3. **Personality is injected into system prompt** — not a separate model or agent. Keeps the architecture simple.
4. **Persistent queue uses PostgreSQL** — no new infrastructure (Redis). Uses the existing DB with a `SELECT FOR UPDATE SKIP LOCKED` pattern for processing.
5. **Intent classification starts with patterns, graduates to LLM** — fast path for common intents, LLM fallback for ambiguity. Avoids unnecessary token spend.
6. **All new tables follow existing Drizzle ORM patterns** — consistent with current codebase style.
