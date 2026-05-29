/**
 * Tool Sending Guard
 *
 * Programmatic sending policy enforcement at the AI tool execution layer.
 * Before any tool that could trigger an outbound message executes, this guard
 * checks the sending policy and returns a structured error if the send would
 * be denied.
 *
 * This is defense-in-depth: the system prompt already instructs the agent not
 * to bypass sending policy, but the tools also enforce programmatically.
 */

import type { MessagePurpose } from "@zenda/shared";
import { logger } from "../../infra/logger.js";
import { checkSendingPolicy } from "./policy-gate.js";

/**
 * Maps tool names to the outbound message purpose they would trigger.
 * Tools not listed here are considered read-only and don't need policy checks.
 */
const TOOL_PURPOSE_MAP: Record<string, MessagePurpose> = {
  book_appointment: "booking_confirmation",
  confirm_appointment: "appointment_confirmation",
  reschedule_appointment: "appointment_reschedule",
  cancel_appointment: "appointment_cancellation",
};

export interface PolicyDenial {
  policyDenied: true;
  purpose: MessagePurpose;
  reason: string;
  toolName: string;
}

/**
 * Check whether the sending policy allows the given tool to execute.
 * Returns null if allowed, or a structured PolicyDenial if blocked.
 *
 * Only checks tools mapped in TOOL_PURPOSE_MAP; all other tools pass through.
 */
export async function checkToolSendingPolicy(
  toolName: string,
  workspaceId: string,
  customerId: string
): Promise<PolicyDenial | null> {
  const purpose = TOOL_PURPOSE_MAP[toolName];
  if (!purpose) {
    return null; // Not an outbound-triggering tool
  }

  try {
    const decision = await checkSendingPolicy({
      workspaceId,
      customerId,
      purpose,
      channel: "whatsapp_ba_bridge",
      // Appointment state flags are checked by the policy engine via DB
      // lookups inside checkSendingPolicy; we don't pre-fetch here.
    });

    if (!decision.allowed) {
      logger.info("Tool sending policy denied", {
        toolName,
        workspaceId,
        customerId,
        purpose,
        reason: decision.reason,
      });

      return {
        policyDenied: true,
        reason: decision.reason ?? "Sending policy denied",
        toolName,
        purpose,
      };
    }

    return null;
  } catch (err) {
    // On policy check failure, deny the tool (fail closed for compliance).
    // This prevents messages to opted-out customers during infrastructure incidents.
    logger.error("Sending policy check failed, blocking tool (fail-closed)", {
      toolName,
      workspaceId,
      customerId,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      policyDenied: true,
      reason: "Sending policy check unavailable — blocked for safety",
      toolName,
      purpose,
    };
  }
}
