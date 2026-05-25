// Scope Rules (S4):
// Allowed: appointment scheduling, rescheduling, cancellation, service info,
//   business hours, location, pricing, general inquiries
// Disallowed: medical advice, legal advice, financial advice, personal opinions,
//   political/religious topics, any topic outside business operations
// Ambiguous: redirect to human escalation

import { db } from '@zenda/db/client'
import { businessProfiles, receptionistProfiles, services, staffMembers } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { PERSONALITY_PRESETS, type PersonalityPresetKey } from '@zenda/shared'
import type { Language, PersonalityPreset, CancellationStrictness } from '@zenda/shared'

interface BusinessContext {
  businessName: string
  category: string | null
  description: string | null
  location: string | null
  cancellationPolicy: string | null
  refundPolicy: string | null
  priceDisplay: string
  receptionistName: string
  tone: string
  greetingTemplate: string | null
  services: { id: string; name: string; duration: number; price: number | null }[]
  staff: { name: string }[]

  // Personality fields
  personalityPreset: PersonalityPreset
  formalityLevel: number
  concisenessLevel: number
  warmthLevel: number
  useEmoji: boolean
  speaksAsBusiness: boolean
  proactivelySuggestTimes: boolean
  confirmsBeforeBooking: boolean
  cancellationPolicyStrictness: CancellationStrictness

  // Business policy fields
  cancellationWindowHours: number
  reschedulingWindowHours: number
  depositRequired: boolean
  depositAmountCents: number | null
  approvedCancellationText: string | null
  approvedRefundText: string | null
  approvedDiscountText: string | null
  emergencyEscalationInstructions: string | null
  sensitiveTopics: string[] | null
}

export async function buildSystemPrompt(
  workspaceId: string,
  language: Language,
  customerId?: string,
  conversationId?: string,
  localTime?: string,
  localTimezone?: string,
): Promise<string> {
  const ctx = await loadBusinessContext(workspaceId)
  const lang = language === 'es' ? 'Spanish' : 'English'
  const preset = PERSONALITY_PRESETS[ctx.personalityPreset]

  const sections: string[] = []

  // 0. Current Date & Time — CRITICAL for appointment scheduling
  sections.push(buildCurrentDateTimeSection(localTime, localTimezone))

  // 1. Identity
  sections.push(buildIdentitySection(ctx, lang))

  // 2. Personality & Tone
  sections.push(buildPersonalitySection(ctx, preset))

  // 3. Role
  sections.push(buildRoleSection(ctx))

  // 4. Business Information
  sections.push(buildBusinessInfoSection(ctx))

  // 5. Services & Staff
  sections.push(buildServicesSection(ctx))

  // 6. Booking Policies
  sections.push(buildBookingPoliciesSection(ctx))

  // 7. Approved Texts
  sections.push(buildApprovedTextsSection(ctx))

  // 8. Sensitive Topics & Escalation
  sections.push(buildEscalationSection(ctx))

  // 9. Scope Boundaries
  sections.push(buildScopeBoundariesSection())

  // 10. Natural Language Rules
  sections.push(buildNaturalLanguageRules(ctx))

  // 11. Safety rules (S22)
  sections.push(buildSafetyRulesSection())

  // 12. Customer Context (if available)
  if (customerId) {
    const customerSection = await buildCustomerContextSection(workspaceId, customerId, conversationId)
    if (customerSection) sections.push(customerSection)
  }

  return sections.join('\n\n')
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildCurrentDateTimeSection(localTime?: string, localTimezone?: string): string {
  // Use the app's local time if provided (accurate for the user's timezone)
  // otherwise fall back to server time
  const now = localTime ? new Date(localTime) : new Date()
  const tz = localTimezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz })

  return `## Current Date & Time

Today is ${dateStr}.
Current time: ${timeStr} (${tz}).

When a customer says "tomorrow", "next Monday", "this weekend", etc., calculate the exact date based on today's date above. NEVER guess or hallucinate dates.
When offering appointment slots, always derive them from the REAL current date.`
}

function buildIdentitySection(ctx: BusinessContext, lang: string): string {
  const voice = ctx.speaksAsBusiness
    ? `You represent "${ctx.businessName}" as a business entity. Refer to yourself as the business when appropriate (e.g. "We can offer you..." or "Our next available slot is...").`
    : `You are ${ctx.receptionistName}, an individual AI receptionist. Speak in first person (e.g. "I can help you..." or "Let me find a slot for you...").`

  return `You are ${ctx.receptionistName}, the AI receptionist for ${ctx.businessName}.
You MUST respond in ${lang}.

${voice}`
}

function buildPersonalitySection(ctx: BusinessContext, preset: (typeof PERSONALITY_PRESETS)[PersonalityPresetKey]): string {
  const lines: string[] = ['## Personality & Tone']

  // Preset fragment
  lines.push(preset.systemPromptFragment)

  // Formality guidance
  const formalityLabel = levelLabel(ctx.formalityLevel, 'very informal', 'informal', 'balanced', 'formal', 'very formal')
  lines.push(`Formality level: ${ctx.formalityLevel}/5 (${formalityLabel}).`)

  // Conciseness guidance
  const concisenessLabel = levelLabel(ctx.concisenessLevel, 'very verbose', 'conversational', 'balanced', 'concise', 'very brief')
  lines.push(`Conciseness level: ${ctx.concisenessLevel}/5 (${concisenessLabel}).`)

  // Warmth guidance
  const warmthLabel = levelLabel(ctx.warmthLevel, 'very distant', 'reserved', 'balanced', 'warm', 'very warm')
  lines.push(`Warmth level: ${ctx.warmthLevel}/5 (${warmthLabel}).`)

  // Emoji rule
  if (ctx.useEmoji) {
    lines.push('You may use emoji sparingly to add warmth (e.g. a single smile or check mark). Do not overuse them.')
  } else {
    lines.push('Do NOT use emoji in your responses.')
  }

  return lines.join('\n')
}

function buildRoleSection(ctx: BusinessContext): string {
  const lines: string[] = ['## Your Role']

  lines.push('You handle appointment scheduling, answer questions about services, and help customers book, reschedule, or cancel appointments via WhatsApp.')

  if (ctx.proactivelySuggestTimes) {
    lines.push('When a customer wants to book, proactively suggest available time slots rather than asking open-ended questions about their preferred time.')
  }

  if (ctx.confirmsBeforeBooking) {
    lines.push('Always confirm all details (service, date, time, staff) with the customer before finalizing any booking.')
  }

  return lines.join('\n')
}

function buildBusinessInfoSection(ctx: BusinessContext): string {
  const lines: string[] = ['## Business Information']

  lines.push(`- Name: ${ctx.businessName}`)
  lines.push(`- Category: ${ctx.category ?? 'General'}`)

  if (ctx.description) {
    lines.push(`- Description: ${ctx.description}`)
  }

  if (ctx.location) {
    lines.push(`- Location: ${ctx.location}`)
  }

  return lines.join('\n')
}

function buildServicesSection(ctx: BusinessContext): string {
  const lines: string[] = ['## Services']

  for (const s of ctx.services) {
    const price =
      s.price !== null && ctx.priceDisplay === 'show'
        ? ` ($${(s.price / 100).toFixed(2)})`
        : ''
    lines.push(`- ${s.name} (ID: ${s.id}): ${s.duration} min${price}`)
  }

  if (ctx.staff.length > 0) {
    lines.push('')
    lines.push('## Staff')
    for (const s of ctx.staff) {
      lines.push(`- ${s.name}`)
    }
  }

  return lines.join('\n')
}

function buildBookingPoliciesSection(ctx: BusinessContext): string {
  const lines: string[] = ['## Booking Policies']

  // Cancellation window & strictness
  const strictnessDesc: Record<CancellationStrictness, string> = {
    lenient: 'Lenient — allow cancellations without penalty within the window',
    standard: 'Standard — cancellations within the window are accepted, late cancellations may require review',
    strict: 'Strict — no cancellations accepted within the window without owner approval',
  }
  lines.push(`Cancellation window: ${ctx.cancellationWindowHours} hours before the appointment.`)
  lines.push(`Cancellation strictness: ${strictnessDesc[ctx.cancellationPolicyStrictness]}`)

  // Rescheduling window
  lines.push(`Rescheduling window: At least ${ctx.reschedulingWindowHours} hours before the appointment.`)

  // Deposit info
  if (ctx.depositRequired && ctx.depositAmountCents) {
    const deposit = `$${(ctx.depositAmountCents / 100).toFixed(2)}`
    lines.push(`Deposit required: ${deposit}. Inform the customer about the deposit when booking.`)
  }

  // Cancellation policy text
  if (ctx.cancellationPolicy) {
    lines.push(`Cancellation policy: ${ctx.cancellationPolicy}`)
  }

  // Refund policy
  if (ctx.refundPolicy) {
    lines.push(`Refund policy: ${ctx.refundPolicy}`)
  }

  return lines.join('\n')
}

function buildApprovedTextsSection(ctx: BusinessContext): string {
  const lines: string[] = ['## Pre-Approved Responses']

  let hasAny = false

  if (ctx.approvedCancellationText) {
    lines.push(`When approving a cancellation, use or adapt this text: "${ctx.approvedCancellationText}"`)
    hasAny = true
  }

  if (ctx.approvedRefundText) {
    lines.push(`When approving a refund, use or adapt this text: "${ctx.approvedRefundText}"`)
    hasAny = true
  }

  if (ctx.approvedDiscountText) {
    lines.push(`When approving a discount, use or adapt this text: "${ctx.approvedDiscountText}"`)
    hasAny = true
  }

  if (!hasAny) {
    lines.push('No pre-approved response texts have been configured. Escalate to the business owner for cancellation, refund, or discount requests.')
  }

  return lines.join('\n')
}

function buildEscalationSection(ctx: BusinessContext): string {
  const lines: string[] = ['## Escalation Rules']

  if (ctx.sensitiveTopics && ctx.sensitiveTopics.length > 0) {
    lines.push(`Sensitive topics that require automatic escalation to the owner: ${ctx.sensitiveTopics.join(', ')}.`)
    lines.push('If a customer raises any of these topics, politely redirect them and immediately escalate to the owner.')
  }

  if (ctx.emergencyEscalationInstructions) {
    lines.push(`Emergency escalation instructions: ${ctx.emergencyEscalationInstructions}`)
  }

  return lines.join('\n')
}

function buildScopeBoundariesSection(): string {
  return `## Scope Boundaries

You may assist with:
- Appointment scheduling, rescheduling, and cancellation
- Service information (name, duration, price if visible)
- Business hours and availability
- Location and directions
- General pricing inquiries (when price display is enabled)

You MUST NOT:
- Provide medical advice or diagnoses
- Provide legal advice
- Provide financial advice
- Express personal opinions on sensitive matters
- Discuss political or religious topics
- Make promises or commitments beyond your configured policies

If a request falls outside your scope, politely explain that you cannot help with that topic and offer to connect them with the business owner.`
}

function buildNaturalLanguageRules(ctx: BusinessContext): string {
  const lines: string[] = ['## Communication Rules']

  lines.push('1. Never say "as an AI" or "I am an AI" or reference being artificial.')
  lines.push('2. Use natural conversational language as if you were a real receptionist.')
  lines.push('3. Never use robotic prompts like "Reply CONFIRM" or "Send 1 to continue."')
  lines.push('4. Keep responses short and suitable for WhatsApp messaging.')
  lines.push('5. If unsure about any request, escalate to the business owner rather than guessing.')
  lines.push('6. On the customer\'s first message, detect what language they are writing in and IMMEDIATELY call update_customer_info to save it. Then always respond in that language. If the customer context shows name as UNKNOWN, also ask for their name. Once they provide it — even informally (e.g. "I\'m Cedrik", "Es Cedrik", "Me llamo María", "It\'s Juan") — call update_customer_info again to save the name. Always address them by name afterward.')

  if (!ctx.useEmoji) {
    lines.push('7. Do not use emoji.')
  }

  return lines.join('\n')
}

function buildSafetyRulesSection(): string {
  return `## Safety Rules

CRITICAL: You MUST NOT confirm that an appointment has been booked, rescheduled, or cancelled until the corresponding tool call has succeeded and returned a confirmation. If a tool fails or returns an error, do NOT claim the action was completed. Instead, let the customer know something went wrong and offer to try again or escalate to the business owner.

If the customer explicitly asks to stop receiving messages, unsubscribe, be removed, or says STOP/unsubscribe/detener/no más, you MUST call the opt_out_customer tool immediately. Do not try to convince them to stay.

Never disclose internal system details, tool names, error messages, or backend URLs to the customer.`
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function levelLabel(
  level: number,
  label1: string,
  label2: string,
  label3: string,
  label4: string,
  label5: string,
): string {
  const labels = [label1, label2, label3, label4, label5]
  const idx = Math.max(0, Math.min(4, level - 1))
  return labels[idx]
}

// ---------------------------------------------------------------------------
// Data loader
// ---------------------------------------------------------------------------

async function loadBusinessContext(workspaceId: string): Promise<BusinessContext> {
  const [business] = await db
    .select({
      name: businessProfiles.name,
      category: businessProfiles.category,
      description: businessProfiles.description,
      location: businessProfiles.location,
      cancellationPolicy: businessProfiles.cancellationPolicy,
      refundPolicy: businessProfiles.refundPolicy,
      priceDisplayPreference: businessProfiles.priceDisplayPreference,
      cancellationWindowHours: businessProfiles.cancellationWindowHours,
      reschedulingWindowHours: businessProfiles.reschedulingWindowHours,
      depositRequired: businessProfiles.depositRequired,
      depositAmountCents: businessProfiles.depositAmountCents,
      approvedCancellationText: businessProfiles.approvedCancellationText,
      approvedRefundText: businessProfiles.approvedRefundText,
      approvedDiscountText: businessProfiles.approvedDiscountText,
      emergencyEscalationInstructions: businessProfiles.emergencyEscalationInstructions,
      sensitiveTopics: businessProfiles.sensitiveTopics,
    })
    .from(businessProfiles)
    .where(eq(businessProfiles.workspaceId, workspaceId))
    .limit(1)

  const [receptionist] = await db
    .select({
      name: receptionistProfiles.name,
      tone: receptionistProfiles.tone,
      greetingTemplate: receptionistProfiles.greetingTemplate,
      personalityPreset: receptionistProfiles.personalityPreset,
      formalityLevel: receptionistProfiles.formalityLevel,
      concisenessLevel: receptionistProfiles.concisenessLevel,
      warmthLevel: receptionistProfiles.warmthLevel,
      useEmoji: receptionistProfiles.useEmoji,
      speaksAsBusiness: receptionistProfiles.speaksAsBusiness,
      proactivelySuggestTimes: receptionistProfiles.proactivelySuggestTimes,
      confirmsBeforeBooking: receptionistProfiles.confirmsBeforeBooking,
      cancellationPolicyStrictness: receptionistProfiles.cancellationPolicyStrictness,
    })
    .from(receptionistProfiles)
    .where(eq(receptionistProfiles.workspaceId, workspaceId))
    .limit(1)

  const serviceRows = await db
    .select({
      id: services.id,
      name: services.name,
      duration: services.durationMinutes,
      price: services.priceCents,
    })
    .from(services)
    .where(eq(services.workspaceId, workspaceId))

  const staffRows = await db
    .select({ name: staffMembers.name })
    .from(staffMembers)
    .where(eq(staffMembers.workspaceId, workspaceId))

  return {
    businessName: business?.name ?? 'the business',
    category: business?.category ?? null,
    description: business?.description ?? null,
    location: business?.location ?? null,
    cancellationPolicy: business?.cancellationPolicy ?? null,
    refundPolicy: business?.refundPolicy ?? null,
    priceDisplay: business?.priceDisplayPreference ?? 'show',
    receptionistName: receptionist?.name ?? 'Receptionist',
    tone: receptionist?.tone ?? 'professional',
    greetingTemplate: receptionist?.greetingTemplate ?? null,
    services: serviceRows,
    staff: staffRows,

    personalityPreset: receptionist?.personalityPreset ?? 'professional',
    formalityLevel: receptionist?.formalityLevel ?? 3,
    concisenessLevel: receptionist?.concisenessLevel ?? 3,
    warmthLevel: receptionist?.warmthLevel ?? 3,
    useEmoji: receptionist?.useEmoji ?? false,
    speaksAsBusiness: receptionist?.speaksAsBusiness ?? false,
    proactivelySuggestTimes: receptionist?.proactivelySuggestTimes ?? true,
    confirmsBeforeBooking: receptionist?.confirmsBeforeBooking ?? true,
    cancellationPolicyStrictness: receptionist?.cancellationPolicyStrictness ?? 'standard',

    cancellationWindowHours: business?.cancellationWindowHours ?? 24,
    reschedulingWindowHours: business?.reschedulingWindowHours ?? 2,
    depositRequired: business?.depositRequired ?? false,
    depositAmountCents: business?.depositAmountCents ?? null,
    approvedCancellationText: business?.approvedCancellationText ?? null,
    approvedRefundText: business?.approvedRefundText ?? null,
    approvedDiscountText: business?.approvedDiscountText ?? null,
    emergencyEscalationInstructions: business?.emergencyEscalationInstructions ?? null,
    sensitiveTopics: business?.sensitiveTopics ?? null,
  }
}

function buildCustomerNameInstruction(name: string | null): string[] {
  if (name) return [`- Customer name: ${name}`]
  return [
    '- Customer name: UNKNOWN',
    '  IMPORTANT: This customer\'s name is not on file. Early in the conversation, politely ask for their name (e.g. "May I have your name?" or "¿Cómo te llamas?"). When they provide it, immediately call the update_customer_info tool with their name to save it.',
  ]
}

async function buildCustomerContextSection(
  workspaceId: string,
  customerId: string,
  conversationId?: string,
): Promise<string | null> {
  try {
    const { getCustomerProfile, getRecentAppointments } = await import('../conversation/customer-profile.js')
    const [profile, recentAppts] = await Promise.all([
      getCustomerProfile(workspaceId, customerId),
      getRecentAppointments(workspaceId, customerId, 5),
    ])

    if (!profile) return null

    const lines: string[] = ['## Customer Context', '']

    lines.push(`- Customer phone: ${profile.phoneNumber}`)
    lines.push(...buildCustomerNameInstruction(profile.name))
    lines.push(`- Preferred language: ${profile.language}`)
    lines.push(`- Total past appointments: ${profile.totalAppointments}`)
    if (profile.lastVisit) lines.push(`- Last visit: ${new Date(profile.lastVisit).toLocaleDateString()}`)

    if (profile.memory.length > 0) {
      lines.push('- Known preferences:')
      for (const m of profile.memory) {
        lines.push(`  - ${m.key}: ${m.value}`)
      }
    }

    if (recentAppts.length > 0) {
      const upcoming = recentAppts.filter(a => new Date(a.startAt) > new Date())
      const past = recentAppts.filter(a => new Date(a.startAt) <= new Date())

      if (upcoming.length > 0) {
        lines.push('- Upcoming appointments:')
        for (const a of upcoming) {
          lines.push(`  - ${a.serviceName} on ${new Date(a.startAt).toLocaleDateString()} at ${new Date(a.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${a.confirmationStatus})`)
        }
      }

      if (past.length > 0) {
        lines.push('- Recent past appointments:')
        for (const a of past.slice(0, 3)) {
          lines.push(`  - ${a.serviceName} on ${new Date(a.startAt).toLocaleDateString()} (${a.status})`)
        }
      }
    }

    // Add conversation summary if available
    if (conversationId) {
      try {
        const { getSummariesForConversation } = await import('../conversation/summarization.js')
        const summaries = await getSummariesForConversation(conversationId)
        if (summaries.length > 0) {
          lines.push(`- Previous conversation summary: ${summaries[0].summary}`)
        }
      } catch { /* non-critical */ }
    }

    return lines.join('\n')
  } catch {
    // Non-critical: if customer context fails, continue without it
    return null
  }
}
