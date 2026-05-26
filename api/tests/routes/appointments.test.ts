import { describe, expect, test } from "bun:test";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "@zenda/shared";

describe("Appointment validation", () => {
  test("createAppointmentSchema accepts valid input", () => {
    const result = createAppointmentSchema.safeParse({
      customerId: "550e8400-e29b-41d4-a716-446655440000",
      serviceId: "550e8400-e29b-41d4-a716-446655440001",
      startAt: "2026-06-01T10:00:00Z",
      timezone: "America/New_York",
    });
    expect(result.success).toBe(true);
  });

  test("createAppointmentSchema rejects missing customerId", () => {
    const result = createAppointmentSchema.safeParse({
      serviceId: "550e8400-e29b-41d4-a716-446655440001",
      startAt: "2026-06-01T10:00:00Z",
      timezone: "America/New_York",
    });
    expect(result.success).toBe(false);
  });

  test("createAppointmentSchema rejects invalid UUID", () => {
    const result = createAppointmentSchema.safeParse({
      customerId: "not-a-uuid",
      serviceId: "550e8400-e29b-41d4-a716-446655440001",
      startAt: "2026-06-01T10:00:00Z",
      timezone: "America/New_York",
    });
    expect(result.success).toBe(false);
  });

  test("updateAppointmentStatusSchema accepts valid status", () => {
    const result = updateAppointmentStatusSchema.safeParse({
      status: "confirmed",
    });
    expect(result.success).toBe(true);
  });

  test("updateAppointmentStatusSchema rejects invalid status", () => {
    const result = updateAppointmentStatusSchema.safeParse({
      status: "not_a_status",
    });
    expect(result.success).toBe(false);
  });

  test("updateAppointmentStatusSchema accepts all valid statuses", () => {
    const statuses = [
      "requested",
      "pending_confirmation",
      "confirmed",
      "reminder_sent",
      "client_confirmed",
      "reschedule_requested",
      "rescheduled",
      "cancel_requested",
      "cancelled",
      "completed",
      "no_show",
      "needs_attention",
    ];
    for (const status of statuses) {
      const result = updateAppointmentStatusSchema.safeParse({ status });
      expect(result.success, `status "${status}" should be valid`).toBe(true);
    }
  });
});
