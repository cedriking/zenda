/**
 * Batch verify prospect emails from a CSV-like text file or stdin.
 *
 * Usage:
 *   echo "contacto@rafaellasalon.com
 *   fake@nonexistent-domain-xyz.com" | bun run scripts/verify-prospect-emails.ts
 *
 *   bun run scripts/verify-prospect-emails.ts emails.txt
 *
 * Output: JSON array of verification results
 */
import { verifyEmailBatch } from "../api/src/infra/email-verifier.js";

const SPLIT_RE = /[\n,]/;

async function main() {
  const input = process.argv[2];

  let text: string;
  if (input) {
    const file = Bun.file(input);
    text = await file.text();
  } else {
    text = await Bun.stdin.text();
  }

  const emails = text
    .split(SPLIT_RE)
    .map((e: string) => e.trim())
    .filter((e: string) => e.length > 0 && e.includes("@"));

  if (emails.length === 0) {
    console.error("No emails found in input");
    process.exit(1);
  }

  console.error(`Verifying ${emails.length} email(s)...`);

  const results = await verifyEmailBatch(emails);

  // Summary
  const valid = results.filter((r) => r.status === "valid").length;
  const invalid = results.filter((r) => r.status === "invalid").length;
  const risky = results.filter((r) => r.status === "risky").length;

  console.error(
    `\nResults: ${valid} valid, ${invalid} invalid, ${risky} risky`
  );
  console.error("---");

  // Table output for humans
  for (const r of results) {
    console.error(`${r.status.padEnd(8)} ${r.email.padEnd(40)} ${r.reason}`);
  }

  // JSON to stdout for piping
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
