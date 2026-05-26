/**
 * Sending Policy Engine (§10.4)
 *
 * Pure function — no DB, no side effects. All inputs are passed explicitly.
 * This makes it trivially unit-testable and composable.
 */
import type {
  MessagePurpose,
  MessagingConsentStatus,
  SendDecision,
} from "@zenda/shared";

const ALLOWED_PURPOSES_FOR_UNKNOWN: MessagePurpose[] = [
  "customer_inquiry_reply",
  "booking_assistance",
  "booking_confirmation",
  "inbound_reply",
];

const BLOCKED_PURPOSES: MessagePurpose[] = ["marketing", "unknown"];

const ALL_PURPOSES: MessagePurpose[] = [
  "appointment_confirmation",
  "appointment_reminder",
  "appointment_reschedule",
  "appointment_cancellation",
  "booking_follow_up",
  "booking_assistance",
  "booking_confirmation",
  "customer_inquiry_reply",
  "inbound_reply",
  "business_follow_up",
];

interface SendingPolicyInput {
  allowedPurposes?: MessagePurpose[];
  appointmentCancelled: boolean;
  appointmentCompleted: boolean;
  appointmentTimePassed: boolean;
  channel:
    | "whatsapp_ba_bridge"
    | "whatsapp_waba"
    | "business_app_coexistence"
    | "baileys_internal_adapter";
  connectorSessionStable: boolean;
  consentStatus: MessagingConsentStatus;
  hasActiveAppointmentContext?: boolean; // Required for business_app_coexistence channel
  isDuplicate: boolean; // Has this exact reminder/message already been sent?
  maxOutboundWithoutReply: number;
  outboundSinceLastInbound: number;
  purpose: MessagePurpose;
}

export function canSendOutboundMessage(
  input: SendingPolicyInput
): SendDecision {
  const {
    channel,
    purpose,
    consentStatus,
    allowedPurposes,
    outboundSinceLastInbound,
    maxOutboundWithoutReply,
    isDuplicate,
    appointmentCancelled,
    appointmentCompleted,
    appointmentTimePassed,
    connectorSessionStable,
  } = input;

  // 1. Check consent status
  if (consentStatus === "opted_out") {
    return {
      allowed: false,
      reason: "Customer has opted out of messaging",
      details: makeDetails(input, { purposeAllowed: false }),
    };
  }

  // 1b. Block marketing and unknown purposes (§10.1)
  if (BLOCKED_PURPOSES.includes(purpose)) {
    return {
      allowed: false,
      reason: `Purpose '${purpose}' is blocked by policy`,
      details: makeDetails(input, { purposeAllowed: false }),
    };
  }

  // 2. Check purpose is allowed for this consent level
  const purposeAllowed = isPurposeAllowed(
    purpose,
    consentStatus,
    allowedPurposes
  );
  if (!purposeAllowed) {
    return {
      allowed: false,
      reason: `Purpose '${purpose}' not allowed for consent status '${consentStatus}'`,
      details: makeDetails(input, { purposeAllowed: false }),
    };
  }

  // 3. Check outbound rate limit
  if (outboundSinceLastInbound >= maxOutboundWithoutReply) {
    return {
      allowed: false,
      reason: `Outbound limit reached (${outboundSinceLastInbound}/${maxOutboundWithoutReply} without reply)`,
      details: makeDetails(input),
    };
  }

  // 4. Check for duplicates
  if (isDuplicate) {
    return {
      allowed: false,
      reason: "Duplicate message — already sent",
      details: makeDetails(input, { duplicateBlocked: true }),
    };
  }

  // 5. Check appointment state (for appointment-related purposes)
  if (isAppointmentPurpose(purpose)) {
    if (appointmentCancelled) {
      return {
        allowed: false,
        reason: "Appointment has been cancelled",
        details: makeDetails(input, { appointmentValid: false }),
      };
    }
    if (appointmentCompleted) {
      return {
        allowed: false,
        reason: "Appointment has already been completed",
        details: makeDetails(input, { appointmentValid: false }),
      };
    }
    if (appointmentTimePassed && purpose !== "appointment_cancellation") {
      return {
        allowed: false,
        reason: "Appointment time has already passed",
        details: makeDetails(input, { appointmentValid: false }),
      };
    }
  }

  // 6. Check connector stability
  if (!connectorSessionStable) {
    return {
      allowed: false,
      reason: "WhatsApp connector session is not stable",
      details: makeDetails(input),
    };
  }

  // 7. Business App Coexistence: outbound only within active appointment context (§10.4)
  if (
    channel === "business_app_coexistence" &&
    !input.hasActiveAppointmentContext
  ) {
    return {
      allowed: false,
      reason:
        "Business App Coexistence mode requires an active appointment context for outbound messages",
      details: makeDetails(input, { appointmentValid: false }),
    };
  }

  // All checks passed
  return {
    allowed: true,
    details: makeDetails(input),
  };
}

function isPurposeAllowed(
  purpose: MessagePurpose,
  consentStatus: MessagingConsentStatus,
  explicitPurposes?: MessagePurpose[]
): boolean {
  if (consentStatus === "allowed") {
    return ALL_PURPOSES.includes(purpose);
  }
  if (consentStatus === "limited") {
    const allowed = explicitPurposes ?? [];
    return allowed.includes(purpose);
  }
  // 'unknown' — allow only reactive purposes
  return ALLOWED_PURPOSES_FOR_UNKNOWN.includes(purpose);
}

function isAppointmentPurpose(purpose: MessagePurpose): boolean {
  return [
    "appointment_confirmation",
    "appointment_reminder",
    "appointment_reschedule",
    "appointment_cancellation",
    "booking_follow_up",
    "booking_confirmation",
  ].includes(purpose);
}

function makeDetails(
  input: SendingPolicyInput,
  overrides: Partial<NonNullable<SendDecision["details"]>> = {}
): NonNullable<SendDecision["details"]> {
  return {
    consentStatus: input.consentStatus,
    outboundCount: input.outboundSinceLastInbound,
    maxOutbound: input.maxOutboundWithoutReply,
    purposeAllowed: true,
    duplicateBlocked: false,
    appointmentValid: true,
    ...overrides,
  };
}
