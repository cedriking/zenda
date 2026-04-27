import { Elysia, t } from 'elysia'
import { logger } from '../../infra/logger.js'

// In-memory waitlist for early access (replace with DB table in production)
const waitlist: Array<{ email: string; name: string; businessType: string; createdAt: string }> = []

export const supportModule = new Elysia({ prefix: '/support' })

  // Contact/support form
  .post('/contact', async ({ body }) => {
    const { email, name, subject, message } = body as Record<string, string>

    logger.info('Support request', { email, subject })

    // In production, send to support email or ticket system
    return { received: true, message: 'We\'ll get back to you within 24 hours.' }
  }, {
    body: t.Object({
      email: t.String(),
      name: t.String(),
      subject: t.String(),
      message: t.String(),
    }),
  })

  // Early access waitlist
  .post('/waitlist', async ({ body }) => {
    const data = body as Record<string, string>

    // Prevent duplicates
    const exists = waitlist.some(e => e.email === data.email)
    if (exists) return { status: 'already_registered' }

    waitlist.push({
      email: data.email,
      name: data.name ?? '',
      businessType: data.businessType ?? '',
      createdAt: new Date().toISOString(),
    })

    logger.info('Waitlist signup', { email: data.email, position: waitlist.length })

    return { status: 'registered', position: waitlist.length }
  }, {
    body: t.Object({
      email: t.String(),
      name: t.Optional(t.String()),
      businessType: t.Optional(t.String()),
    }),
  })

  // Get waitlist count (admin)
  .get('/waitlist/count', async () => {
    return { count: waitlist.length }
  })
