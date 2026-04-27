import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { conversations, messages, conversationSummaries } from '@zenda/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { authPlugin } from '../../middleware/auth.js'
import { workspaceContext } from '../../middleware/workspace-context.js'
import { logger } from '../../infra/logger.js'

export const conversationModule = new Elysia({ prefix: '/conversations' })
  .use(authPlugin)
  .use(workspaceContext)
  .requireAuth(true)
  .requireWorkspace(true)

  // List conversations
  .get('/', async ({ workspaceId, query }) => {
    const { mode, limit = '50', offset = '0' } = query as Record<string, string>
    const conditions = [eq(conversations.workspaceId, workspaceId!)]

    if (mode) conditions.push(eq(conversations.mode, mode))

    return db
      .select()
      .from(conversations)
      .where(and(...conditions))
      .orderBy(desc(conversations.lastMessageAt))
      .limit(Number(limit))
      .offset(Number(offset))
  })

  // Get conversation by ID
  .get('/:id', async ({ workspaceId, params }) => {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, params.id), eq(conversations.workspaceId, workspaceId!)))
      .limit(1)
    if (!conv) return { error: 'Conversation not found' }
    return conv
  })

  // Get messages for a conversation
  .get('/:id/messages', async ({ workspaceId, params, query }) => {
    const { limit = '50', offset = '0' } = query as Record<string, string>

    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, params.id), eq(conversations.workspaceId, workspaceId!)))
      .limit(1)
    if (!conv) return { error: 'Conversation not found' }

    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, params.id))
      .orderBy(desc(messages.createdAt))
      .limit(Number(limit))
      .offset(Number(offset))
  })

  // Update conversation mode (takeover / return to auto)
  .patch('/:id/mode', async ({ workspaceId, params, body }) => {
    const { mode } = body as { mode: string }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, params.id), eq(conversations.workspaceId, workspaceId!)))
      .limit(1)
    if (!conv) return { error: 'Conversation not found' }

    const updates: Record<string, unknown> = {
      mode,
      needsAttentionReason: mode === 'auto' ? null : conv.needsAttentionReason,
      updatedAt: new Date(),
    }

    // When returning to auto, generate a summary from recent messages
    if (mode === 'auto' && (conv.mode === 'human_takeover' || conv.mode === 'needs_attention')) {
      try {
        const recentMessages = await db
          .select()
          .from(messages)
          .where(eq(messages.conversationId, params.id))
          .orderBy(desc(messages.createdAt))
          .limit(20)

        if (recentMessages.length > 0) {
          const summaryText = recentMessages
            .reverse()
            .map(m => `[${m.senderType}]: ${m.body}`)
            .join('\n')
            .slice(0, 2000)

          await db.insert(conversationSummaries).values({
            conversationId: params.id,
            summary: `Human takeover ended. Last ${recentMessages.length} messages summarized.`,
            keyTopics: [],
            extractedPreferences: {},
          })

          updates.summary = `Human took over from ${conv.mode}. Summary saved with ${recentMessages.length} messages.`
          logger.info('Conversation summary generated', { conversationId: params.id })
        }
      } catch (err) {
        logger.warn('Failed to generate summary', { conversationId: params.id, error: (err as Error).message })
      }
    }

    const [updated] = await db
      .update(conversations)
      .set(updates)
      .where(eq(conversations.id, params.id))
      .returning()

    return updated
  }, {
    body: t.Object({
      mode: t.String(),
    }),
  })

  // Send owner message in a conversation
  .post('/:id/messages', async ({ workspaceId, params, body }) => {
    const { text } = body as { text: string }

    const [conv] = await db
      .select()
      .from(conversations)
      .where(and(eq(conversations.id, params.id), eq(conversations.workspaceId, workspaceId!)))
      .limit(1)
    if (!conv) return { error: 'Conversation not found' }

    const [msg] = await db
      .insert(messages)
      .values({
        conversationId: params.id,
        workspaceId: workspaceId!,
        senderType: 'owner',
        contentType: 'text',
        body: text,
        language: conv.language,
        status: 'queued',
      })
      .returning()

    await db
      .update(conversations)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(conversations.id, params.id))

    return msg
  }, {
    body: t.Object({
      text: t.String(),
    }),
  })
