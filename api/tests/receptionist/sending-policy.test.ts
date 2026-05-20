import { describe, expect, test } from 'bun:test'
import { canSendOutboundMessage } from '../../src/modules/messaging/sending-policy'
import type { MessagePurpose, MessagingConsentStatus } from '@zenda/shared'

// ---------------------------------------------------------------------------
// Helper: builds a full SendingPolicyInput with sensible "happy path" defaults.
// Only the fields being tested need to be overridden.
// ---------------------------------------------------------------------------

interface SendingPolicyInput {
  channel: 'whatsapp_ba_bridge' | 'whatsapp_waba'
  purpose: MessagePurpose
  consentStatus: MessagingConsentStatus
  allowedPurposes?: MessagePurpose[]
  outboundSinceLastInbound: number
  maxOutboundWithoutReply: number
  isDuplicate: boolean
  appointmentCancelled: boolean
  appointmentCompleted: boolean
  appointmentTimePassed: boolean
  connectorSessionStable: boolean
}

function defaults(overrides: Partial<SendingPolicyInput> = {}): SendingPolicyInput {
  return {
    channel: 'whatsapp_ba_bridge',
    purpose: 'appointment_reminder',
    consentStatus: 'allowed',
    outboundSinceLastInbound: 0,
    maxOutboundWithoutReply: 3,
    isDuplicate: false,
    appointmentCancelled: false,
    appointmentCompleted: false,
    appointmentTimePassed: false,
    connectorSessionStable: true,
    ...overrides,
  }
}

// ===========================================================================
// 1. Consent checks
// ===========================================================================

describe('Sending Policy - consent checks', () => {
  test('opted_out always blocks regardless of purpose', () => {
    const result = canSendOutboundMessage(defaults({ consentStatus: 'opted_out' }))
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('opted out')
    expect(result.details?.purposeAllowed).toBe(false)
  })

  test('opted_out blocks even for customer_inquiry_reply', () => {
    const result = canSendOutboundMessage(
      defaults({ consentStatus: 'opted_out', purpose: 'customer_inquiry_reply' }),
    )
    expect(result.allowed).toBe(false)
  })

  test('unknown consent with allowed purpose passes', () => {
    const result = canSendOutboundMessage(
      defaults({ consentStatus: 'unknown', purpose: 'customer_inquiry_reply' }),
    )
    expect(result.allowed).toBe(true)
  })

  test('unknown consent with booking_assistance passes', () => {
    const result = canSendOutboundMessage(
      defaults({ consentStatus: 'unknown', purpose: 'booking_assistance' }),
    )
    expect(result.allowed).toBe(true)
  })

  test('unknown consent with booking_confirmation passes', () => {
    const result = canSendOutboundMessage(
      defaults({ consentStatus: 'unknown', purpose: 'booking_confirmation' }),
    )
    expect(result.allowed).toBe(true)
  })

  test('unknown consent with disallowed purpose blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ consentStatus: 'unknown', purpose: 'appointment_reminder' }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('not allowed')
  })

  test('unknown consent with booking_follow_up blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ consentStatus: 'unknown', purpose: 'booking_follow_up' }),
    )
    expect(result.allowed).toBe(false)
  })

  test('allowed consent passes for any valid purpose', () => {
    const purposes: MessagePurpose[] = [
      'appointment_confirmation',
      'appointment_reminder',
      'appointment_reschedule',
      'appointment_cancellation',
      'booking_follow_up',
      'booking_assistance',
      'booking_confirmation',
      'customer_inquiry_reply',
    ]
    for (const purpose of purposes) {
      const result = canSendOutboundMessage(defaults({ consentStatus: 'allowed', purpose }))
      expect(result.allowed).toBe(true)
    }
  })

  test('limited consent with matching purpose passes', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'limited',
        purpose: 'appointment_reminder',
        allowedPurposes: ['appointment_reminder', 'booking_confirmation'],
      }),
    )
    expect(result.allowed).toBe(true)
  })

  test('limited consent with non-matching purpose blocks', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'limited',
        purpose: 'customer_inquiry_reply',
        allowedPurposes: ['appointment_reminder', 'booking_confirmation'],
      }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('not allowed')
  })

  test('limited consent with empty allowedPurposes blocks everything', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'limited',
        purpose: 'customer_inquiry_reply',
        allowedPurposes: [],
      }),
    )
    expect(result.allowed).toBe(false)
  })

  test('limited consent with undefined allowedPurposes defaults to empty and blocks', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'limited',
        purpose: 'customer_inquiry_reply',
        allowedPurposes: undefined,
      }),
    )
    expect(result.allowed).toBe(false)
  })
})

// ===========================================================================
// 2. Outbound rate limit
// ===========================================================================

describe('Sending Policy - outbound rate limit', () => {
  test('at limit blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ outboundSinceLastInbound: 3, maxOutboundWithoutReply: 3 }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('limit reached')
    expect(result.details?.outboundCount).toBe(3)
    expect(result.details?.maxOutbound).toBe(3)
  })

  test('over limit blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ outboundSinceLastInbound: 5, maxOutboundWithoutReply: 3 }),
    )
    expect(result.allowed).toBe(false)
  })

  test('below limit passes', () => {
    const result = canSendOutboundMessage(
      defaults({ outboundSinceLastInbound: 2, maxOutboundWithoutReply: 3 }),
    )
    expect(result.allowed).toBe(true)
  })

  test('zero outbound passes', () => {
    const result = canSendOutboundMessage(
      defaults({ outboundSinceLastInbound: 0, maxOutboundWithoutReply: 3 }),
    )
    expect(result.allowed).toBe(true)
  })

  test('limit of 1 with 0 sent passes', () => {
    const result = canSendOutboundMessage(
      defaults({ outboundSinceLastInbound: 0, maxOutboundWithoutReply: 1 }),
    )
    expect(result.allowed).toBe(true)
  })

  test('limit of 1 with 1 sent blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ outboundSinceLastInbound: 1, maxOutboundWithoutReply: 1 }),
    )
    expect(result.allowed).toBe(false)
  })
})

// ===========================================================================
// 3. Duplicate check
// ===========================================================================

describe('Sending Policy - duplicate check', () => {
  test('isDuplicate=true blocks', () => {
    const result = canSendOutboundMessage(defaults({ isDuplicate: true }))
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('Duplicate')
    expect(result.details?.duplicateBlocked).toBe(true)
  })

  test('isDuplicate=false does not block by itself', () => {
    const result = canSendOutboundMessage(defaults({ isDuplicate: false }))
    expect(result.allowed).toBe(true)
  })
})

// ===========================================================================
// 4. Appointment state checks
// ===========================================================================

describe('Sending Policy - appointment state', () => {
  test('cancelled appointment blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ purpose: 'appointment_reminder', appointmentCancelled: true }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('cancelled')
    expect(result.details?.appointmentValid).toBe(false)
  })

  test('completed appointment blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ purpose: 'appointment_confirmation', appointmentCompleted: true }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('completed')
    expect(result.details?.appointmentValid).toBe(false)
  })

  test('time passed (non-cancellation purpose) blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ purpose: 'appointment_reminder', appointmentTimePassed: true }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('already passed')
  })

  test('time passed with confirmation blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ purpose: 'appointment_confirmation', appointmentTimePassed: true }),
    )
    expect(result.allowed).toBe(false)
  })

  test('time passed with reschedule blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ purpose: 'appointment_reschedule', appointmentTimePassed: true }),
    )
    expect(result.allowed).toBe(false)
  })

  test('time passed with cancellation purpose passes', () => {
    const result = canSendOutboundMessage(
      defaults({ purpose: 'appointment_cancellation', appointmentTimePassed: true }),
    )
    expect(result.allowed).toBe(true)
  })

  test('active future appointment passes', () => {
    const result = canSendOutboundMessage(
      defaults({
        purpose: 'appointment_reminder',
        appointmentCancelled: false,
        appointmentCompleted: false,
        appointmentTimePassed: false,
      }),
    )
    expect(result.allowed).toBe(true)
  })

  test('appointment checks are skipped for non-appointment purposes', () => {
    // customer_inquiry_reply is not in the appointment purpose list,
    // so cancelled/completed/timePassed should NOT block it
    const result = canSendOutboundMessage(
      defaults({
        purpose: 'customer_inquiry_reply',
        appointmentCancelled: true,
        appointmentCompleted: true,
        appointmentTimePassed: true,
      }),
    )
    expect(result.allowed).toBe(true)
  })

  test('booking_assistance is not an appointment purpose', () => {
    const result = canSendOutboundMessage(
      defaults({
        purpose: 'booking_assistance',
        appointmentCancelled: true,
      }),
    )
    expect(result.allowed).toBe(true)
  })

  test('booking_follow_up IS an appointment purpose and respects cancellation', () => {
    const result = canSendOutboundMessage(
      defaults({ purpose: 'booking_follow_up', appointmentCancelled: true }),
    )
    expect(result.allowed).toBe(false)
  })
})

// ===========================================================================
// 5. Connector stability
// ===========================================================================

describe('Sending Policy - connector stability', () => {
  test('unstable connector blocks', () => {
    const result = canSendOutboundMessage(defaults({ connectorSessionStable: false }))
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('not stable')
  })

  test('stable connector passes', () => {
    const result = canSendOutboundMessage(defaults({ connectorSessionStable: true }))
    expect(result.allowed).toBe(true)
  })
})

// ===========================================================================
// 6. Combo / integration tests
// ===========================================================================

describe('Sending Policy - combination scenarios', () => {
  test('valid consent + rate limit hit blocks', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'allowed',
        outboundSinceLastInbound: 3,
        maxOutboundWithoutReply: 3,
      }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('limit reached')
  })

  test('valid consent + duplicate blocks', () => {
    const result = canSendOutboundMessage(
      defaults({ consentStatus: 'allowed', isDuplicate: true }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('Duplicate')
  })

  test('unknown consent + allowed purpose + unstable connector blocks', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'unknown',
        purpose: 'customer_inquiry_reply',
        connectorSessionStable: false,
      }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('not stable')
  })

  test('limited consent + matching purpose + at rate limit blocks at rate check', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'limited',
        purpose: 'appointment_reminder',
        allowedPurposes: ['appointment_reminder'],
        outboundSinceLastInbound: 3,
        maxOutboundWithoutReply: 3,
      }),
    )
    expect(result.allowed).toBe(false)
    expect(result.reason).toContain('limit reached')
  })

  test('cancelled appointment + duplicate still blocks at consent if opted_out first', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'opted_out',
        appointmentCancelled: true,
        isDuplicate: true,
      }),
    )
    expect(result.allowed).toBe(false)
    // Should short-circuit at consent check
    expect(result.reason).toContain('opted out')
  })

  test('all green passes', () => {
    const result = canSendOutboundMessage(
      defaults({
        consentStatus: 'allowed',
        purpose: 'appointment_reminder',
        outboundSinceLastInbound: 1,
        maxOutboundWithoutReply: 3,
        isDuplicate: false,
        appointmentCancelled: false,
        appointmentCompleted: false,
        appointmentTimePassed: false,
        connectorSessionStable: true,
      }),
    )
    expect(result.allowed).toBe(true)
    expect(result.details?.consentStatus).toBe('allowed')
    expect(result.details?.purposeAllowed).toBe(true)
    expect(result.details?.duplicateBlocked).toBe(false)
    expect(result.details?.appointmentValid).toBe(true)
  })

  test('decision details are populated on allow', () => {
    const result = canSendOutboundMessage(defaults({
      consentStatus: 'allowed',
      outboundSinceLastInbound: 2,
      maxOutboundWithoutReply: 5,
    }))
    expect(result.allowed).toBe(true)
    expect(result.details).toBeDefined()
    expect(result.details!.consentStatus).toBe('allowed')
    expect(result.details!.outboundCount).toBe(2)
    expect(result.details!.maxOutbound).toBe(5)
    expect(result.details!.purposeAllowed).toBe(true)
    expect(result.details!.duplicateBlocked).toBe(false)
    expect(result.details!.appointmentValid).toBe(true)
  })

  test('both channels work the same for policy checks', () => {
    const bridgeResult = canSendOutboundMessage(defaults({ channel: 'whatsapp_ba_bridge' }))
    const wabaResult = canSendOutboundMessage(defaults({ channel: 'whatsapp_waba' }))
    expect(bridgeResult.allowed).toBe(true)
    expect(wabaResult.allowed).toBe(true)
  })
})
