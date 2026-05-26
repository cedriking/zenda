import { db } from "@zenda/db/client";
import {
  auditLogs,
  conversations,
  messages,
  subscriptions,
  workspaces,
} from "@zenda/db/schema";
import type { PlanTier } from "@zenda/shared";
import { PLANS } from "@zenda/shared";
import { and, eq, lt } from "drizzle-orm";
import { logger } from "../../infra/logger.js";

export async function enforceDataRetention(workspaceId: string): Promise<{
  deleted: { messages: number; conversations: number; auditLogs: number };
}> {
  // Get plan tier
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspaceId))
    .limit(1);

  const tier: PlanTier = (sub?.planTier as PlanTier) ?? "local_solo";
  const maxDays = PLANS[tier].retentionDays;

  const cutoffDate = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000);

  // Delete old messages
  const deletedMessages = await db
    .delete(messages)
    .where(
      and(
        eq(messages.workspaceId, workspaceId),
        lt(messages.createdAt, cutoffDate)
      )
    )
    .returning({ id: messages.id });

  // Delete old conversations (cascade will handle related data)
  const deletedConversations = await db
    .delete(conversations)
    .where(
      and(
        eq(conversations.workspaceId, workspaceId),
        lt(conversations.createdAt, cutoffDate)
      )
    )
    .returning({ id: conversations.id });

  // Delete old audit logs
  const deletedLogs = await db
    .delete(auditLogs)
    .where(
      and(
        eq(auditLogs.workspaceId, workspaceId),
        lt(auditLogs.createdAt, cutoffDate)
      )
    )
    .returning({ id: auditLogs.id });

  const result = {
    deleted: {
      messages: deletedMessages.length,
      conversations: deletedConversations.length,
      auditLogs: deletedLogs.length,
    },
  };

  if (deletedMessages.length > 0 || deletedConversations.length > 0) {
    logger.info("Data retention enforced", {
      workspaceId,
      tier,
      maxDays,
      ...result,
    });
  }

  return result;
}

export async function enforceRetentionAllWorkspaces(): Promise<number> {
  const allWorkspaces = await db.select({ id: workspaces.id }).from(workspaces);

  let count = 0;
  for (const ws of allWorkspaces) {
    try {
      await enforceDataRetention(ws.id);
      count++;
    } catch (err) {
      logger.error("Retention enforcement failed", {
        workspaceId: ws.id,
        error: (err as Error).message,
      });
    }
  }

  return count;
}
