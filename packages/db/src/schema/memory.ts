import { pgTable, uuid, varchar, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { customers } from './customers.js'
import { languageEnum } from './workspaces.js'

export const memorySourceEnum = pgEnum('memory_source', ['ai_extraction', 'owner_note', 'system'])

export const agentMemory = pgTable('agent_memory', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }),
  key: varchar('key', { length: 100 }).notNull(),
  value: text('value').notNull(),
  source: memorySourceEnum('source').notNull().default('ai_extraction'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const knowledgeBaseItems = pgTable('knowledge_base_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  question: varchar('question', { length: 300 }).notNull(),
  answer: text('answer').notNull(),
  language: languageEnum('language').notNull().default('es'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
