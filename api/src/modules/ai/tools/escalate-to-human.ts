/**
 * Tool: escalate_to_human
 *
 * Safety constraints:
 * - DB updates (conversation mode + escalation record) run BEFORE the return statement.
 * - This is the escalation escape hatch — tool failures in other tools signal
 *   shouldEscalate: true so the agent knows to invoke this tool.
 * - Sending policy is enforced at the agent layer, not bypassed here.
 */
import { db } from "@zenda/db/client";
import { conversations, escalations } from "@zenda/db/schema";
import type { EscalationReason } from "@zenda/shared";
import { eq } from "drizzle-orm";
import { logger } from "../../../infra/logger.js";
import { logEscalationCreated } from "../../audit/logger.js";
import { createNotification } from "../../notification/service.js";

interface ToolInput {
  message: string;
  reason: EscalationReason;
}

const ESCALATION_TRIGGER_MAP: Record<string, EscalationReason> = {
  upset_customer: "angry_customer",
  out_of_scope: "outside_rules",
  sensitive_topic: "sensitive_info",
  tool_failure: "technology_question",
  complex_policy: "custom_exception",
  refund_request: "refund_request",
  emergency: "emergency",
  ambiguous_request: "unknown_question",
};

function normalizeReason(
  trigger: string,
  fallbackReason: EscalationReason
): EscalationReason {
  return ESCALATION_TRIGGER_MAP[trigger] ?? fallbackReason;
}

function getEscalationResponse(
  reason: EscalationReason,
  language: "en" | "es" = "es"
): string {
  if (reason === "emergency") {
    return language === "es"
      ? "Entiendo que es una situacion urgente. Si se trata de una emergencia medica, por favor llama al 911 o acude al centro medico mas cercano. Voy a conectarle inmediatamente con alguien del equipo."
      : "I understand this is urgent. If this is a medical emergency, please call 911 or go to the nearest emergency room. Let me connect you with someone from the team right away.";
  }

  const responses: Record<"en" | "es", string> =
    language === "es"
      ? {
          en: "",
          es: "Voy a conectarle con alguien del equipo que puede ayudarle con eso. Un momento, por favor.",
        }
      : {
          en: "Let me connect you with someone from the team who can help with that. One moment, please.",
          es: "",
        };

  return responses[language];
}

export async function escalateToHuman(
  workspaceId: string,
  conversationId: string,
  input: ToolInput,
  language: "en" | "es" = "es"
) {
  const reason = normalizeReason(input.reason, input.reason);
  const isEmergency = reason === "emergency";

  // 1. Update conversation mode to needs_attention
  await db
    .update(conversations)
    .set({
      mode: "needs_attention",
      needsAttentionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  // 2. Create escalation record in escalations table
  const [escalation] = await db
    .insert(escalations)
    .values({
      conversationId,
      workspaceId,
      reason,
      status: "open",
    })
    .returning();

  logEscalationCreated(workspaceId, conversationId, reason).catch(() => {});

  // 3. Notify business owner via notification service
  const notificationTitle = isEmergency
    ? "URGENT: Emergency escalation"
    : "Conversation needs your attention";

  const notificationBody = isEmergency
    ? `Emergency escalation in conversation. Customer message: ${input.message?.slice(0, 200) ?? "(no details)"}`
    : `Escalation (${reason}): ${input.message?.slice(0, 200) ?? "(no details)"}`;

  await createNotification({
    workspaceId,
    type: isEmergency ? "needs_attention" : "needs_attention",
    title: notificationTitle,
    body: notificationBody,
    relatedId: escalation?.id,
  }).catch((err) => {
    logger.error("Failed to send escalation notification", {
      workspaceId,
      conversationId,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  const customerFacingMessage = getEscalationResponse(reason, language);

  logger.info("Conversation escalated to human", {
    workspaceId,
    conversationId,
    reason,
    isEmergency,
    escalationId: escalation?.id,
  });

  return {
    escalated: true,
    reason,
    escalationId: escalation?.id,
    message: customerFacingMessage,
  };
}

export const escalateToHumanToolDef = {
  type: "function" as const,
  function: {
    name: "escalate_to_human",
    description:
      "Transfer conversation to the business owner. Use for complaints, refund requests, unclear questions, sensitive issues, emergencies, or when outside your scope.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          enum: [
            "upset_customer",
            "out_of_scope",
            "sensitive_topic",
            "tool_failure",
            "complex_policy",
            "refund_request",
            "emergency",
            "ambiguous_request",
            "customer_requested_human",
            "unknown_question",
            "discount_request",
            "price_dispute",
            "angry_customer",
            "medical_legal_financial",
            "sensitive_info",
            "unlisted_service",
            "outside_rules",
            "low_confidence",
            "technology_question",
          ],
          description: "Reason for escalation",
        },
        message: {
          type: "string",
          description: "Brief explanation of why escalation is needed",
        },
      },
      required: ["reason"],
    },
  },
};
