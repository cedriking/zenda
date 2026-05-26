import { db } from "@zenda/db/client";
import { customers } from "@zenda/db/schema";
import type { Language } from "@zenda/shared";
import { and, eq } from "drizzle-orm";

export async function resolveOrCreateCustomer(
  workspaceId: string,
  phoneNumber: string,
  detectedLanguage: Language
): Promise<{
  id: string;
  phoneNumber: string;
  name: string | null;
  language: string;
}> {
  // Try to find existing customer
  const [existing] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.workspaceId, workspaceId),
        eq(customers.phoneNumber, phoneNumber)
      )
    )
    .limit(1);

  if (existing) {
    // Update language if changed
    if (existing.language !== detectedLanguage) {
      await db
        .update(customers)
        .set({
          language: detectedLanguage as "en" | "es",
          updatedAt: new Date(),
        })
        .where(eq(customers.id, existing.id));
    }
    return existing;
  }

  // Create new customer
  const [created] = await db
    .insert(customers)
    .values({
      workspaceId,
      phoneNumber,
      language: detectedLanguage as "en" | "es",
    })
    .returning();

  return created;
}
