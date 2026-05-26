import { db } from "@zenda/db/client";
import { knowledgeBaseItems } from "@zenda/db/schema";
import { and, eq, or, sql } from "drizzle-orm";

export async function getKnowledgeBase(workspaceId: string) {
  return db
    .select()
    .from(knowledgeBaseItems)
    .where(eq(knowledgeBaseItems.workspaceId, workspaceId));
}

export async function searchKnowledgeBase(workspaceId: string, query: string) {
  const keywords = query.toLowerCase().split(/\s+/);
  const conditions = keywords.map((kw) =>
    or(
      sql`LOWER(${knowledgeBaseItems.question}) LIKE ${`%${kw}%`}`,
      sql`LOWER(${knowledgeBaseItems.answer}) LIKE ${`%${kw}%`}`
    )
  );

  return db
    .select()
    .from(knowledgeBaseItems)
    .where(and(eq(knowledgeBaseItems.workspaceId, workspaceId), ...conditions))
    .limit(10);
}

export async function createKnowledgeItem(
  workspaceId: string,
  data: { question: string; answer: string; category?: string }
) {
  const [item] = await db
    .insert(knowledgeBaseItems)
    .values({
      workspaceId,
      question: data.question,
      answer: data.answer,
      category: data.category ?? "general",
    })
    .returning();
  return item;
}

export async function deleteKnowledgeItem(workspaceId: string, itemId: string) {
  const result = await db
    .delete(knowledgeBaseItems)
    .where(
      and(
        eq(knowledgeBaseItems.id, itemId),
        eq(knowledgeBaseItems.workspaceId, workspaceId)
      )
    )
    .returning();
  return { deleted: result.length > 0 };
}
