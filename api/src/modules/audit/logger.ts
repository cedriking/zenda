import { db } from '@zenda/db/client'
import { auditLogs } from '@zenda/db/schema'
import type { ActorType } from '@zenda/shared'

interface AuditLogInput {
  workspaceId: string
  actorType: ActorType
  actorId?: string
  action: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
}

export async function logAudit(input: AuditLogInput) {
  await db.insert(auditLogs).values({
    workspaceId: input.workspaceId,
    actorType: input.actorType,
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    details: input.details ?? null,
  })
}
