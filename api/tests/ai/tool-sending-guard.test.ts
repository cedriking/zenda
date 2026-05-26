import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---------------------------------------------------------------------------
// Mock the policy-gate module before importing the system under test
// ---------------------------------------------------------------------------

const mockCheckSendingPolicy = mock(
  async (): Promise<{
    allowed: boolean;
    reason?: string;
    details: Record<string, unknown>;
  }> => ({
    allowed: true,
    reason: undefined,
    details: {},
  })
);

mock.module("../../src/modules/ai/policy-gate.js", () => ({
  checkSendingPolicy: mockCheckSendingPolicy,
}));

mock.module("../../src/infra/logger.js", () => ({
  logger: {
    info: mock(() => {}),
    warn: mock(() => {}),
    error: mock(() => {}),
  },
}));

const { checkToolSendingPolicy } = await import(
  "../../src/modules/ai/tool-sending-guard.js"
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Tool Sending Guard", () => {
  beforeEach(() => {
    mockCheckSendingPolicy.mockClear();
  });

  test("returns null for read-only tools (no policy check)", async () => {
    const result = await checkToolSendingPolicy(
      "check_availability",
      "ws-1",
      "cust-1"
    );
    expect(result).toBeNull();
    expect(mockCheckSendingPolicy).not.toHaveBeenCalled();
  });

  test("returns null for get_services (no policy check)", async () => {
    const result = await checkToolSendingPolicy(
      "get_services",
      "ws-1",
      "cust-1"
    );
    expect(result).toBeNull();
  });

  test("returns null for get_business_info (no policy check)", async () => {
    const result = await checkToolSendingPolicy(
      "get_business_info",
      "ws-1",
      "cust-1"
    );
    expect(result).toBeNull();
  });

  test("returns null for escalate_to_human (no policy check)", async () => {
    const result = await checkToolSendingPolicy(
      "escalate_to_human",
      "ws-1",
      "cust-1"
    );
    expect(result).toBeNull();
  });

  test("passes book_appointment through when policy allows", async () => {
    mockCheckSendingPolicy.mockResolvedValueOnce({
      allowed: true,
      reason: undefined,
      details: {},
    });

    const result = await checkToolSendingPolicy(
      "book_appointment",
      "ws-1",
      "cust-1"
    );
    expect(result).toBeNull();
    expect(mockCheckSendingPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        customerId: "cust-1",
        purpose: "booking_confirmation",
        channel: "whatsapp_ba_bridge",
      })
    );
  });

  test("returns PolicyDenial when policy denies book_appointment", async () => {
    mockCheckSendingPolicy.mockResolvedValueOnce({
      allowed: false,
      reason: "Customer has opted out",
      details: { purpose: "booking_confirmation" },
    });

    const result = await checkToolSendingPolicy(
      "book_appointment",
      "ws-1",
      "cust-1"
    );
    expect(result).not.toBeNull();
    expect(result?.policyDenied).toBe(true);
    expect(result?.reason).toBe("Customer has opted out");
    expect(result?.toolName).toBe("book_appointment");
    expect(result?.purpose).toBe("booking_confirmation");
  });

  test("checks confirm_appointment with appointment_confirmation purpose", async () => {
    mockCheckSendingPolicy.mockResolvedValueOnce({
      allowed: true,
      reason: undefined,
      details: {},
    });

    await checkToolSendingPolicy("confirm_appointment", "ws-1", "cust-1");
    expect(mockCheckSendingPolicy).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: "appointment_confirmation" })
    );
  });

  test("checks reschedule_appointment with appointment_reschedule purpose", async () => {
    mockCheckSendingPolicy.mockResolvedValueOnce({
      allowed: true,
      reason: undefined,
      details: {},
    });

    await checkToolSendingPolicy("reschedule_appointment", "ws-1", "cust-1");
    expect(mockCheckSendingPolicy).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: "appointment_reschedule" })
    );
  });

  test("checks cancel_appointment with appointment_cancellation purpose", async () => {
    mockCheckSendingPolicy.mockResolvedValueOnce({
      allowed: true,
      reason: undefined,
      details: {},
    });

    await checkToolSendingPolicy("cancel_appointment", "ws-1", "cust-1");
    expect(mockCheckSendingPolicy).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: "appointment_cancellation" })
    );
  });

  test("returns null (allows tool) when policy check throws", async () => {
    mockCheckSendingPolicy.mockRejectedValueOnce(
      new Error("DB connection lost")
    );

    const result = await checkToolSendingPolicy(
      "book_appointment",
      "ws-1",
      "cust-1"
    );
    // Fail-open on infrastructure error
    expect(result).toBeNull();
  });

  test("returns denial with correct reason for rate limit exceeded", async () => {
    mockCheckSendingPolicy.mockResolvedValueOnce({
      allowed: false,
      reason: "Outbound rate limit exceeded (3/3)",
      details: { outboundSinceLastInbound: 3 },
    });

    const result = await checkToolSendingPolicy(
      "book_appointment",
      "ws-1",
      "cust-1"
    );
    expect(result?.policyDenied).toBe(true);
    expect(result?.reason).toContain("rate limit");
  });
});
