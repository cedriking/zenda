import { db } from '@zenda/db/client'
import { sql } from 'drizzle-orm'

console.log('Testing db.execute...')
try {
  const result = await db.execute(sql`SELECT 1 as ok`)
  console.log('DB execute OK:', JSON.stringify(result))
} catch (err: any) {
  console.log('DB execute FAILED:', err.message)
  console.log('Cause:', err.cause?.message)
  console.log('Stack:', err.stack?.split('\n').slice(0, 5).join('\n'))
}
