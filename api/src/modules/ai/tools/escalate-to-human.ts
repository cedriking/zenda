import { db } from '@zenda/db/client'
import { conversations } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import type { EscalationReason } from '@zenda/shared'

interface ToolInput {
  reason: EscalationReason
  message: string
}

export async function escalateToHuman(
  workspaceId: string,
  conversationId: string,
  input: ToolInput,
) {
  // Update conversation mode to needs_attention
  await db
    .update(conversations)
    .set({
      mode: 'needs_attention',
      needsAttentionReason: input.reason,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId))

  return {
    escalated: true,
    reason: input.reason,
    message: 'Conversation transferred to human. The business owner will respond shortly.',
  }
}

export const escalateToHumanToolDef = {
  type: 'function' as const,
  function: {
    name: 'escalate_to_human',
    description: 'Transfer conversation to the business owner. Use for complaints, refund requests, unclear questions, or sensitive issues.',
    parameters: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          enum: [
            'customer_requested_human', 'unknown_question', 'discount_request',
            'price_dispute', 'refund_request', 'angry_customer',
            'medical_legal_financial', 'sensitive_info', 'unlisted_service',
            'outside_rules', 'emergency', 'low_confidence', 'technology_question',
          ],
          description: 'Reason for escalation',
        },
        message: { type: 'string', description: 'Brief explanation of why escalation is needed' },
      },
      required: ['reason'],
    },
  },
}
