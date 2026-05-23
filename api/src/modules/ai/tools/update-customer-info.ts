/**
 * Tool: update_customer_info
 *
 * Allows the AI to update customer profile information (name, language)
 * discovered during conversation. This is how customer names get captured
 * when customers introduce themselves naturally in chat.
 */
import { db } from "@zenda/db/client";
import { customers } from "@zenda/db/schema";
import { and, eq } from "drizzle-orm";
import { logger } from "../../../infra/logger.js";

interface ToolInput {
  /** Customer ID to update */
  customerId: string;
  /** Override detected language */
  language?: string;
  /** Customer's name (e.g. from self-introduction) */
  name?: string;
}

export async function updateCustomerInfo(
  workspaceId: string,
  input: ToolInput
): Promise<{ success: boolean; updatedFields: string[] }> {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  const updatedFields: string[] = [];

  if (input.name) {
    updateData.name = input.name;
    updatedFields.push("name");
  }
  if (input.language) {
    updateData.language = input.language;
    updatedFields.push("language");
  }

  if (updatedFields.length === 0) {
    return { success: false, updatedFields: [] };
  }

  const [updated] = await db
    .update(customers)
    .set(updateData)
    .where(
      and(
        eq(customers.id, input.customerId),
        eq(customers.workspaceId, workspaceId)
      )
    )
    .returning();

  if (updated) {
    logger.info("Customer info updated by AI", {
      workspaceId,
      customerId: input.customerId,
      updatedFields,
    });
  }

  return { success: !!updated, updatedFields };
}

export const updateCustomerInfoToolDef = {
  type: "function" as const,
  function: {
    name: "update_customer_info",
    description:
      "Update customer profile information such as their name. Use this when the customer introduces themselves (e.g. 'I'm Maria', 'My name is Juan', 'Me llamo Carlos') to save their name so you can address them personally in future messages. Only set fields that the customer has explicitly provided.",
    parameters: {
      type: "object",
      properties: {
        customerId: {
          type: "string",
          description: "Customer ID (from context)",
        },
        name: {
          type: "string",
          description: "Customer's name as they introduced themselves",
        },
        language: {
          type: "string",
          description: "Customer's preferred language code (en, es, etc.)",
        },
      },
      required: ["customerId"],
    },
  },
};
