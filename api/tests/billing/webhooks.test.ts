import { beforeEach, describe, expect, mock, test } from "bun:test";

// We test the internal pure logic by re-importing the module and
// testing handleWebhook with mocked Stripe and DB.
// detectTierFromPrice and isDowngrade are private, so we test
// them indirectly through handleWebhook behavior, plus we test
// the tier logic directly via the module's exported behavior.

// Mock the Stripe module and DB before importing the webhooks module
const mockConstructEvent = mock(
  (_body: string, _sig: string, _secret: string) =>
    ({}) as Record<string, unknown>
);
const mockRetrieveSubscription = mock((_id: string) => Promise.resolve({}));
const mockStripeInstance = {
  webhooks: {
    constructEvent: mockConstructEvent,
  },
  subscriptions: {
    retrieve: mockRetrieveSubscription,
  },
};

const mockDbUpdate = mock(() => ({
  set: mock(() => ({
    where: mock(() => Promise.resolve()),
  })),
}));
const mockDbSelect = mock(() => ({
  from: mock(() => ({
    where: mock(() => ({
      limit: mock(() => Promise.resolve([{ planTier: "pro" }])),
    })),
  })),
}));

// Mock modules
mock.module("../../src/modules/billing/stripe.js", () => ({
  stripe: mockStripeInstance,
  STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
}));

mock.module("@zenda/db/client", () => ({
  db: {
    update: mockDbUpdate,
    select: mockDbSelect,
    insert: mock(() => ({
      values: mock(() => ({
        onConflictDoNothing: mock(() => Promise.resolve()),
      })),
    })),
  },
}));

mock.module("@zenda/db/schema", () => ({
  subscriptions: {
    workspaceId: "workspaceId",
    stripeCustomerId: "stripeCustomerId",
    stripeSubscriptionId: "stripeSubscriptionId",
    planTier: "planTier",
    billingPeriod: "billingPeriod",
    status: "status",
    id: "id",
  },
}));

mock.module("drizzle-orm", () => ({
  eq: (_col: string, _val: string) => "eq_mock",
}));

mock.module("../../src/modules/usage/enforcement.js", () => ({
  resetUsageOnPlanChange: mock(() => Promise.resolve()),
}));

import { handleWebhook } from "../../src/modules/billing/webhooks";

// ===========================================================================
// handleWebhook — Signature verification
// ===========================================================================

describe("handleWebhook - signature verification", () => {
  beforeEach(() => {
    mockConstructEvent.mockClear();
  });

  // biome-ignore lint/suspicious/useAwait: async needed for expect().rejects
  test("throws on invalid signature", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    expect(handleWebhook("body", "bad_sig")).rejects.toThrow(
      "Invalid signature"
    );
  });
});

// ===========================================================================
// handleWebhook — checkout.session.completed
// ===========================================================================

describe("handleWebhook - checkout.session.completed", () => {
  beforeEach(() => {
    mockConstructEvent.mockClear();
    mockRetrieveSubscription.mockClear();
    mockDbUpdate.mockClear();
  });

  test("activates subscription on checkout completion", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { workspaceId: "ws-1", tier: "pro", billingPeriod: "monthly" },
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    });

    mockRetrieveSubscription.mockResolvedValue({
      current_period_start: 1_700_000_000,
      current_period_end: 1_702_000_000,
    });

    await handleWebhook("body", "sig");

    expect(mockDbUpdate).toHaveBeenCalled();
  });

  test("skips if no workspaceId in metadata", async () => {
    mockConstructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: {},
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    });

    await handleWebhook("body", "sig");
    // Should not throw, just skip
  });
});

// ===========================================================================
// handleWebhook — customer.subscription.deleted
// ===========================================================================

describe("handleWebhook - customer.subscription.deleted", () => {
  beforeEach(() => {
    mockConstructEvent.mockClear();
    mockDbUpdate.mockClear();
  });

  test("marks subscription as canceled", async () => {
    mockConstructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: {
          metadata: { workspaceId: "ws-1" },
          id: "sub_123",
        },
      },
    });

    await handleWebhook("body", "sig");
    expect(mockDbUpdate).toHaveBeenCalled();
  });
});

// ===========================================================================
// handleWebhook — invoice.payment_failed
// ===========================================================================

describe("handleWebhook - invoice.payment_failed", () => {
  beforeEach(() => {
    mockConstructEvent.mockClear();
    mockDbUpdate.mockClear();
    mockDbSelect.mockClear();
  });

  test("sets subscription to past_due on payment failure", async () => {
    mockConstructEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: {
        object: {
          customer: "cus_123",
        },
      },
    });

    // Mock select to find a subscription
    mockDbSelect.mockReturnValue({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() =>
            Promise.resolve([
              {
                id: "sub-1",
                workspaceId: "ws-1",
                stripeCustomerId: "cus_123",
              },
            ])
          ),
        })),
      })),
    });

    await handleWebhook("body", "sig");
    expect(mockDbUpdate).toHaveBeenCalled();
  });
});

// ===========================================================================
// handleWebhook — unhandled event type
// ===========================================================================

describe("handleWebhook - unhandled event types", () => {
  test("does not throw for unrecognized event types", async () => {
    mockConstructEvent.mockReturnValue({
      type: "payment_intent.created",
      data: { object: {} },
    });

    await expect(handleWebhook("body", "sig")).resolves.toBeUndefined();
  });
});
