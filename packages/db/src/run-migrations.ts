import fs from 'fs'
import path from 'path'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL ?? 'postgres://zenda:zenda_dev@localhost:5432/zenda'
const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined

const sql = postgres(connectionString, { ssl })

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, 'migrations')

  // Read journal to get ordered migration list
  const journalPath = path.join(migrationsDir, 'meta', '_journal.json')
  const journal = JSON.parse(fs.readFileSync(journalPath, 'utf-8'))
  const entries: Array<{ tag: string }> = journal.entries

  // Ensure migration tracking table exists
  console.log('[migrate] Ensuring migration tracking table...')
  await sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`
  await sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `

  // Get already-applied migrations
  const applied = await sql<{ hash: string }[]>`
    SELECT hash FROM "drizzle"."__drizzle_migrations"
  `
  const appliedSet = new Set(applied.map(r => r.hash))

  let appliedCount = 0

  for (const entry of entries) {
    const tag = entry.tag
    if (appliedSet.has(tag)) {
      console.log(`[migrate] Skipping ${tag} (already applied)`)
      continue
    }

    const sqlFile = path.join(migrationsDir, `${tag}.sql`)
    if (!fs.existsSync(sqlFile)) {
      console.error(`[migrate] ERROR: Migration file not found: ${sqlFile}`)
      process.exit(1)
    }

    const rawSql = fs.readFileSync(sqlFile, 'utf-8')

    // Split on --> statement-breakpoint (drizzle convention)
    const statements = rawSql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`[migrate] Applying ${tag} (${statements.length} statements)...`)

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      try {
        await sql.unsafe(stmt)
      } catch (err: any) {
        console.error(`[migrate] FAILED at ${tag} statement ${i + 1}/${statements.length}:`)
        console.error(`[migrate] SQL: ${stmt.substring(0, 200)}${stmt.length > 200 ? '...' : ''}`)
        console.error(`[migrate] Error: ${err.message}`)
        throw err
      }
    }

    // Record as applied using tag as hash
    await sql`
      INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
      VALUES (${tag}, ${Date.now()})
    `
    appliedCount++
    console.log(`[migrate] Applied ${tag}`)
  }

  if (appliedCount === 0) {
    console.log('[migrate] No new migrations to apply.')
  } else {
    console.log(`[migrate] Applied ${appliedCount} migration(s).`)
  }
}

runMigrations()
  .then(async () => {
    await sql.end()
    process.exit(0)
  })
  .catch(async (err) => {
    console.error('[migrate] Migration failed:', err.message)
    await sql.end()
    process.exit(1)
  })
