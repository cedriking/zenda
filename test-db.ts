import postgres from 'postgres'
const sql = postgres('postgres://postgres:RFAyPPrpCSmc4oBdD09d2E8tJddYUq2ItJwmJFR2cR2K3gIGJhjIXSSZLupHVyGr@100.74.221.45:5455/postgres', { connect_timeout: 8 })
try {
  // Exact query from Drizzle error
  const result = await sql`select "id", "email", "name", "password_hash", "created_at", "updated_at" from "users" where "users"."email" = 'debug-user-99@example.com' limit 1`
  console.log('Query result:', JSON.stringify(result))
} catch(e: any) {
  console.log('ERROR:', e.message)
  console.log('CODE:', e.code)
}
await sql.end()
