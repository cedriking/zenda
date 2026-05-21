import { typedContext } from '../../middleware/typed-context.js'
import { Elysia, t } from 'elysia'
import { recordConsent, getConsent, optOut } from './consent-service.js'
import type { MessagingConsentStatus, ConsentSource, MessagePurpose } from '@zenda/shared'
import { logConsentEvent } from '../audit/logger.js'
import { logger } from '../../infra/logger.js'
import { serverError } from '../../utils/errors.js'

const MESSAGING_CONSENT_STATUSES: MessagingConsentStatus[] = ['unknown', 'allowed', 'limited', 'opted_out']
const CONSENT_SOURCES: ConsentSource[] = ['customer_inbound_message', 'whatsapp_booking', 'booking_form', 'business_import', 'manual_owner_confirmation', 'opt_out_request']
const MESSAGE_PURPOSES: MessagePurpose[] = [
  'appointment_confirmation', 'appointment_reminder', 'appointment_reschedule', 'appointment_cancellation',
  'booking_follow_up', 'booking_assistance', 'booking_confirmation', 'customer_inquiry_reply',
  'inbound_reply', 'business_follow_up',
]

export const messagingModule = new Elysia({ prefix: '/messaging' })
  .use(typedContext)

  // Get consent status for a customer
  .get('/consent/:customerId', async ({ workspaceId, params, set }) => {
    try {
    const consent = await getConsent(workspaceId!, params.customerId)
    if (!consent) {
      return { found: false, consent: null }
    }
    return { found: true, consent }
    } catch (err: any) {
      logger.error('Get consent error', { workspaceId, customerId: params.customerId, error: err?.message })
      return serverError(set, 'Failed to get consent status')
    }
  })

  // Record or update consent
  .post('/consent', async ({ workspaceId, body, set }) => {
    const { customerId, phoneNumber, status, source, allowedPurposes, notes } = body as {
      customerId: string
      phoneNumber: string
      status: string
      source: string
      allowedPurposes?: string[]
      notes?: string
    }

    try {
    await recordConsent({
      workspaceId: workspaceId!,
      customerId,
      phoneNumber,
      status: status as MessagingConsentStatus,
      source: source as ConsentSource,
      allowedPurposes: allowedPurposes as MessagePurpose[] | undefined,
      notes,
    })

    // Fetch the updated record to return
    const consent = await getConsent(workspaceId!, customerId)

    await logConsentEvent(workspaceId!, customerId, 'record_consent', {
      status,
      source,
    })

    logger.info('Consent recorded', { workspaceId, customerId, status })
    return { success: true, consent }
    } catch (err: any) {
      logger.error('Record consent error', { workspaceId, customerId, error: err?.message })
      return serverError(set, 'Failed to record consent')
    }
  }, {
    body: t.Object({
      customerId: t.String(),
      phoneNumber: t.String(),
      status: t.Union(MESSAGING_CONSENT_STATUSES.map(s => t.Literal(s))),
      source: t.Union(CONSENT_SOURCES.map(s => t.Literal(s))),
      allowedPurposes: t.Optional(t.Array(t.Union(MESSAGE_PURPOSES.map(p => t.Literal(p))))),
      notes: t.Optional(t.String()),
    }),
  })

  // Process opt-out
  .post('/consent/opt-out', async ({ workspaceId, body, set }) => {
    const { customerId } = body as { customerId: string }

    try {
    const confirmationText = await optOut(workspaceId!, customerId)

    // Fetch the updated record to return
    const consent = await getConsent(workspaceId!, customerId)

    await logConsentEvent(workspaceId!, customerId, 'opt_out', {
      source: 'opt_out_request',
    })

    logger.info('Consent opt-out processed', { workspaceId, customerId })
    return { success: true, consent, confirmationText }
    } catch (err: any) {
      logger.error('Opt-out error', { workspaceId, customerId, error: err?.message })
      return serverError(set, 'Failed to process opt-out')
    }
  }, {
    body: t.Object({
      customerId: t.String(),
    }),
  })
