import { pgTable, uuid, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users.js'

export const onboardingStepEnum = pgEnum('onboarding_step', [
  'not_started',
  'whatsapp_connected',
  'business_info',
  'services',
  'availability',
  'policies',
  'receptionist_config',
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
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull().default('owner'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
