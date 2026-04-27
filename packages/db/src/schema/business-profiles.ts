import { pgTable, uuid, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'

export const businessCategoryEnum = pgEnum('business_category', [
  'beauty', 'wellness', 'health', 'coaching', 'fitness', 'other',
])

export const priceDisplayEnum = pgEnum('price_display', ['show', 'hide', 'on_request'])

export const businessProfiles = pgTable('business_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  category: businessCategoryEnum('category').default('other'),
  description: text('description'),
  descriptionEs: text('description_es'),
  location: varchar('location', { length: 300 }),
  cancellationPolicy: text('cancellation_policy'),
  cancellationPolicyEs: text('cancellation_policy_es'),
  refundPolicy: text('refund_policy'),
  priceDisplayPreference: priceDisplayEnum('price_display_preference').notNull().default('show'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const receptionistToneEnum = pgEnum('receptionist_tone', [
  'professional', 'warm', 'friendly', 'elegant', 'casual',
])

export const receptionistProfiles = pgTable('receptionist_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull().default('Noa'),
  tone: receptionistToneEnum('tone').notNull().default('professional'),
  greetingTemplate: text('greeting_template'),
  greetingTemplateEs: text('greeting_template_es'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
