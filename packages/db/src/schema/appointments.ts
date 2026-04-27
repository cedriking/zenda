import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { customers } from './customers.js'
import { services } from './services.js'
import { staffMembers } from './services.js'
import { conversations } from './conversations.js'

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'requested', 'pending_confirmation', 'confirmed', 'reminder_sent',
  'client_confirmed', 'reschedule_requested', 'rescheduled',
  'cancel_requested', 'cancelled', 'completed', 'no_show', 'needs_attention',
])

export const confirmationStatusEnum = pgEnum('confirmation_status', ['pending', 'confirmed', 'expired'])
export const reminderStatusEnum = pgEnum('reminder_status', ['none', 'scheduled', 'sent', 'confirmed'])
export const createdByEnum = pgEnum('created_by', ['ai', 'owner', 'system'])

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  staffMemberId: uuid('staff_member_id').references(() => staffMembers.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  status: appointmentStatusEnum('status').notNull().default('requested'),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  timezone: varchar('timezone', { length: 50 }).notNull(),
  sourceConversationId: uuid('source_conversation_id').references(() => conversations.id),
  createdBy: createdByEnum('created_by').notNull().default('owner'),
  confirmationStatus: confirmationStatusEnum('confirmation_status').notNull().default('pending'),
  reminderStatus: reminderStatusEnum('reminder_status').notNull().default('none'),
  notes: varchar('notes', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})
