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
  // Simple extraction: look for preferences in the conversation
  // In production, this would use an LLM call for extraction
  const preferences: MemoryEntry[] = []

  const lowerText = messages.map(m => m.content.toLowerCase()).join(' ')

  // Detect common preferences
  const timePatterns = [
    { pattern: /morning|mañana/i, key: 'preferred_time', value: 'morning' },
    { pattern: /afternoon|tarde/i, key: 'preferred_time', value: 'afternoon' },
    { pattern: /evening|noche/i, key: 'preferred_time', value: 'evening' },
  ]

  for (const { pattern, key, value } of timePatterns) {
    if (pattern.test(lowerText)) {
      preferences.push({ key, value, source: 'ai_extraction' })
    }
  }

  if (preferences.length > 0) {
    await storeMemory(workspaceId, customerId, preferences)
    logger.info('Extracted memory', { workspaceId, customerId, count: preferences.length })
  }
}
