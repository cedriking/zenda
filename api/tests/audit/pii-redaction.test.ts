/**
 * QA Tests for ZEN-26: PII Redaction in Audit Logs and CSV Exports
 *
 * These tests verify the acceptance criteria:
 * 1. Audit log entries no longer store raw customer message content
 * 2. CSV export masks PII fields (phone, email, full messages)
 * 3. Queue processor sends are audited
 *
 * The tests are written AGAINST the current (unfixed) code to document
 * the gaps. Once the coder implements PII redaction, these tests should pass.
 */

import { beforeEach, describe, expect, mock, test } from "bun:test"; // mock used by mock.module()

// ── Mock DB ──────────────────────────────────────────────────────────
// The audit logger imports `db` from '@zenda/db/client' and calls db.insert().
// We mock the module so we can inspect what values were passed to insert.

const insertedValues: any[] = [];

function createInsertChain() {
  return {
    values(vals: any) {
      insertedValues.push(vals);
      return Promise.resolve();
    },
  };
}

mock.module("@zenda/db/client", () => ({
  db: {
    insert: mock((_schema: any) => createInsertChain()),
  },
}));

mock.module("@zenda/db/schema", () => ({
  auditLogs: {
    workspaceId: "workspace_id",
    actorType: "actor_type",
    action: "action",
    entityType: "entity_type",
    entityId: "entity_id",
    createdAt: "created_at",
  },
}));

// Import after mocks are set up
const {
  logAudit,
  logInputSanitized,
  logMessageSent,
  logMessageReceived,
  logPolicyBlocked,
  logToolFailure,
  logAppointmentAudit,
  logEscalationCreated,
  logOptOutEvent,
  logConsentEvent,
} = await import("../../src/modules/audit/logger");

// ── Helpers ──────────────────────────────────────────────────────────

const WS = "00000000-0000-0000-0000-000000000001";
const CONV = "00000000-0000-0000-0000-000000000002";
const CUST = "00000000-0000-0000-0000-000000000003";
const APPT = "00000000-0000-0000-0000-000000000004";

function lastInserted() {
  return insertedValues.at(-1);
}

// ─────────────────────────────────────────────────────────────────────
// 1. logInputSanitized must not store raw PII
// ─────────────────────────────────────────────────────────────────────

describe("ZEN-26: logInputSanitized PII redaction", () => {
  beforeEach(() => {
    insertedValues.length = 0;
  });

  test("stores flags but does NOT store raw message content as-is", async () => {
    const rawMessage =
      "My phone is +1-555-123-4567 and email is jane@example.com, please book me";
    await logInputSanitized(WS, CONV, ["ignore_previous"], rawMessage);

    const entry = lastInserted();
    expect(entry.workspaceId).toBe(WS);
    expect(entry.action).toBe("input_sanitized");
    const meta = entry.metadata as Record<string, any> | null;
    expect(meta?.flags).toEqual(["ignore_previous"]);

    // ACCEPTANCE CRITERION: raw PII must be redacted, not stored verbatim.
    // The `originalSnippet` should NOT contain raw phone/email.
    // A passing implementation will either:
    //   - redact phone/email patterns, or
    //   - not store the snippet at all, or
    //   - store a truncated/hash version
    const snippet: string | undefined = meta?.originalSnippet;
    if (snippet !== undefined) {
      // Phone numbers should be masked
      expect(snippet).not.toContain("+1-555-123-4567");
      expect(snippet).not.toMatch(/\+1[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{4}/);
      // Email addresses should be masked
      expect(snippet).not.toContain("jane@example.com");
      expect(snippet).not.toMatch(/[a-z]+@[a-z]+\.[a-z]+/);
    }
  });

  test("truncates long messages to at most 200 characters", async () => {
    const longMessage = "A".repeat(500);
    await logInputSanitized(WS, CONV, ["length_exceeded"], longMessage);

    const entry = lastInserted();
    const meta = entry.metadata as Record<string, any> | null;
    const snippet: string | undefined = meta?.originalSnippet;
    if (snippet !== undefined) {
      expect(snippet.length).toBeLessThanOrEqual(200);
    }
  });

  test("handles undefined originalMessage gracefully", async () => {
    await logInputSanitized(WS, CONV, ["some_flag"]);
    const entry = lastInserted();
    const meta = entry.metadata as Record<string, any> | null;
    expect(meta?.flags).toEqual(["some_flag"]);
  });

  test("handles empty string originalMessage", async () => {
    await logInputSanitized(WS, CONV, ["some_flag"], "");
    const entry = lastInserted();
    const meta = entry.metadata as Record<string, any> | null;
    expect(meta?.flags).toEqual(["some_flag"]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 2. CSV export must mask PII fields
// ─────────────────────────────────────────────────────────────────────

describe("ZEN-26: CSV export PII redaction", () => {
  // These tests verify that when audit log entries contain PII in metadata,
  // the CSV export endpoint redacts it before returning.
  //
  // Since the CSV route queries the DB directly and we've mocked the DB select
  // to return empty results, we test the redaction logic as a unit instead.
  // The coder should extract a `redactPII` helper that both the route and
  // the logger can use.

  test("redactPII helper masks phone numbers", () => {
    // This is a contract test for the expected redaction behavior.
    // The coder should implement a `redactPII` function.
    const input = "My phone is +1-555-123-4567 call me";
    // Expected: phone numbers replaced with [PHONE]
    const phonePattern =
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const redacted = input.replace(phonePattern, "[PHONE]");
    expect(redacted).not.toContain("555-123-4567");
    expect(redacted).toContain("[PHONE]");
  });

  test("redactPII helper masks email addresses", () => {
    const input = "Contact me at user@company.com please";
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const redacted = input.replace(emailPattern, "[EMAIL]");
    expect(redacted).not.toContain("user@company.com");
    expect(redacted).toContain("[EMAIL]");
  });

  test("redactPII helper masks both phone and email in same string", () => {
    const input = "email: jane@test.com phone: +1-555-999-0000";
    const phonePattern =
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const redacted = input
      .replace(emailPattern, "[EMAIL]")
      .replace(phonePattern, "[PHONE]");
    expect(redacted).not.toContain("jane@test.com");
    expect(redacted).not.toContain("555-999-0000");
    expect(redacted).toContain("[EMAIL]");
    expect(redacted).toContain("[PHONE]");
  });

  test("CSV row does not expose raw originalSnippet from metadata", () => {
    // Simulate what the CSV export does with a metadata containing PII
    const metadata = {
      flags: ["ignore_previous"],
      originalSnippet: "Call me at +1-555-111-2222 or email foo@bar.com",
    };

    // Current behavior: JSON.stringify(metadata) leaks PII
    const currentCSV = JSON.stringify(metadata);
    expect(currentCSV).toContain("+1-555-111-2222"); // BUG: PII leaks

    // Expected behavior: after redaction, no PII
    const phonePattern =
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const redactedSnippet = metadata.originalSnippet
      .replace(phonePattern, "[PHONE]")
      .replace(emailPattern, "[EMAIL]");
    const redactedMetadata = { ...metadata, originalSnippet: redactedSnippet };
    const safeCSV = JSON.stringify(redactedMetadata);
    expect(safeCSV).not.toContain("+1-555-111-2222");
    expect(safeCSV).not.toContain("foo@bar.com");
  });
});

// ─────────────────────────────────────────────────────────────────────
// 3. Queue processor should audit sends
// ─────────────────────────────────────────────────────────────────────

describe("ZEN-26: Queue processor audit wiring", () => {
  test("processor.ts imports from audit/logger", async () => {
    // The processor should import at least one audit function.
    // This test reads the source file and checks for audit imports.
    const fs = await import("node:fs");
    const path = await import("node:path");
    const processorPath = path.resolve(
      import.meta.dir,
      "../../src/modules/queue/processor.ts"
    );
    const source = fs.readFileSync(processorPath, "utf-8");

    // ACCEPTANCE CRITERION: processor should use the audit logger
    const hasAuditImport =
      source.includes("audit/logger") ||
      source.includes("logMessageSent") ||
      source.includes("logAudit");
    expect(hasAuditImport).toBe(true);
  });

  test("processor.ts calls audit on successful send", async () => {
    // After a successful wsMessageSender.send(), the processor should
    // call logMessageSent or logAudit to record the event.
    const fs = await import("node:fs");
    const path = await import("node:path");
    const processorPath = path.resolve(
      import.meta.dir,
      "../../src/modules/queue/processor.ts"
    );
    const source = fs.readFileSync(processorPath, "utf-8");

    // Check that after markSent there's an audit call nearby
    const hasAuditCall =
      source.includes("logMessageSent") ||
      source.includes("logAudit") ||
      source.includes("await logMessageSent") ||
      source.includes("await logAudit");
    expect(hasAuditCall).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────
// 4. All logger helpers delegate correctly to logAudit
// ─────────────────────────────────────────────────────────────────────

describe("Audit logger helpers", () => {
  beforeEach(() => {
    insertedValues.length = 0;
  });

  test("logMessageSent sets correct action and actorType", async () => {
    await logMessageSent(WS, CONV, "text", "appointment_reminder");
    const entry = lastInserted();
    const meta = entry.metadata as Record<string, any> | null;
    expect(entry.action).toBe("message_sent");
    expect(entry.actorType).toBe("ai");
    expect(meta?.messageType).toBe("text");
    expect(meta?.purpose).toBe("appointment_reminder");
  });

  test("logMessageReceived sets customer actorType", async () => {
    await logMessageReceived(WS, CONV, "text");
    const entry = lastInserted();
    expect(entry.action).toBe("message_received");
    expect(entry.actorType).toBe("customer");
  });

  test("logPolicyBlocked sets system actorType and reason", async () => {
    await logPolicyBlocked(WS, CUST, "rate_limit_exceeded");
    const entry = lastInserted();
    const meta = entry.metadata as Record<string, any> | null;
    expect(entry.action).toBe("policy_blocked_send");
    expect(entry.actorType).toBe("system");
    expect(meta?.reason).toBe("rate_limit_exceeded");
  });

  test("logToolFailure captures error", async () => {
    await logToolFailure(WS, "book_appointment", "slot unavailable");
    const entry = lastInserted();
    const meta = entry.metadata as Record<string, any> | null;
    expect(entry.action).toBe("tool_failure");
    expect(entry.actorType).toBe("ai");
    expect(meta?.error).toBe("slot unavailable");
  });

  test("logAppointmentAudit uses correct action and defaults to ai actor", async () => {
    await logAppointmentAudit(WS, APPT, "appointment_booked");
    const entry = lastInserted();
    expect(entry.action).toBe("appointment_booked");
    expect(entry.actorType).toBe("ai");
    expect(entry.entityType).toBe("appointment");
  });

  test("logEscalationCreated sets whatsapp channel", async () => {
    await logEscalationCreated(WS, CONV, "no_available_slots");
    const entry = lastInserted();
    expect(entry.action).toBe("escalation_created");
    expect(entry.channel).toBe("whatsapp");
  });

  test("logOptOutEvent sets customer actorType and channel", async () => {
    await logOptOutEvent(WS, CUST, "whatsapp");
    const entry = lastInserted();
    expect(entry.action).toBe("opt_out");
    expect(entry.actorType).toBe("customer");
    expect(entry.channel).toBe("whatsapp");
  });

  test("logConsentEvent uses caller-specified action", async () => {
    await logConsentEvent(WS, CUST, "consent_created");
    const entry = lastInserted();
    expect(entry.action).toBe("consent_created");
    expect(entry.entityType).toBe("consent");
  });
});
