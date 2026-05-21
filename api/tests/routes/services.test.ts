import { describe, test, expect } from 'bun:test'
import { Elysia, t } from 'elysia'
import { createServiceSchema, updateServiceSchema } from '@zenda/shared'

describe('Service validation', () => {
  test('createServiceSchema accepts valid input', () => {
    const result = createServiceSchema.safeParse({
      name: 'Haircut',
      description: 'Standard haircut',
      durationMinutes: 30,
      priceCents: 5000,
    })
    expect(result.success).toBe(true)
  })

  test('createServiceSchema rejects missing name', () => {
    const result = createServiceSchema.safeParse({
      durationMinutes: 30,
    })
    expect(result.success).toBe(false)
  })

  test('createServiceSchema rejects missing durationMinutes', () => {
    const result = createServiceSchema.safeParse({
      name: 'Haircut',
    })
    expect(result.success).toBe(false)
  })

  test('updateServiceSchema accepts partial update', () => {
    const result = updateServiceSchema.safeParse({
      name: 'New Name',
    })
    expect(result.success).toBe(true)
  })

  test('updateServiceSchema accepts empty object', () => {
    const result = updateServiceSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('Service route body validation', () => {
  const app = new Elysia()
    .post('/', async ({ body, set }) => {
      const parsed = createServiceSchema.safeParse(body)
      if (!parsed.success) {
        set.status = 400
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
      }
      return parsed.data
    }, {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        durationMinutes: t.Number(),
        priceCents: t.Optional(t.Number()),
      }),
    })

  test('POST with valid data returns parsed data', async () => {
    const res = await app.handle(new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Haircut', durationMinutes: 30 }),
    }))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.name).toBe('Haircut')
  })

  test('POST with missing required fields returns 400', async () => {
    const res = await app.handle(new Request('http://localhost/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'No name or duration' }),
    }))
    expect(res.status).toBe(422)
  })
})
