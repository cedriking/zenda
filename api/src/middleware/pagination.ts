import { Elysia } from 'elysia'

// Cursor-based pagination middleware for list endpoints
// Usage: append .use(pagination()) to any list route group

interface PaginationParams {
  limit: string
  cursor: string
}

export const pagination = () =>
  new Elysia({ name: 'pagination' })
    .derive(({ query }: { query: Record<string, string | undefined> }) => {
      const limit = Math.min(Math.max(parseInt(query?.limit ?? '50'), 1), 200)
      const cursor = query?.cursor ?? undefined
      return { pagination: { limit, cursor } }
    })

export function encodeCursor(fields: Record<string, string>): string {
  return Buffer.from(JSON.stringify(fields)).toString('base64url')
}

export function decodeCursor(cursor: string): Record<string, string> | null {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString())
  } catch {
    return null
  }
}
