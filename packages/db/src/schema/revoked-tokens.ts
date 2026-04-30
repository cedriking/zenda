import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core'

export const revokedTokens = pgTable('revoked_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenJti: varchar('token_jti', { length: 36 }).notNull().unique(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('idx_revoked_tokens_jti').on(table.tokenJti),
  index('idx_revoked_tokens_revoked_at').on(table.revokedAt),
])
