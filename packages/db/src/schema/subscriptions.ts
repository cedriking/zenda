import { pgTable, uuid, varchar, timestamp, integer, boolean, pgEnum, primaryKey } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'

export const planTierEnum = pgEnum('plan_tier', ['local_solo', 'local_starter', 'local_pro', 'local_business'])
export const billingPeriodEnum = pgEnum('billing_period', ['monthly', 'annual'])
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing', 'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'paused',
])

export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: planTierEnum('tier').notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  monthlyPriceCents: integer('monthly_price_cents').notNull(),
  activeContactsLimit: integer('active_contacts_limit').notNull(),
  calendarsStaffLimit: integer('calendars_staff_limit').notNull(),
  locationsLimit: integer('locations_limit').notNull(),
  setupType: varchar('setup_type', { length: 20 }).notNull(),
  retentionDays: integer('retention_days').notNull(),
})

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  planTier: planTierEnum('plan_tier').notNull().default('local_solo'),
  billingPeriod: billingPeriodEnum('billing_period').notNull().default('monthly'),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const processedStripeEvents = pgTable('processed_stripe_events', {
  id: varchar('id').primaryKey(), // Stripe event ID (evt_...)
  eventType: varchar('event_type', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
})

export const usageRecords = pgTable('usage_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  metric: varchar('metric', { length: 50 }).notNull(),
  value: integer('value').notNull().default(0),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Dedup table for active appointment contacts per billing period
// PK: (workspaceId, customerPhone, periodStart) — one active contact per period
export const activeContactDedup = pgTable('active_contact_dedup', {
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  firstActionAt: timestamp('first_action_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey(table.workspaceId, table.customerPhone, table.periodStart),
}))
