import { db } from '@zenda/db/client'
import { messages, conversationSummaries } from '@zenda/db/schema'
import { eq, desc } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'

const SUMMARY_THRESHOLD = 20

export async function shouldSummarize(conversationId: string): Promise<boolean> {
  const recentMessages = await db
    .select({ id: messages.id })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(SUMMARY_THRESHOLD + 1)

  return recentMessages.length >= SUMMARY_THRESHOLD
}

export async function generateAndStoreSummary(
  conversationId: string,
  _workspaceId: string,
  language: 'en' | 'es' = 'es',
): Promise<void> {
  const recentMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(SUMMARY_THRESHOLD)

  if (recentMessages.length < SUMMARY_THRESHOLD) return

  const messageTexts = recentMessages
    .reverse()
    .map(m => `${m.senderType}: ${m.body}`)
    .join('\n')

  const summaryText = generateSimpleSummary(messageTexts, language)

  await db.insert(conversationSummaries).values({
    conversationId,
    summary: summaryText,
  })

  logger.info('Conversation summarized', { conversationId })
}

function generateSimpleSummary(text: string, language: 'en' | 'es'): string {
  const lines = text.split('\n').slice(-10)
  if (language === 'es') {
    return `Resumen de conversación: ${lines.length} mensajes recientes. ${lines.slice(0, 3).join('. ')}`
  }
  return `Conversation summary: ${lines.length} recent messages. ${lines.slice(0, 3).join('. ')}`
}

export async function getSummariesForConversation(conversationId: string) {
  return db
    .select()
    .from(conversationSummaries)
    .where(eq(conversationSummaries.conversationId, conversationId))
    .orderBy(desc(conversationSummaries.createdAt))
}
