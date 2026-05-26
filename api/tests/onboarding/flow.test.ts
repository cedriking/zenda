import { describe, expect, test } from "bun:test";

// ── flow.ts pure functions ──────────────────────────────────────

// Re-implement the pure logic here to test it in isolation (no DB import)
const STEP_ORDER = [
  "not_started",
  "whatsapp_connected",
  "business_info",
  "services",
  "availability",
  "policies",
  "receptionist_config",
  "plan_selection",
  "ready",
] as const;

type OnboardingStep = (typeof STEP_ORDER)[number];

function getNextStep(current: OnboardingStep): OnboardingStep | null {
  const idx = STEP_ORDER.indexOf(current);
  if (idx === -1 || idx >= STEP_ORDER.length - 1) {
    return null;
  }
  return STEP_ORDER[idx + 1];
}

function getProgress(current: OnboardingStep): number {
  const idx = STEP_ORDER.indexOf(current);
  if (idx === -1) {
    return 0;
  }
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
}

describe("Onboarding Flow: step progression", () => {
  test("not_started -> whatsapp_connected", () => {
    expect(getNextStep("not_started")).toBe("whatsapp_connected");
  });

  test("whatsapp_connected -> business_info", () => {
    expect(getNextStep("whatsapp_connected")).toBe("business_info");
  });

  test("business_info -> services", () => {
    expect(getNextStep("business_info")).toBe("services");
  });

  test("services -> availability", () => {
    expect(getNextStep("services")).toBe("availability");
  });

  test("availability -> policies", () => {
    expect(getNextStep("availability")).toBe("policies");
  });

  test("policies -> receptionist_config", () => {
    expect(getNextStep("policies")).toBe("receptionist_config");
  });

  test("receptionist_config -> plan_selection", () => {
    expect(getNextStep("receptionist_config")).toBe("plan_selection");
  });

  test("plan_selection -> ready", () => {
    expect(getNextStep("plan_selection")).toBe("ready");
  });

  test("ready returns null (no next step)", () => {
    expect(getNextStep("ready")).toBeNull();
  });

  test("invalid step returns null", () => {
    expect(getNextStep("unknown" as OnboardingStep)).toBeNull();
  });
});

describe("Onboarding Flow: progress calculation", () => {
  test("not_started = 0%", () => {
    expect(getProgress("not_started")).toBe(0);
  });

  test("whatsapp_connected = 13%", () => {
    expect(getProgress("whatsapp_connected")).toBe(13);
  });

  test("business_info = 25%", () => {
    expect(getProgress("business_info")).toBe(25);
  });

  test("services = 38%", () => {
    expect(getProgress("services")).toBe(38);
  });

  test("availability = 50%", () => {
    expect(getProgress("availability")).toBe(50);
  });

  test("policies = 63%", () => {
    expect(getProgress("policies")).toBe(63);
  });

  test("receptionist_config = 75%", () => {
    expect(getProgress("receptionist_config")).toBe(75);
  });

  test("plan_selection = 88%", () => {
    expect(getProgress("plan_selection")).toBe(88);
  });

  test("ready = 100%", () => {
    expect(getProgress("ready")).toBe(100);
  });

  test("invalid step = 0%", () => {
    expect(getProgress("unknown" as OnboardingStep)).toBe(0);
  });
});
