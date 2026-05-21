import { db } from '@zenda/db/client'
import { agentMemory } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'

interface MemoryEntry {
  key: string
  value: string
  source: 'ai_extraction' | 'owner_note' | 'system'
}

export async function storeMemory(
  workspaceId: string,
  customerId: string,
  entries: MemoryEntry[],
): Promise<void> {
  for (const entry of entries) {
    await db.insert(agentMemory).values({
      workspaceId,
      customerId,
      key: entry.key,
      value: entry.value,
      source: entry.source,
    }).onConflictDoUpdate({
      target: [agentMemory.workspaceId, agentMemory.customerId, agentMemory.key],
      set: { value: entry.value, updatedAt: new Date() },
    })
  }
}

export async function getMemoryForCustomer(
  workspaceId: string,
  customerId: string,
): Promise<Array<{ key: string; value: string; source: string }>> {
  const records = await db
    .select()
    .from(agentMemory)
    .where(and(
      eq(agentMemory.workspaceId, workspaceId),
      eq(agentMemory.customerId, customerId),
    ))

  return records.map(r => ({
    key: r.key,
    value: r.value,
    source: r.source,
  }))
}

export async function extractMemoryFromConversation(
  workspaceId: string,
  customerId: string,
  messages: Array<{ role: string; content: string }>,
): Promise<void> {
  // Only extract from customer messages that have substance
  const customerMessages = messages
    .filter(m => m.role === 'customer' && m.content.length > 10)
    .map(m => m.content)

  if (customerMessages.length === 0) return

  const text = customerMessages.slice(-5).join('\n')
  const lowerText = text.toLowerCase()
  const preferences: MemoryEntry[] = []

  // Time preferences
  const timePatterns = [
    { pattern: /\b(morning|mañana|temprano)\b/i, key: 'preferred_time', value: 'morning' },
    { pattern: /\b(afternoon|tarde)\b/i, key: 'preferred_time', value: 'afternoon' },
    { pattern: /\b(evening|noche)\b/i, key: 'preferred_time', value: 'evening' },
  ]
  for (const { pattern, key, value } of timePatterns) {
    if (pattern.test(lowerText)) {
      preferences.push({ key, value, source: 'ai_extraction' })
      break
    }
  }

  // Staff preferences — "with Maria", "con Juan"
  const staffMatch = text.match(/(?:with|con|prefer|prefiero|quiero)\s+(?:a\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/)
  if (staffMatch) {
    preferences.push({ key: 'preferred_staff', value: staffMatch[1], source: 'ai_extraction' })
  }

  // Service preferences — "always get a haircut", "suelo pedir corte"
  const serviceMatch = text.match(/(?:always|usually|suelo|siempre)\s+(?:get|do|hacer|hago)\s+(.{3,40}?)(?:\.|,|$)/i)
  if (serviceMatch) {
    preferences.push({ key: 'preferred_service', value: serviceMatch[1].trim(), source: 'ai_extraction' })
  }

  // Communication style
  if (/\b(?:por favor|please|gracias|thanks|thank you)\b/i.test(lowerText)) {
    preferences.push({ key: 'communication_style', value: 'polite', source: 'ai_extraction' })
  }

  if (preferences.length > 0) {
    await storeMemory(workspaceId, customerId, preferences)
    logger.info('Extracted memory', { workspaceId, customerId, count: preferences.length })
  }
}
