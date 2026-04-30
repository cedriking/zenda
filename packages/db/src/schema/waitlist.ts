import { pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const waitlistEntries = pgTable('waitlist_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 200 }),
  businessType: varchar('business_type', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('waitlist_email_unique').on(table.email),
])
