import { typedContext } from '../../middleware/typed-context.js'
import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { auditLogs } from '@zenda/db/schema'
import { eq, and, desc, sql, count, gte, lte } from 'drizzle-orm'
import { logger } from '../../infra/logger.js'
import { redactPII } from './logger.js'

export const auditModule = new Elysia({ prefix: '/audit' })
  .use(typedContext)

  // List audit logs with pagination and optional filters
  .get('/', async ({ workspaceId, query }) => {
    const { entityType, entityId, action, limit = 50, offset = 0 } = query

    const conditions = [eq(auditLogs.workspaceId, workspaceId!)]
    if (entityType) conditions.push(eq(auditLogs.entityType, entityType))
    if (entityId) conditions.push(eq(auditLogs.entityId, entityId))
    if (action) conditions.push(eq(auditLogs.action, action))

    const where = and(...conditions)

    const [logs, [{ total }]] = await Promise.all([
      db.select().from(auditLogs).where(where)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit).offset(offset),
      db.select({ total: count() }).from(auditLogs).where(where),
    ])

    return { logs, total }
  }, {
    query: t.Object({
      entityType: t.Optional(t.String()),
      entityId: t.Optional(t.String()),
      action: t.Optional(t.String()),
      limit: t.Optional(t.Number()),
      offset: t.Optional(t.Number()),
    }),
  })

  // Export audit logs as CSV
  .get('/export', async ({ workspaceId, query, set }) => {
    const { entityType, from, to } = query

    const conditions = [eq(auditLogs.workspaceId, workspaceId!)]
    if (entityType) conditions.push(eq(auditLogs.entityType, entityType))
    if (from) conditions.push(gte(auditLogs.createdAt, new Date(from)))
    if (to) conditions.push(lte(auditLogs.createdAt, new Date(to)))

    const rows = await db.select().from(auditLogs)
      .where(and(...conditions))
      .orderBy(desc(auditLogs.createdAt))

    const header = 'timestamp,actor_type,actor_id,action,entity_type,entity_id,details'
    const csv = rows.map(r =>
      [
        r.createdAt.toISOString(),
        r.actorType,
        r.actorId ?? '',
        r.action,
        r.entityType,
        r.entityId ?? '',
        redactPII(JSON.stringify(r.metadata ?? {})),
      ].join(','),
    ).join('\n')

    set.headers['content-type'] = 'text/csv'
    return `${header}\n${csv}`
  }, {
    query: t.Object({
      entityType: t.Optional(t.String()),
      from: t.Optional(t.String()),
      to: t.Optional(t.String()),
    }),
  })

  // Get audit event counts grouped by action
  .get('/stats', async ({ workspaceId }) => {
    const rows = await db
      .select({ action: auditLogs.action, count: count() })
      .from(auditLogs)
      .where(eq(auditLogs.workspaceId, workspaceId!))
      .groupBy(auditLogs.action)

    const counts: Record<string, number> = {}
    let total = 0
    for (const row of rows) {
      counts[row.action] = row.count
      total += row.count
    }

    return { counts, total }
  })
