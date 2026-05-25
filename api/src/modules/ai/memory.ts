import { db } from "@zenda/db/client";
import { agentMemory, customers } from "@zenda/db/schema";
import { and, eq } from "drizzle-orm";
import { logger } from "../../infra/logger.js";

// Module-level regex constants (biome lint/performance/useTopLevelRegex)
const RE_TIME_MORNING = /\b(morning|mañana|temprano)\b/i;
const RE_TIME_AFTERNOON = /\b(afternoon|tarde)\b/i;
const RE_TIME_EVENING = /\b(evening|noche)\b/i;
const RE_STAFF_PREF =
  /(?:with|con|prefer|prefiero|quiero)\s+(?:a\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/;
const RE_SERVICE_PREF =
  /(?:always|usually|suelo|siempre)\s+(?:get|do|hacer|hago)\s+(.{3,40}?)(?:\.|,|$)/i;
const RE_POLITE = /\b(?:por favor|please|gracias|thanks|thank you)\b/i;
const RE_NAME_FALSE_POS =
  /^(good|fine|okay|bien|bueno|ready|listo|here|from|de|en|el|la)$/i;
const RE_NAME_EN =
  /(?:my name is|i'm|i am|call me)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\b/i;
const RE_NAME_ES =
  /(?:me llamo|me dicen|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\b/i;
const RE_NAME_SHORT =
  /^(?:es|it's|it is|i'm)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)$/i;
const RE_NAME_FR =
  /(?:je m'appelle|j'ai nom)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\b/i;
const NAME_PATTERNS = [RE_NAME_EN, RE_NAME_ES, RE_NAME_SHORT, RE_NAME_FR];

interface MemoryEntry {
  key: string;
  source: "ai_extraction" | "owner_note" | "system";
  value: string;
}

export async function storeMemory(
  workspaceId: string,
  customerId: string,
  entries: MemoryEntry[]
): Promise<void> {
  for (const entry of entries) {
    await db
      .insert(agentMemory)
      .values({
        workspaceId,
        customerId,
        key: entry.key,
        value: entry.value,
        source: entry.source,
      })
      .onConflictDoUpdate({
        target: [
          agentMemory.workspaceId,
          agentMemory.customerId,
          agentMemory.key,
        ],
        set: { value: entry.value, updatedAt: new Date() },
      });
  }
}

export async function getMemoryForCustomer(
  workspaceId: string,
  customerId: string
): Promise<Array<{ key: string; value: string; source: string }>> {
  const records = await db
    .select()
    .from(agentMemory)
    .where(
      and(
        eq(agentMemory.workspaceId, workspaceId),
        eq(agentMemory.customerId, customerId)
      )
    );

  return records.map((r) => ({
    key: r.key,
    value: r.value,
    source: r.source,
  }));
}

export async function extractMemoryFromConversation(
  workspaceId: string,
  customerId: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> {
  // Only extract from customer messages that have substance
  const customerMessages = messages
    .filter((m) => m.role === "customer" && m.content.length > 10)
    .map((m) => m.content);

  if (customerMessages.length === 0) {
    return;
  }

  const text = customerMessages.slice(-5).join("\n");
  const lowerText = text.toLowerCase();
  const preferences: MemoryEntry[] = [];

  // Time preferences
  const timePatterns = [
    { pattern: RE_TIME_MORNING, key: "preferred_time", value: "morning" },
    { pattern: RE_TIME_AFTERNOON, key: "preferred_time", value: "afternoon" },
    { pattern: RE_TIME_EVENING, key: "preferred_time", value: "evening" },
  ];
  for (const { pattern, key, value } of timePatterns) {
    if (pattern.test(lowerText)) {
      preferences.push({ key, value, source: "ai_extraction" });
      break;
    }
  }

  // Staff preferences — "with Maria", "con Juan"
  const staffMatch = text.match(RE_STAFF_PREF);
  if (staffMatch) {
    preferences.push({
      key: "preferred_staff",
      value: staffMatch[1],
      source: "ai_extraction",
    });
  }

  // Service preferences — "always get a haircut", "suelo pedir corte"
  const serviceMatch = text.match(RE_SERVICE_PREF);
  if (serviceMatch) {
    preferences.push({
      key: "preferred_service",
      value: serviceMatch[1].trim(),
      source: "ai_extraction",
    });
  }

  // Communication style
  if (RE_POLITE.test(lowerText)) {
    preferences.push({
      key: "communication_style",
      value: "polite",
      source: "ai_extraction",
    });
  }

  // Customer name extraction from self-introductions
  for (const pattern of NAME_PATTERNS) {
    const nameMatch = text.match(pattern);
    if (nameMatch) {
      const extractedName = nameMatch[1].trim();
      // Avoid common false positives (single-word greetings like "I'm good")
      if (extractedName.length >= 2 && !RE_NAME_FALSE_POS.test(extractedName)) {
        // Update customer name directly on the customers table
        try {
          await db
            .update(customers)
            .set({ name: extractedName, updatedAt: new Date() })
            .where(
              and(
                eq(customers.id, customerId),
                eq(customers.workspaceId, workspaceId)
              )
            );
          preferences.push({
            key: "name_extracted",
            value: extractedName,
            source: "ai_extraction",
          });
          logger.info("Customer name extracted from conversation", {
            workspaceId,
            customerId,
            name: extractedName,
          });
        } catch {
          logger.error("Failed to update customer name");
        }
        break;
      }
    }
  }

  if (preferences.length > 0) {
    await storeMemory(workspaceId, customerId, preferences);
    logger.info("Extracted memory", {
      workspaceId,
      customerId,
      count: preferences.length,
    });
  }
}
