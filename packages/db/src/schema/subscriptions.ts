import { pgTable, uuid, varchar, timestamp, integer, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'

export const planTierEnum = pgEnum('plan_tier', ['starter', 'pro', 'business'])
export const billingPeriodEnum = pgEnum('billing_period', ['monthly', 'annual'])
export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'trialing', 'active', 'past_due', 'unpaid', 'canceled', 'incomplete', 'paused',
])

export const plans = pgTable('plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  tier: planTierEnum('tier').notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  monthlyPriceCents: integer('monthly_price_cents').notNull(),
  annualPriceCents: integer('annual_price_cents').notNull(),
  conversationsLimit: integer('conversations_limit').notNull(),
  appointmentsLimit: integer('appointments_limit').notNull(),
  voiceMinutesLimit: integer('voice_minutes_limit').notNull(),
  staffLimit: integer('staff_limit').notNull(),
  retentionDays: integer('retention_days').notNull(),
})

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  planTier: planTierEnum('plan_tier').notNull().default('starter'),
  billingPeriod: billingPeriodEnum('billing_period').notNull().default('monthly'),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const usageRecords = pgTable('usage_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  metric: varchar('metric', { length: 50 }).notNull(),
  value: integer('value').notNull().default(0),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
