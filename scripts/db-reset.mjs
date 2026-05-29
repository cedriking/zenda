import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_URL = process.env.DATABASE_URL;

async function reset() {
  // Step 1: Nuke
  console.log("Step 1: Nuking existing database...");
  const nukeSql = postgres(DB_URL);
  await nukeSql.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE");
  const tables =
    await nukeSql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
  for (const t of tables) {
    await nukeSql.unsafe(`DROP TABLE IF EXISTS "${t.tablename}" CASCADE`);
  }
  const enums = await nukeSql`
    SELECT t.typname FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public' AND t.typtype = 'e'
  `;
  for (const e of enums) {
    await nukeSql.unsafe(`DROP TYPE IF EXISTS "${e.typname}" CASCADE`);
  }
  console.log(`  Dropped ${tables.length} tables, ${enums.length} enums`);
  await nukeSql.end();

  // Step 2: Read migration SQL
  const migrationDir = path.join(
    __dirname,
    "..",
    "packages",
    "db",
    "src",
    "migrations"
  );
  const sqlFiles = fs
    .readdirSync(migrationDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  console.log(`\nStep 2: Applying ${sqlFiles.length} migration(s)...`);

  // Step 3: Apply using a fresh connection with notice handling
  const applySql = postgres(DB_URL, {
    onnotice: () => {}, // suppress notices
  });

  for (const file of sqlFiles) {
    console.log(`  Applying: ${file}`);
    const content = fs.readFileSync(path.join(migrationDir, file), "utf8");

    // Split by drizzle's statement breakpoint
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.replace(/--> statement\s*$/, "").trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await applySql.unsafe(stmt);
      } catch (e) {
        // Ignore "already exists" notices
        if (!e.message.includes("already exists")) {
          console.error(`  ERROR: ${e.message.substring(0, 200)}`);
          throw e;
        }
      }
    }
  }

  // Step 4: Create drizzle migration tracking
  console.log("\nStep 3: Setting up drizzle migration tracking...");
  await applySql.unsafe("CREATE SCHEMA IF NOT EXISTS drizzle");
  await applySql.unsafe(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  // Insert migration records
  const metaDir = path.join(migrationDir, "meta");
  const journalPath = path.join(metaDir, "_journal.json");
  if (fs.existsSync(journalPath)) {
    const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
    for (const entry of journal.entries) {
      // Find the actual SQL file for this entry
      const sqlFiles = fs
        .readdirSync(migrationDir)
        .filter((f) => f.startsWith(entry.tag) && f.endsWith(".sql"));
      if (sqlFiles.length > 0) {
        const fileContent = fs.readFileSync(
          path.join(migrationDir, sqlFiles[0]),
          "utf8"
        );
        const hash = crypto
          .createHash("sha256")
          .update(fileContent)
          .digest("hex")
          .substring(0, 16);
        await applySql.unsafe(
          `INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
          [hash, Date.now()]
        );
        console.log(`  Tracked: ${sqlFiles[0]}`);
      }
    }
  }

  // Step 4: Verify
  console.log("\nStep 4: Verifying...");
  const finalTables = await applySql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  `;
  const finalEnums = await applySql`
    SELECT t.typname FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public' AND t.typtype = 'e'
  `;

  console.log(`  Tables: ${finalTables.length}`);
  finalTables.forEach((r) => console.log(`    ${r.tablename}`));
  console.log(`  Enums: ${finalEnums.length}`);

  await applySql.end();
  console.log("\nDatabase reset complete!");
}

reset().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
