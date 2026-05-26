/**
 * Outbound Rate Tracker (§9)
 *
 * Tracks per-customer outbound message counts to enforce
 * the "max N outbound without reply" rule.
 */
import { db } from "@zenda/db/client";
import { outboundMessageLog } from "@zenda/db/schema";
import type { MessagePurpose } from "@zenda/shared";
import { and, eq } from "drizzle-orm";

/**
 * Increment outbound counter after a successful send.
 */
export async function incrementOutbound(
  workspaceId: string,
  customerId: string,
  purpose: MessagePurpose,
  conversationId?: string
): Promise<void> {
  const existing = await getLog(workspaceId, customerId);

  if (existing) {
    await db
      .update(outboundMessageLog)
      .set({
        outboundSinceLastInbound: existing.outboundSinceLastInbound + 1,
        lastOutboundAt: new Date(),
        purposeOfLastOutbound: purpose,
        conversationId: conversationId ?? existing.conversationId,
        updatedAt: new Date(),
      })
      .where(eq(outboundMessageLog.id, existing.id));
  } else {
    await db.insert(outboundMessageLog).values({
      workspaceId,
      customerId,
      conversationId,
      outboundSinceLastInbound: 1,
      lastOutboundAt: new Date(),
      purposeOfLastOutbound: purpose,
    });
  }
}

/**
 * Reset outbound counter when customer sends an inbound message.
 */
export async function resetOnInbound(
  workspaceId: string,
  customerId: string
): Promise<void> {
  const existing = await getLog(workspaceId, customerId);

  if (existing) {
    await db
      .update(outboundMessageLog)
      .set({
        outboundSinceLastInbound: 0,
        lastInboundAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(outboundMessageLog.id, existing.id));
  } else {
    await db.insert(outboundMessageLog).values({
      workspaceId,
      customerId,
      outboundSinceLastInbound: 0,
      lastInboundAt: new Date(),
    });
  }
}

/**
 * Get the current outbound count for a customer.
 */
export async function getOutboundCount(
  workspaceId: string,
  customerId: string
): Promise<number> {
  const log = await getLog(workspaceId, customerId);
  return log?.outboundSinceLastInbound ?? 0;
}

/**
 * Get the full log record.
 */
export async function getLog(workspaceId: string, customerId: string) {
  const [log] = await db
    .select()
    .from(outboundMessageLog)
    .where(
      and(
        eq(outboundMessageLog.workspaceId, workspaceId),
        eq(outboundMessageLog.customerId, customerId)
      )
    )
    .limit(1);
  return log ?? null;
}
