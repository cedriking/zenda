/**
 * Policy Gate (§10.4 wrapper)
 *
 * Wraps the pure sending-policy engine with DB lookups so callers
 * can get a SendDecision with a single async call instead of
 * fetching workspace config, consent, and outbound counts manually.
 */
import { db } from '@zenda/db/client'
import { messagingConsent, outboundMessageLog, workspaces } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'
import { canSendOutboundMessage } from '../messaging/sending-policy.js'
import type { MessagePurpose, MessagingConsentStatus, SendDecision } from '@zenda/shared'

interface PolicyGateInput {
  workspaceId: string
  customerId: string
  purpose: MessagePurpose
  channel: 'whatsapp_ba_bridge' | 'whatsapp_waba'
  appointmentCancelled?: boolean
  appointmentCompleted?: boolean
  appointmentTimePassed?: boolean
  isDuplicate?: boolean
  connectorSessionStable?: boolean
}

export async function checkSendingPolicy(input: PolicyGateInput): Promise<SendDecision> {
  // Fetch workspace config, consent, and outbound log in parallel
  const [ws, consent, log] = await Promise.all([
    db
      .select({ maxOutboundWithoutReply: workspaces.maxOutboundWithoutReply })
      .from(workspaces)
      .where(eq(workspaces.id, input.workspaceId))
      .limit(1),
    db
      .select({
        status: messagingConsent.status,
        allowedPurposes: messagingConsent.allowedPurposes,
      })
      .from(messagingConsent)
      .where(and(
        eq(messagingConsent.workspaceId, input.workspaceId),
        eq(messagingConsent.customerId, input.customerId),
      ))
      .limit(1),
    db
      .select({ outboundSinceLastInbound: outboundMessageLog.outboundSinceLastInbound })
      .from(outboundMessageLog)
      .where(and(
        eq(outboundMessageLog.workspaceId, input.workspaceId),
        eq(outboundMessageLog.customerId, input.customerId),
      ))
      .limit(1),
  ])

  const maxOutbound = ws[0]?.maxOutboundWithoutReply ?? 3
  const consentStatus: MessagingConsentStatus = consent[0]?.status ?? 'unknown'
  const allowedPurposes = consent[0]?.allowedPurposes as MessagePurpose[] | undefined
  const outboundCount = log[0]?.outboundSinceLastInbound ?? 0

  return canSendOutboundMessage({
    channel: input.channel,
    purpose: input.purpose,
    consentStatus,
    allowedPurposes,
    outboundSinceLastInbound: outboundCount,
    maxOutboundWithoutReply: maxOutbound,
    isDuplicate: input.isDuplicate ?? false,
    appointmentCancelled: input.appointmentCancelled ?? false,
    appointmentCompleted: input.appointmentCompleted ?? false,
    appointmentTimePassed: input.appointmentTimePassed ?? false,
    connectorSessionStable: input.connectorSessionStable ?? true,
  })
}
