import { db } from "@zenda/db/client";
import type { PlanTier } from "@zenda/shared";
import { PLANS } from "@zenda/shared";
import { logger } from "../../infra/logger.js";

export async function enforceDataRetention(workspaceId: string): Promise<{
  deleted: { messages: number; conversations: number; auditLogs: number };
}> {
  // Get plan tier
  const sub = await db.subscription.findFirst({
    where: { workspaceId },
  });

  const tier: PlanTier = (sub?.planTier as PlanTier) ?? "local_solo";
  const maxDays = PLANS[tier].retentionDays;

  const cutoffDate = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000);

  // Delete old messages
  const deletedMessages = await db.message.deleteMany({
    where: {
      workspaceId,
      createdAt: { lt: cutoffDate },
    },
  });

  // Delete old conversations (cascade will handle related data)
  const deletedConversations = await db.conversation.deleteMany({
    where: {
      workspaceId,
      createdAt: { lt: cutoffDate },
    },
  });

  // Delete old audit logs
  const deletedLogs = await db.auditLog.deleteMany({
    where: {
      workspaceId,
      createdAt: { lt: cutoffDate },
    },
  });

  const result = {
    deleted: {
      messages: deletedMessages.count,
      conversations: deletedConversations.count,
      auditLogs: deletedLogs.count,
    },
  };

  if (result.deleted.messages > 0 || result.deleted.conversations > 0) {
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
  const allWorkspaces = await db.workspace.findMany({
    select: { id: true },
  });

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
