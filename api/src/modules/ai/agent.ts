import { db } from "@zenda/db/client";
import type { AIProvider, Language, PlanTier } from "@zenda/shared";
import { logger } from "../../infra/logger.js";
import { redis } from "../../infra/redis.js";
import { logInputSanitized, logToolFailure } from "../audit/logger.js";
import { isEmergencyMessage, sanitizeCustomerMessage } from "./input-guard.js";
import { getProviderClient, selectModel } from "./provider-router.js";
import { buildSystemPrompt } from "./system-prompts.js";
import { checkToolSendingPolicy } from "./tool-sending-guard.js";
import {
  bookAppointment,
  bookAppointmentToolDef,
  cancelAppointment,
  cancelAppointmentToolDef,
  checkAvailability,
  checkAvailabilityToolDef,
  confirmAppointment,
  confirmAppointmentToolDef,
  escalateToHuman,
  escalateToHumanToolDef,
  getBusinessInfo,
  getBusinessInfoToolDef,
  getServices,
  getServicesToolDef,
  optOutCustomer,
  optOutCustomerToolDef,
  rescheduleAppointment,
  rescheduleAppointmentToolDef,
  updateCustomerInfo,
  updateCustomerInfoToolDef,
} from "./tools/index.js";

interface AgentResponse {
  language: Language;
  model: string;
  provider: AIProvider;
  text: string;
  toolCalls?: unknown[];
}

interface ToolCall {
  function: { name: string; arguments: string };
  id: string;
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
  updateCustomerInfoToolDef,
  optOutCustomerToolDef,
];

const MAX_ITERATIONS = 6;
const AGENT_LOOP_TIMEOUT_MS = 60_000;
const MAX_CONTEXT_MESSAGES = 40;

// Per-customer rate limiting (max 10 messages per minute) via Redis
const RATE_LIMIT_WINDOW_S = 60;
const RATE_LIMIT_MAX = 10;

// Lua script for atomic INCR + conditional EXPIRE — avoids the race condition
// where INCR returns 1 but EXPIRE fails or a concurrent INCR happens first.
const RATE_LIMIT_SCRIPT = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return count
`;

async function isRateLimited(customerId: string): Promise<boolean> {
  const key = `rl:ai:${customerId}`;
  try {
    const count = (await redis.eval(
      RATE_LIMIT_SCRIPT,
      1,
      key,
      RATE_LIMIT_WINDOW_S
    )) as number;
    return count > RATE_LIMIT_MAX;
  } catch (err) {
    // On Redis failure, allow request through (fail-open)
    logger.error("AI rate limit Redis error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: pre-existing; refactor tracked separately
export async function runAgent(
  workspaceId: string,
  conversationId: string,
  customerId: string,
  userMessage: string,
  language: Language,
  localTime?: string,
  localTimezone?: string
): Promise<AgentResponse | null> {
  try {
    // 0. Per-customer rate limit check
    if (await isRateLimited(customerId)) {
      logger.warn("Customer rate limited", { workspaceId, customerId });
      return {
        text:
          language === "es"
            ? "Estoy recibiendo muchos mensajes tuyos. Por favor espera un momento y vuelve a escribir."
            : "I'm receiving a lot of messages from you. Please wait a moment and try again.",
        language,
        provider: "system",
        model: "rate-limit",
      };
    }

    // 1. Build system prompt with business context + customer context
    const systemPrompt = await buildSystemPrompt(
      workspaceId,
      language,
      customerId,
      conversationId,
      localTime,
      localTimezone
    );

    // 2. Sanitize customer input
    const { sanitized, wasModified, flags } =
      sanitizeCustomerMessage(userMessage);
    if (wasModified) {
      logger.warn("Customer message sanitized", {
        workspaceId,
        conversationId,
        flags,
      });
      await logInputSanitized(workspaceId, conversationId, flags, userMessage);
    }

    // 3. Emergency detection — bypass LLM for safety-critical messages (S21)
    if (isEmergencyMessage(sanitized)) {
      logger.info("Emergency message detected, routing directly", {
        workspaceId,
        conversationId,
      });
      await escalateToHuman(workspaceId, conversationId, {
        reason: "Emergency keywords detected in customer message",
        // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch in escalateToHuman
      } as any);
      return {
        text:
          language === "es"
            ? "Parece que necesitas ayuda urgente. Te estoy conectando con el equipo ahora mismo."
            : "It sounds like you need urgent help. I'm connecting you with the team right away.",
        language,
        provider: "system",
        model: "emergency-route",
      };
    }

    // 4. Load recent conversation history
    const history = await db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const chatMessages: Array<{
      role: "system" | "user" | "assistant" | "tool";
      content: string;
      tool_call_id?: string;
    }> = [{ role: "system", content: systemPrompt }];

    // Add history in chronological order (including tool-call sequences)
    const reversed = history.reverse();
    for (const msg of reversed) {
      if (msg.senderType === "customer") {
        chatMessages.push({ role: "user", content: msg.body });
      } else if (msg.senderType === "ai") {
        // Include AI messages that may carry tool_calls in their metadata
        const assistantMsg: Record<string, unknown> = {
          role: "assistant",
          content: msg.body,
        };
        // Reconstruct tool_calls from metadata if present
        const toolCallsData = (msg as Record<string, unknown>).toolCalls;
        if (Array.isArray(toolCallsData)) {
          assistantMsg.tool_calls = toolCallsData;
        }
        // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
        chatMessages.push(assistantMsg as any);
      }
    }

    // Add the sanitized user message — let the AI decide intent from context
    chatMessages.push({ role: "user", content: sanitized });

    // 6. Get workspace plan and select model for response generation
    const sub = await db.subscription.findFirst({
      where: { workspaceId },
      select: { planTier: true },
    });
    const planTier: PlanTier = (sub?.planTier as PlanTier) ?? "local_solo";

    const modelConfig = selectModel({
      task: "response_generation",
      plan: planTier,
      language,
    });

    const provider = await getProviderClient(modelConfig.provider);

    // 7. Agent loop: call LLM -> execute tools -> repeat
    let iterations = 0;
    const loopStartTime = Date.now();
    let lastResult = await provider.chat(
      modelConfig.model,
      chatMessages,
      ALL_TOOLS,
      modelConfig.maxTokens
    );

    while (lastResult.toolCalls?.length && iterations < MAX_ITERATIONS) {
      iterations++;

      // Timeout guard: break if the loop has been running too long
      if (Date.now() - loopStartTime > AGENT_LOOP_TIMEOUT_MS) {
        logger.warn("Agent loop timeout exceeded", {
          workspaceId,
          conversationId,
          iterations,
        });
        return {
          text:
            language === "es"
              ? "Lo siento, estoy tardando demasiado en procesar tu solicitud. Un momento por favor."
              : "I'm sorry, I'm taking too long to process your request. Please try again shortly.",
          language,
          provider: "system",
          model: "timeout-fallback",
        };
      }

      // Context window guard: trim oldest non-system messages if over limit
      if (chatMessages.length > MAX_CONTEXT_MESSAGES) {
        const systemMsg = chatMessages[0];
        const rest = chatMessages.slice(1);
        const trimmed = rest.slice(rest.length - (MAX_CONTEXT_MESSAGES - 1));
        chatMessages.length = 0;
        chatMessages.push(systemMsg);
        chatMessages.push(...trimmed);
        logger.debug("Agent context trimmed", {
          workspaceId,
          messageCount: chatMessages.length,
        });
      }

      // Add assistant's tool call message with tool_calls for API compatibility
      const assistantMsg: Record<string, unknown> = {
        role: "assistant",
        content: lastResult.text,
      };
      if (lastResult.toolCalls?.length) {
        assistantMsg.tool_calls = lastResult.toolCalls.map((tc: ToolCall) => ({
          id: tc.id,
          type: "function",
          function: tc.function,
        }));
      }
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch in chat message
      chatMessages.push(assistantMsg as any);

      // Execute each tool call
      for (const tc of lastResult.toolCalls) {
        let toolResult: string;
        try {
          const args = JSON.parse(tc.function.arguments);
          toolResult = JSON.stringify(
            await executeTool(
              tc.function.name,
              workspaceId,
              conversationId,
              customerId,
              args,
              language
            )
          );
        } catch (err) {
          const errMsg =
            err instanceof Error ? err.message : "Tool execution failed";
          logger.error("Tool execution failed", {
            workspaceId,
            toolName: tc.function.name,
            error: errMsg,
          });
          await logToolFailure(workspaceId, tc.function.name, errMsg).catch(
            () => {} // intentionally swallowing log failure
          );
          toolResult = JSON.stringify({
            error: errMsg,
            // Signal that the agent should consider escalating to a human,
            // unless the tool itself is the escalation handler.
            ...(tc.function.name === "escalate_to_human"
              ? {}
              : { shouldEscalate: true }),
          });
        }

        chatMessages.push({
          role: "tool",
          content: toolResult,
          tool_call_id: tc.id,
        });
      }

      // Call again with tool results
      lastResult = await provider.chat(
        modelConfig.model,
        chatMessages,
        ALL_TOOLS,
        modelConfig.maxTokens
      );
    }

    if (!lastResult.text) {
      logger.warn("Agent produced no text", { workspaceId, conversationId });
      return null;
    }

    return {
      text: lastResult.text,
      language,
      provider: lastResult.provider,
      model: lastResult.model,
      toolCalls: lastResult.toolCalls,
    };
  } catch (error) {
    logger.error("Agent error", {
      workspaceId,
      conversationId,
      customerId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      phase: "agent_loop",
    });
    return null;
  }
}

async function executeTool(
  name: string,
  workspaceId: string,
  conversationId: string,
  customerId: string,
  args: Record<string, unknown>,
  language: Language
): Promise<unknown> {
  // Sending policy gate — check before executing outbound-triggering tools
  const policyDenial = await checkToolSendingPolicy(
    name,
    workspaceId,
    customerId
  );
  if (policyDenial) {
    return {
      error: `Sending policy prevents this action: ${policyDenial.reason}`,
      policyDenied: true,
      toolName: policyDenial.toolName,
      purpose: policyDenial.purpose,
      hint: "Inform the customer honestly. Do not retry or bypass.",
    };
  }

  switch (name) {
    case "check_availability":
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
      return checkAvailability(workspaceId, args as any, language);

    case "book_appointment":
      return bookAppointment(
        workspaceId,
        // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
        { ...args, customerId } as any,
        conversationId,
        language
      );

    case "confirm_appointment":
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
      return confirmAppointment(workspaceId, args as any);

    case "reschedule_appointment":
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
      return rescheduleAppointment(workspaceId, args as any, language);

    case "cancel_appointment":
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
      return cancelAppointment(workspaceId, args as any, language);

    case "get_services":
      return getServices(workspaceId);

    case "get_business_info":
      return getBusinessInfo(workspaceId);

    case "escalate_to_human":
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
      return escalateToHuman(workspaceId, conversationId, args as any);

    case "update_customer_info":
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
      return updateCustomerInfo(workspaceId, { ...args, customerId } as any);

    case "opt_out_customer":
      // biome-ignore lint/suspicious/noExplicitAny: pre-existing type mismatch
      return optOutCustomer(workspaceId, customerId, args as any, language);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
