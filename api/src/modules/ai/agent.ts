import { db } from '@zenda/db/client'
import { messages } from '@zenda/db/schema'
import { eq, desc } from 'drizzle-orm'
import { selectModel, getProviderClient } from './provider-router.js'
import { buildSystemPrompt } from './system-prompts.js'
import {
  checkAvailability, checkAvailabilityToolDef,
  bookAppointment, bookAppointmentToolDef,
  confirmAppointment, confirmAppointmentToolDef,
  rescheduleAppointment, rescheduleAppointmentToolDef,
  cancelAppointment, cancelAppointmentToolDef,
  getServices, getServicesToolDef,
  getBusinessInfo, getBusinessInfoToolDef,
  escalateToHuman, escalateToHumanToolDef,
} from './tools/index.js'
import { sanitizeCustomerMessage, isEmergencyMessage } from './input-guard.js'
import { classifyIntent } from './intent-classifier.js'
import { logInputSanitized, logToolFailure } from '../audit/logger.js'
import { logger } from '../../infra/logger.js'
import type { Language, AIProvider } from '@zenda/shared'

interface AgentResponse {
  text: string
  language: Language
  provider: AIProvider
  model: string
  toolCalls?: unknown[]
}

interface ToolCall {
  id: string
  function: { name: string; arguments: string }
}

const ALL_TOOLS = [
  checkAvailabilityToolDef,
  bookAppointmentToolDef,
  confirmAppointmentToolDef,
  rescheduleAppointmentToolDef,
  cancelAppointmentToolDef,
  getServicesToolDef,
  getBusinessInfoToolDef,
  escalateToHumanToolDef,
]

const MAX_ITERATIONS = 3

// Per-customer rate limiting (max 10 messages per minute)
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 10
const customerMessageTimestamps = new Map<string, number[]>()

function isRateLimited(customerId: string): boolean {
  const now = Date.now()
  const timestamps = customerMessageTimestamps.get(customerId) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  customerMessageTimestamps.set(customerId, [...recent, now])
  return recent.length >= RATE_LIMIT_MAX
}

export async function runAgent(
  workspaceId: string,
  conversationId: string,
  customerId: string,
  userMessage: string,
  language: Language,
): Promise<AgentResponse | null> {
  try {
    // 0. Per-customer rate limit check
    if (isRateLimited(customerId)) {
      logger.warn('Customer rate limited', { workspaceId, customerId })
      return {
        text: language === 'es'
          ? 'Estoy recibiendo muchos mensajes tuyos. Por favor espera un momento y vuelve a escribir.'
          : "I'm receiving a lot of messages from you. Please wait a moment and try again.",
        language,
        provider: 'system',
        model: 'rate-limit',
      }
    }

    // 1. Build system prompt with business context + customer context
    const systemPrompt = await buildSystemPrompt(workspaceId, language, customerId, conversationId)

    // 2. Sanitize customer input
    const { sanitized, wasModified, flags } = sanitizeCustomerMessage(userMessage)
    if (wasModified) {
      logger.warn('Customer message sanitized', { workspaceId, conversationId, flags })
      await logInputSanitized(workspaceId, conversationId, flags, userMessage)
    }

    // 3. Emergency detection — bypass LLM for safety-critical messages (S21)
    if (isEmergencyMessage(sanitized)) {
      logger.info('Emergency message detected, routing directly', { workspaceId, conversationId })
      await escalateToHuman(workspaceId, conversationId, {
        reason: 'Emergency keywords detected in customer message',
      } as any)
      return {
        text: language === 'es'
          ? 'Parece que necesitas ayuda urgente. Te estoy conectando con el equipo ahora mismo.'
          : "It sounds like you need urgent help. I'm connecting you with the team right away.",
        language,
        provider: 'system',
        model: 'emergency-route',
      }
    }

    // 4. Classify intent for context enrichment
    const intentResult = classifyIntent(sanitized)
    logger.info('Intent classified', { workspaceId, conversationId, intent: intentResult.intent, confidence: intentResult.confidence })

    // Short-circuit opt-out intent — bypass LLM (S8)
    if (intentResult.intent === 'opt_out' && intentResult.confidence >= 0.9) {
      const { optOut } = await import('../messaging/consent-service.js')
      const confirmationText = await optOut(workspaceId, customerId)
      return {
        text: confirmationText,
        language,
        provider: 'system',
        model: 'opt-out-route',
      }
    }

    // 5. Load recent conversation history
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(20)

    const chatMessages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string }> = [
      { role: 'system', content: systemPrompt },
    ]

    // Add history in chronological order
    const reversed = history.reverse()
    for (const msg of reversed) {
      if (msg.senderType === 'customer') {
        chatMessages.push({ role: 'user', content: msg.body })
      } else if (msg.senderType === 'ai') {
        chatMessages.push({ role: 'assistant', content: msg.body })
      }
    }

    // Add the sanitized user message with intent context hint
    if (intentResult.intent !== 'ambiguous' && intentResult.confidence >= 0.7) {
      chatMessages.push({ role: 'user', content: `[Intent: ${intentResult.intent}]\n${sanitized}` })
    } else {
      chatMessages.push({ role: 'user', content: sanitized })
    }

    // 6. Select model for response generation
    const modelConfig = selectModel({
      task: 'response_generation',
      plan: 'pro',
      language,
    })

    const provider = await getProviderClient(modelConfig.provider)

    // 7. Agent loop: call LLM -> execute tools -> repeat
    let iterations = 0
    let lastResult = await provider.chat(modelConfig.model, chatMessages, ALL_TOOLS, modelConfig.maxTokens)

    while (lastResult.toolCalls?.length && iterations < MAX_ITERATIONS) {
      iterations++

      // Add assistant's tool call message with tool_calls for API compatibility
      const assistantMsg: Record<string, unknown> = {
        role: 'assistant',
        content: lastResult.text,
      }
      if (lastResult.toolCalls?.length) {
        assistantMsg.tool_calls = lastResult.toolCalls.map((tc: ToolCall) => ({
          id: tc.id,
          type: 'function',
          function: tc.function,
        }))
      }
      chatMessages.push(assistantMsg as any)

      // Execute each tool call
      for (const tc of lastResult.toolCalls) {
        let toolResult: string
        try {
          const args = JSON.parse(tc.function.arguments)
          toolResult = JSON.stringify(
            await executeTool(tc.function.name, workspaceId, conversationId, customerId, args, language),
          )
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Tool execution failed'
          logger.error('Tool execution failed', { workspaceId, toolName: tc.function.name, error: errMsg })
          await logToolFailure(workspaceId, tc.function.name, errMsg).catch(() => {})
          toolResult = JSON.stringify({
            error: errMsg,
            // Signal that the agent should consider escalating to a human,
            // unless the tool itself is the escalation handler.
            ...(tc.function.name !== 'escalate_to_human' ? { shouldEscalate: true } : {}),
          })
        }

        chatMessages.push({
          role: 'tool',
          content: toolResult,
          tool_call_id: tc.id,
        })
      }

      // Call again with tool results
      lastResult = await provider.chat(modelConfig.model, chatMessages, ALL_TOOLS, modelConfig.maxTokens)
    }

    if (!lastResult.text) {
      logger.warn('Agent produced no text', { workspaceId, conversationId })
      return null
    }

    return {
      text: lastResult.text,
      language,
      provider: lastResult.provider,
      model: lastResult.model,
      toolCalls: lastResult.toolCalls,
    }
  } catch (error) {
    logger.error('Agent error', {
      workspaceId,
      conversationId,
      error: error instanceof Error ? error.message : String(error),
    })
    return null
  }
}

async function executeTool(
  name: string,
  workspaceId: string,
  conversationId: string,
  customerId: string,
  args: Record<string, unknown>,
  language: Language,
): Promise<unknown> {
  switch (name) {
    case 'check_availability':
      return checkAvailability(workspaceId, args as any, language)

    case 'book_appointment':
      return bookAppointment(workspaceId, { ...args, customerId } as any, conversationId, language)

    case 'confirm_appointment':
      return confirmAppointment(workspaceId, args as any)

    case 'reschedule_appointment':
      return rescheduleAppointment(workspaceId, args as any, language)

    case 'cancel_appointment':
      return cancelAppointment(workspaceId, args as any, language)

    case 'get_services':
      return getServices(workspaceId)

    case 'get_business_info':
      return getBusinessInfo(workspaceId)

    case 'escalate_to_human':
      return escalateToHuman(workspaceId, conversationId, args as any)

    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
