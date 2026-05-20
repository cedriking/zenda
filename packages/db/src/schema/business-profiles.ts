import { pgTable, uuid, varchar, timestamp, text, pgEnum, integer, boolean, jsonb } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'

export const businessCategoryEnum = pgEnum('business_category', [
  'beauty', 'wellness', 'health', 'coaching', 'fitness', 'other',
])

export const priceDisplayEnum = pgEnum('price_display', ['show', 'hide', 'on_request'])

export const cancellationStrictnessEnum = pgEnum('cancellation_strictness', [
  'lenient', 'standard', 'strict',
])

export const personalityPresetEnum = pgEnum('personality_preset', [
  'professional', 'warm', 'minimal', 'premium', 'friendly',
])

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
  cancellationWindowHours: integer('cancellation_window_hours').notNull().default(24),
  reschedulingWindowHours: integer('rescheduling_window_hours').notNull().default(2),
  depositRequired: boolean('deposit_required').notNull().default(false),
  depositAmountCents: integer('deposit_amount_cents'),
  approvedCancellationText: text('approved_cancellation_text'),
  approvedRefundText: text('approved_refund_text'),
  approvedDiscountText: text('approved_discount_text'),
  emergencyEscalationInstructions: text('emergency_escalation_instructions'),
  sensitiveTopics: text('sensitive_topics').array().default([]),
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
  personalityPreset: personalityPresetEnum('personality_preset').notNull().default('professional'),
  greetingStyle: text('greeting_style'),
  formalityLevel: integer('formality_level').notNull().default(3),
  concisenessLevel: integer('conciseness_level').notNull().default(3),
  warmthLevel: integer('warmth_level').notNull().default(3),
  useEmoji: boolean('use_emoji').notNull().default(false),
  speaksAsBusiness: boolean('speaks_as_business').notNull().default(false),
  proactivelySuggestTimes: boolean('proactively_suggest_times').notNull().default(true),
  confirmsBeforeBooking: boolean('confirms_before_booking').notNull().default(true),
  notifyOwnerEveryAppointment: boolean('notify_owner_every_appointment').notNull().default(true),
  cancellationPolicyStrictness: cancellationStrictnessEnum('cancellation_policy_strictness').notNull().default('standard'),
  refundHandlingMode: varchar('refund_handling_mode', { length: 50 }),
  discountHandlingMode: varchar('discount_handling_mode', { length: 50 }),
  depositHandlingMode: varchar('deposit_handling_mode', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
