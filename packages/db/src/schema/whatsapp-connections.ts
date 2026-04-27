import { pgTable, uuid, varchar, timestamp, pgEnum, text } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'

export const whatsappConnectionStatusEnum = pgEnum('whatsapp_connection_status', [
  'connected', 'connecting', 'qr_required', 'disconnected',
  'session_expired', 'error', 'rate_limited', 'maintenance',
])

export const whatsappConnections = pgTable('whatsapp_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  status: whatsappConnectionStatusEnum('status').notNull().default('disconnected'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  sessionData: text('session_data'),
  lastConnectedAt: timestamp('last_connected_at', { withTimezone: true }),
  lastDisconnectedAt: timestamp('last_disconnected_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
