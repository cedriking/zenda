import { db } from "@zenda/db/client";
import type { Language } from "@zenda/shared";

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
  const existing = await db.customer.findFirst({
    where: {
      workspaceId,
      phoneNumber,
    },
  });

  if (existing) {
    // Update language if changed
    if (existing.language !== detectedLanguage) {
      await db.customer.update({
        where: { id: existing.id },
        data: {
          language: detectedLanguage as "en" | "es",
          updatedAt: new Date(),
        },
      });
    }
    return existing;
  }

  // Create new customer
  const created = await db.customer.create({
    data: {
      workspaceId,
      phoneNumber,
      language: detectedLanguage as "en" | "es",
    },
  });

  return created;
}
