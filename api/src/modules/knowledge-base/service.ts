import { db, Prisma } from "@zenda/db/client";

export async function getKnowledgeBase(workspaceId: string) {
  return db.knowledgeBaseItem.findMany({
    where: { workspaceId },
  });
}

export async function searchKnowledgeBase(workspaceId: string, query: string) {
  const keywords = query.toLowerCase().split(/\s+/);
  const orConditions = keywords.flatMap((kw) => [
    { question: { contains: kw, mode: "insensitive" as const } },
    { answer: { contains: kw, mode: "insensitive" as const } },
  ]);

  return db.knowledgeBaseItem.findMany({
    where: {
      workspaceId,
      OR: orConditions,
    },
    take: 10,
  });
}

export async function createKnowledgeItem(
  workspaceId: string,
  data: { question: string; answer: string; category?: string }
) {
  const item = await db.knowledgeBaseItem.create({
    data: {
      workspaceId,
      question: data.question,
      answer: data.answer,
      category: data.category ?? "general",
    },
  });
  return item;
}

export async function deleteKnowledgeItem(workspaceId: string, itemId: string) {
  try {
    await db.knowledgeBaseItem.delete({
      where: { id: itemId, workspaceId },
    });
    return { deleted: true };
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return { deleted: false };
    }
    throw err;
  }
}
