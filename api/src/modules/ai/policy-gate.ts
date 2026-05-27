/**
 * Policy Gate (§10.4 wrapper)
 *
 * Wraps the pure sending-policy engine with DB lookups so callers
 * can get a SendDecision with a single async call instead of
 * fetching workspace config, consent, and outbound counts manually.
 */
import { db } from "@zenda/db/client";
import type {
  MessagePurpose,
  MessagingConsentStatus,
  SendDecision,
} from "@zenda/shared";
import { canSendOutboundMessage } from "../messaging/sending-policy.js";

interface PolicyGateInput {
  appointmentCancelled?: boolean;
  appointmentCompleted?: boolean;
  appointmentTimePassed?: boolean;
  channel: "whatsapp_ba_bridge" | "whatsapp_waba";
  connectorSessionStable?: boolean;
  customerId: string;
  isDuplicate?: boolean;
  purpose: MessagePurpose;
  workspaceId: string;
}

export async function checkSendingPolicy(
  input: PolicyGateInput
): Promise<SendDecision> {
  // Fetch workspace config, consent, and outbound log in parallel
  const [ws, consent, log] = await Promise.all([
    db.workspace.findFirst({
      where: { id: input.workspaceId },
      select: { maxOutboundWithoutReply: true },
    }),
    db.messagingConsent.findFirst({
      where: {
        workspaceId: input.workspaceId,
        customerId: input.customerId,
      },
      select: { status: true, allowedPurposes: true },
    }),
    db.outboundMessageLog.findFirst({
      where: {
        workspaceId: input.workspaceId,
        customerId: input.customerId,
      },
      select: { outboundSinceLastInbound: true },
    }),
  ]);

  const maxOutbound = ws?.maxOutboundWithoutReply ?? 3;
  const consentStatus: MessagingConsentStatus = consent?.status ?? "unknown";
  const allowedPurposes = consent?.allowedPurposes as
    | MessagePurpose[]
    | undefined;
  const outboundCount = log?.outboundSinceLastInbound ?? 0;

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
  });
}
