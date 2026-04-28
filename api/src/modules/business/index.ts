import { Elysia, t } from 'elysia'
import { db } from '@zenda/db/client'
import { businessProfiles, receptionistProfiles } from '@zenda/db/schema'
import { eq } from 'drizzle-orm'
import { appPlugin } from '../../middleware/app-plugin.js'

export const businessModule = new Elysia({ prefix: '/business' })
  .use(appPlugin)

  // Get business profile
  .get('/profile', async ({ workspaceId }) => {
    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.workspaceId, workspaceId!))
      .limit(1)
    return profile ?? { error: 'Business profile not found' }
  })

  // Update business profile
  .patch('/profile', async ({ workspaceId, body }) => {
    const data = body as Record<string, unknown>
    const [updated] = await db
      .update(businessProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(businessProfiles.workspaceId, workspaceId!))
      .returning()
    return updated
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      category: t.Optional(t.String()),
      description: t.Optional(t.String()),
      location: t.Optional(t.String()),
      cancellationPolicy: t.Optional(t.String()),
      refundPolicy: t.Optional(t.String()),
      priceDisplayPreference: t.Optional(t.String()),
    }),
  })

  // Get receptionist profile
  .get('/receptionist', async ({ workspaceId }) => {
    const [profile] = await db
      .select()
      .from(receptionistProfiles)
      .where(eq(receptionistProfiles.workspaceId, workspaceId!))
      .limit(1)
    return profile ?? { error: 'Receptionist profile not found' }
  })

  // Update receptionist profile
  .patch('/receptionist', async ({ workspaceId, body }) => {
    const data = body as Record<string, unknown>
    const [updated] = await db
      .update(receptionistProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(receptionistProfiles.workspaceId, workspaceId!))
      .returning()
    return updated
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      tone: t.Optional(t.String()),
      greetingTemplate: t.Optional(t.String()),
    }),
  })
