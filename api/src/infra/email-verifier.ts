import { resolveMx } from "node:dns/promises";
import { logger } from "./logger.js";

// ─── Types ──────────────────────────────────────────────────────

export type VerificationStatus = "valid" | "invalid" | "risky" | "unknown";

export interface EmailVerificationResult {
  disposable: boolean;
  email: string;
  mxFound: boolean;
  reason: string;
  status: VerificationStatus;
}

// ─── Config ─────────────────────────────────────────────────────

const ABSTRACT_API_KEY = process.env.ABSTRACT_API_KEY ?? "";

// Known disposable/temp email domains — block these from outreach
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamailbiz.com",
  "guerrillamail.de",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "spam4.me",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "jetable.org",
  "jetable.net",
  "mailnesia.com",
  "mailcatch.com",
  "mailexpire.com",
  "trashmail.com",
  "trashmail.ws",
  "fakeinbox.com",
  "tempmail.com",
  "dispostable.com",
  "10minutemail.com",
  "maildrop.cc",
  "mailnest.me",
  "agentmail.to",
]);

// ─── Helpers ────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

function isDisposable(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain);
}

/** Basic syntax + format check */
function validateSyntax(email: string): { ok: boolean; reason: string } {
  if (!email || typeof email !== "string") {
    return { ok: false, reason: "empty or non-string" };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, reason: "invalid format" };
  }
  const domain = extractDomain(email);
  if (!domain.includes(".")) {
    return { ok: false, reason: "domain missing TLD" };
  }
  return { ok: true, reason: "" };
}

/** Check MX records for the email domain */
async function checkMx(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

/**
 * Verify a single email via AbstractAPI (optional — requires API key).
 * Falls back gracefully if no key is configured.
 */
async function verifyViaAbstractApi(
  email: string
): Promise<{ status: VerificationStatus; reason: string } | null> {
  if (!ABSTRACT_API_KEY) {
    return null;
  }

  try {
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${ABSTRACT_API_KEY}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as {
      is_valid_format: { value: boolean };
      is_smtp_valid: { value: boolean };
      is_disposable_email: { value: boolean };
      is_catchall_email: { value: boolean };
      deliverability: string;
    };

    if (!data.is_valid_format?.value) {
      return { status: "invalid", reason: "format rejected by AbstractAPI" };
    }
    if (data.is_disposable_email?.value) {
      return { status: "invalid", reason: "disposable email" };
    }
    if (data.is_smtp_valid?.value === false) {
      return { status: "invalid", reason: "SMTP check failed" };
    }
    if (data.is_catchall_email?.value) {
      return { status: "risky", reason: "catch-all domain" };
    }
    return { status: "valid", reason: "AbstractAPI verified" };
  } catch (err) {
    logger.warn("AbstractAPI verification failed", {
      email,
      error: (err as Error).message,
    });
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Verify an email address.
 *
 * Tier 1 (always, free): syntax check + MX record lookup + disposable check
 * Tier 2 (optional, requires ABSTRACT_API_KEY): SMTP-level verification via AbstractAPI
 *
 * Returns a structured result with status and reason.
 */
export async function verifyEmail(
  email: string
): Promise<EmailVerificationResult> {
  const domain = extractDomain(email);

  // Tier 1: Syntax
  const syntax = validateSyntax(email);
  if (!syntax.ok) {
    return {
      email,
      status: "invalid",
      reason: syntax.reason,
      mxFound: false,
      disposable: false,
    };
  }

  // Tier 1: Disposable check
  if (isDisposable(domain)) {
    return {
      email,
      status: "invalid",
      reason: "disposable/temp email domain",
      mxFound: false,
      disposable: true,
    };
  }

  // Tier 1: MX record check
  const mxFound = await checkMx(domain);
  if (!mxFound) {
    return {
      email,
      status: "invalid",
      reason: "no MX records found for domain",
      mxFound: false,
      disposable: false,
    };
  }

  // Tier 2: AbstractAPI (if key configured)
  const apiResult = await verifyViaAbstractApi(email);
  if (apiResult) {
    return {
      email,
      status: apiResult.status,
      reason: apiResult.reason,
      mxFound: true,
      disposable: false,
    };
  }

  // Tier 1 only — MX found, no API verification
  return {
    email,
    status: "valid",
    reason: "syntax OK + MX records found",
    mxFound: true,
    disposable: false,
  };
}

/**
 * Batch verify a list of emails. Returns results for all.
 * Runs MX checks concurrently (up to 10 at a time).
 */
export async function verifyEmailBatch(
  emails: string[]
): Promise<EmailVerificationResult[]> {
  const CONCURRENCY = 10;
  const results: EmailVerificationResult[] = [];

  for (let i = 0; i < emails.length; i += CONCURRENCY) {
    const batch = emails.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(verifyEmail));
    results.push(...batchResults);
  }

  return results;
}
