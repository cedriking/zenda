/**
 * Direct SQL migration runner — bypasses drizzle-kit entirely.
 *
 * drizzle-kit migrate validates snapshot files before running SQL, and
 * crashes when snapshots are missing (we have hand-written migrations
 * without snapshots). This script reads each .sql file from the
 * migrations directory in order and executes it directly against PostgreSQL.
 *
 * All our migration files are idempotent (IF NOT EXISTS, DO $ blocks),
 * so re-running them is safe.
 */
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, "migrations");
const STATEMENT_BREAKPOINT = /--> statement-breakpoint/;

const connectionString =
  process.env.DATABASE_URL ?? "postgres://zenda:zenda_dev@localhost:5432/zenda";

async function run() {
  const sql = postgres(connectionString, {
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : undefined,
    connect_timeout: 10,
  });

  try {
    // Create a tracking table so we only run new migrations
    await sql`
      CREATE TABLE IF NOT EXISTS _sql_migrations (
        tag TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const tag = file.replace(".sql", "");

      const [existing] = await sql`
        SELECT 1 FROM _sql_migrations WHERE tag = ${tag}
      `;
      if (existing) {
        console.log(`[migrate] SKIP ${tag} (already applied)`);
        continue;
      }

      const raw = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`[migrate] RUN  ${tag}`);

      // Split on drizzle's statement breakpoint comments and run each statement
      const statements = raw
        .split(STATEMENT_BREAKPOINT)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        await sql.unsafe(stmt);
      }

      await sql`
        INSERT INTO _sql_migrations (tag) VALUES (${tag})
      `;
      console.log(`[migrate] OK   ${tag}`);
    }

    console.log("[migrate] All migrations applied successfully.");
  } catch (err) {
    console.error("[migrate] FAILED:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
