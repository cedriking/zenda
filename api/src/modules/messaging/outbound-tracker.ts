/**
 * Outbound Rate Tracker (§9)
 *
 * Tracks per-customer outbound message counts to enforce
 * the "max N outbound without reply" rule.
 */
import { db } from "@zenda/db/client";
import type { MessagePurpose } from "@zenda/shared";

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
    await db.outboundMessageLog.update({
      where: { id: existing.id },
      data: {
        outboundSinceLastInbound: existing.outboundSinceLastInbound + 1,
        lastOutboundAt: new Date(),
        purposeOfLastOutbound: purpose,
        conversationId: conversationId ?? existing.conversationId,
        updatedAt: new Date(),
      },
    });
  } else {
    await db.outboundMessageLog.create({
      data: {
        workspaceId,
        customerId,
        conversationId,
        outboundSinceLastInbound: 1,
        lastOutboundAt: new Date(),
        purposeOfLastOutbound: purpose,
      },
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
    await db.outboundMessageLog.update({
      where: { id: existing.id },
      data: {
        outboundSinceLastInbound: 0,
        lastInboundAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    await db.outboundMessageLog.create({
      data: {
        workspaceId,
        customerId,
        outboundSinceLastInbound: 0,
        lastInboundAt: new Date(),
      },
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
  const log = await db.outboundMessageLog.findFirst({
    where: {
      workspaceId,
      customerId,
    },
  });
  return log ?? null;
}
