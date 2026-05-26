import { describe, expect, test } from "bun:test";
import { Elysia, t } from "elysia";

describe("Settings route validation", () => {
  // Test the body schemas used by settings routes
  const receptionistBodySchema = t.Object({
    personalityPreset: t.Optional(t.String()),
    formalityLevel: t.Optional(t.Number()),
    concisenessLevel: t.Optional(t.Number()),
    warmthLevel: t.Optional(t.Number()),
    useEmoji: t.Optional(t.Boolean()),
    speaksAsBusiness: t.Optional(t.Boolean()),
    proactivelySuggestTimes: t.Optional(t.Boolean()),
    confirmsBeforeBooking: t.Optional(t.Boolean()),
    greetingStyle: t.Optional(t.String()),
  });

  const appointmentBodySchema = t.Object({
    cancellationWindowHours: t.Optional(t.Number()),
    reschedulingWindowHours: t.Optional(t.Number()),
    cancellationPolicyStrictness: t.Optional(t.String()),
    depositRequired: t.Optional(t.Boolean()),
    depositAmountCents: t.Optional(t.Number()),
    approvedCancellationText: t.Optional(t.String()),
    approvedRefundText: t.Optional(t.String()),
  });

  const messagingBodySchema = t.Object({
    maxOutboundWithoutReply: t.Optional(t.Number()),
    maxRemindersPerAppointment: t.Optional(t.Number()),
  });

  test("receptionist PATCH accepts all personality fields", async () => {
    const app = new Elysia().patch("/", async ({ body }) => body, {
      body: receptionistBodySchema,
    });

    const res = await app.handle(
      new Request("http://localhost/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalityPreset: "warm",
          formalityLevel: 4,
          concisenessLevel: 3,
          warmthLevel: 5,
          useEmoji: true,
          speaksAsBusiness: false,
          proactivelySuggestTimes: true,
          confirmsBeforeBooking: true,
          greetingStyle: "casual",
        }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.personalityPreset).toBe("warm");
    expect(data.warmthLevel).toBe(5);
    expect(data.useEmoji).toBe(true);
  });

  test("appointment PATCH accepts all appointment fields", async () => {
    const app = new Elysia().patch("/", async ({ body }) => body, {
      body: appointmentBodySchema,
    });

    const res = await app.handle(
      new Request("http://localhost/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancellationWindowHours: 48,
          depositRequired: true,
          depositAmountCents: 2000,
        }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.cancellationWindowHours).toBe(48);
    expect(data.depositRequired).toBe(true);
  });

  test("messaging PATCH accepts messaging fields", async () => {
    const app = new Elysia().patch("/", async ({ body }) => body, {
      body: messagingBodySchema,
    });

    const res = await app.handle(
      new Request("http://localhost/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxOutboundWithoutReply: 3,
          maxRemindersPerAppointment: 1,
        }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.maxOutboundWithoutReply).toBe(3);
  });

  test("PATCH with empty body passes validation (all fields optional)", async () => {
    const app = new Elysia().patch("/", async ({ body }) => body, {
      body: messagingBodySchema,
    });

    const res = await app.handle(
      new Request("http://localhost/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(200);
  });
});
