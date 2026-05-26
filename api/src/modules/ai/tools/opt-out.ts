/**
 * Tool: opt_out_customer
 *
 * Marks the customer as opted-out from messaging.
 * Cancels any pending outbound messages and returns a confirmation message.
 *
 * The AI calls this when a customer explicitly requests to stop receiving messages,
 * unsubscribe, or be removed from the contact list.
 */

import type { Language } from "@zenda/shared";
import { optOut } from "../../messaging/consent-service.js";

interface ToolInput {
  /** The reason the customer gave for opting out (for audit logging) */
  reason?: string;
}

export async function optOutCustomer(
  workspaceId: string,
  customerId: string,
  _input: ToolInput,
  language?: Language
) {
  const confirmationText = await optOut(workspaceId, customerId);

  return {
    optedOut: true,
    message:
      language === "es"
        ? "Listo, no te enviaré más mensajes. Si en algún momento quieres agendar una cita, solo escríbeme."
        : confirmationText,
  };
}

export const optOutCustomerToolDef = {
  type: "function" as const,
  function: {
    name: "opt_out_customer",
    description:
      "Opt the customer out from all future messages. Use when the customer explicitly asks to stop receiving messages, unsubscribe, be removed, or says STOP. This is irreversible from your side — only use when clearly requested.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description:
            "Brief note on why the customer is opting out (e.g. 'customer said stop', 'requested unsubscribe')",
        },
      },
      required: [],
    },
  },
};
