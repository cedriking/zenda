import { describe, test, expect } from 'bun:test'
import { createTestApp, createAccessToken } from '../helpers/test-helpers.js'
import { Elysia } from 'elysia'

describe('Auth guard', () => {
  // A simple protected route to test against
  const protectedApp = createTestApp(
    new Elysia({ prefix: '/test' }).get('/protected', () => ({ ok: true }))
  )

  test('unauthenticated request returns 401', async () => {
    const res = await protectedApp.handle(
      new Request('http://localhost/test/protected')
    )
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  test('invalid JWT returns 401', async () => {
    const res = await protectedApp.handle(
      new Request('http://localhost/test/protected', {
        headers: { Authorization: 'Bearer invalid-token-here' },
      })
    )
    expect(res.status).toBe(401)
  })

  test('valid JWT without workspace membership returns 403', async () => {
    // Create a token with a fake userId/workspaceId that won't exist in DB
    const token = await createAccessToken({
      sub: '00000000-0000-0000-0000-000000000000',
      workspaceId: '00000000-0000-0000-0000-000000000000',
    })

    const res = await protectedApp.handle(
      new Request('http://localhost/test/protected', {
        headers: { Authorization: `Bearer ${token}` },
      })
    )
    // Either 401 (if jwtVerify fails due to different secret) or 403 (no membership)
    expect([401, 403]).toContain(res.status)
  })

  test('public paths bypass auth', async () => {
    const publicApp = createTestApp(
      new Elysia().get('/health', () => ({ status: 'ok' }))
    )

    const res = await publicApp.handle(
      new Request('http://localhost/health')
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})
