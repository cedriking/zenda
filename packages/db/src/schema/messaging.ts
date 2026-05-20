import { pgTable, uuid, varchar, timestamp, text, pgEnum, integer, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { customers } from './customers.js'
import { conversations } from './conversations.js'
import { appointments } from './appointments.js'

// --- Enums ---

export const messagingConsentStatusEnum = pgEnum('messaging_consent_status', [
  'unknown', 'allowed', 'limited', 'opted_out',
])

export const consentSourceEnum = pgEnum('consent_source', [
  'customer_inbound_message', 'whatsapp_booking', 'booking_form', 'business_import',
  'manual_owner_confirmation', 'opt_out_request',
])

export const messagePurposeEnum = pgEnum('message_purpose', [
  'appointment_confirmation',
  'appointment_reminder',
  'appointment_reschedule',
  'appointment_cancellation',
  'booking_follow_up',
  'booking_assistance',
  'booking_confirmation',
  'customer_inquiry_reply',
  'inbound_reply',
  'business_follow_up',
  'marketing',
  'unknown',
])

export const reminderTypeEnum = pgEnum('reminder_type', [
  'day_before', 'same_day',
])

// --- Tables ---

export const messagingConsent = pgTable('messaging_consent', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull(),
  status: messagingConsentStatusEnum('status').notNull().default('unknown'),
  source: consentSourceEnum('source'),
  allowedPurposes: messagePurposeEnum('allowed_purposes').array().default([]),
  capturedAt: timestamp('captured_at', { withTimezone: true }),
  lastInboundMessageAt: timestamp('last_inbound_message_at', { withTimezone: true }),
  lastOutboundMessageAt: timestamp('last_outbound_message_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('messaging_consent_workspace_customer_idx').on(table.workspaceId, table.customerId),
  index('messaging_consent_phone_idx').on(table.phoneNumber),
])

export const outboundMessageLog = pgTable('outbound_message_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  outboundSinceLastInbound: integer('outbound_since_last_inbound').notNull().default(0),
  lastInboundAt: timestamp('last_inbound_at', { withTimezone: true }),
  lastOutboundAt: timestamp('last_outbound_at', { withTimezone: true }),
  purposeOfLastOutbound: messagePurposeEnum('purpose_of_last_outbound'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('outbound_message_log_workspace_customer_idx').on(table.workspaceId, table.customerId),
])

export const sentReminderLog = pgTable('sent_reminder_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
  reminderType: reminderTypeEnum('reminder_type').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('sent_reminder_log_appointment_type_idx').on(table.appointmentId, table.reminderType),
])

export const queueStatusEnum = pgEnum('queue_status', ['pending', 'processing', 'sent', 'failed', 'dead_letter'])

export const queuePriorityEnum = pgEnum('queue_priority', ['emergency', 'reminder', 'notification', 'low'])

export const outboundQueue = pgTable('outbound_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  purpose: messagePurposeEnum('purpose').notNull(),
  content: text('content').notNull(),
  contentType: varchar('content_type', { length: 20 }).notNull().default('text'),
  status: queueStatusEnum('status').notNull().default('pending'),
  priority: queuePriorityEnum('priority').notNull().default('notification'),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(5),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  appointmentId: uuid('appointment_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
