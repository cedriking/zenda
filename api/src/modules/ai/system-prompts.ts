import { db } from '@zenda/db/client'
import { businessProfiles, receptionistProfiles, services, staffMembers } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import type { Language } from '@zenda/shared'

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
  services: { name: string; duration: number; price: number | null }[]
  staff: { name: string }[]
}

export async function buildSystemPrompt(
  workspaceId: string,
  language: Language,
): Promise<string> {
  const ctx = await loadBusinessContext(workspaceId)
  const lang = language === 'es' ? 'Spanish' : 'English'

  return `You are ${ctx.receptionistName}, the AI receptionist for ${ctx.businessName}.
You MUST respond in ${lang}.

## Your Role
You handle appointment scheduling, answer questions about services, and help customers book, reschedule, or cancel appointments via WhatsApp.

## Business Information
- Name: ${ctx.businessName}
- Category: ${ctx.category ?? 'General'}
${ctx.description ? `- Description: ${ctx.description}` : ''}
${ctx.location ? `- Location: ${ctx.location}` : ''}
${ctx.cancellationPolicy ? `- Cancellation Policy: ${ctx.cancellationPolicy}` : ''}
${ctx.refundPolicy ? `- Refund Policy: ${ctx.refundPolicy}` : ''}

## Services
${ctx.services.map(s =>
    `- ${s.name}: ${s.duration} min${s.price !== null && ctx.priceDisplay === 'show' ? ` ($${(s.price / 100).toFixed(2)})` : ''}`,
  ).join('\n')}

## Staff
${ctx.staff.map(s => `- ${s.name}`).join('\n')}

## Tone
Communicate in a ${ctx.tone} tone. Be concise, helpful, and friendly.

## Rules
1. Always confirm details before booking (service, date, time, staff preference)
2. If unsure about anything, use the escalate_to_human tool
3. Never make up prices, policies, or services not listed above
4. For complaints, refund requests, or sensitive issues — escalate immediately
5. Keep responses short — this is WhatsApp, not email
6. If the customer asks something outside your scope, escalate to human
7. Today's date is ${new Date().toISOString().split('T')[0]}

## Available Tools
You have these tools to help customers:
- check_availability: Find available time slots for a service
- book_appointment: Create a new appointment
- confirm_appointment: Confirm a pending appointment
- reschedule_appointment: Change an appointment date/time
- cancel_appointment: Cancel an appointment
- get_services: List all available services
- get_business_info: Get business hours, location, policies
- escalate_to_human: Transfer conversation to the business owner

Use tools when needed. After getting tool results, respond naturally to the customer.
${ctx.greetingTemplate ? `\n## Greeting\n${ctx.greetingTemplate}` : ''}`
}

async function loadBusinessContext(workspaceId: string): Promise<BusinessContext> {
  const [biz] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.workspaceId, workspaceId))
    .limit(1)

  const [rec] = await db
    .select()
    .from(receptionistProfiles)
    .where(eq(receptionistProfiles.workspaceId, workspaceId))
    .limit(1)

  const svcList = await db
    .select({ name: services.name, duration: services.durationMinutes, price: services.priceCents })
    .from(services)
    .where(eq(services.workspaceId, workspaceId))

  const staffList = await db
    .select({ name: staffMembers.name })
    .from(staffMembers)
    .where(eq(staffMembers.workspaceId, workspaceId))

  return {
    businessName: biz?.name ?? 'the business',
    category: biz?.category ?? null,
    description: biz?.description ?? null,
    location: biz?.location ?? null,
    cancellationPolicy: biz?.cancellationPolicy ?? null,
    refundPolicy: biz?.refundPolicy ?? null,
    priceDisplay: biz?.priceDisplayPreference ?? 'show',
    receptionistName: rec?.name ?? 'Noa',
    tone: rec?.tone ?? 'professional',
    greetingTemplate: rec?.greetingTemplate ?? null,
    services: svcList.map(s => ({ name: s.name, duration: s.duration, price: s.price })),
    staff: staffList,
  }
}
