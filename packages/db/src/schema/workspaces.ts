import { pgTable, uuid, varchar, timestamp, pgEnum, uniqueIndex, index, integer, jsonb } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const onboardingStepEnum = pgEnum('onboarding_step', [
  'not_started',
  'whatsapp_connected',
  'business_info',
  'services',
  'availability',
  'policies',
  'receptionist_config',
  'plan_selection',
  'ready',
])

export const languageEnum = pgEnum('language', ['en', 'es'])

export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  timezone: varchar('timezone', { length: 50 }).notNull().default('America/Mexico_City'),
  country: varchar('country', { length: 2 }).notNull().default('MX'),
  defaultLanguage: languageEnum('default_language').notNull().default('es'),
  onboardingStep: onboardingStepEnum('onboarding_step').notNull().default('not_started'),
  onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
  // Composio integration
  composioAccountId: varchar('composio_account_id', { length: 255 }),
  composioCalendarId: varchar('composio_calendar_id', { length: 255 }),
  composioConnectedAt: timestamp('composio_connected_at', { withTimezone: true }),
  // Messaging config (§9, §10)
  maxRemindersPerAppointment: integer('max_reminders_per_appointment').notNull().default(2),
  maxOutboundWithoutReply: integer('max_outbound_without_reply').notNull().default(3),
  outboundLimitsConfig: jsonb('outbound_limits_config').$type<Record<string, unknown>>().default({}),
  // Reminder schedule config (§14.3)
  reminderSchedule: jsonb('reminder_schedule').$type<Array<{
    offsetHours: number
    type: 'reminder' | 'confirmation_prompt'
  }>>().default([
    { offsetHours: 24, type: 'reminder' },
    { offsetHours: 2, type: 'confirmation_prompt' },
  ]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('owner'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('workspace_members_workspace_user_idx').on(table.workspaceId, table.userId),
])
