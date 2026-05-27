import { db } from "@zenda/db/client";
import {
  appointments,
  customers,
  services,
  workspaces,
} from "@zenda/db/schema";
import {
  createAppointmentSchema,
  TERMINAL_STATUSES,
  updateAppointmentStatusSchema,
} from "@zenda/shared";
import { and, desc, eq, gt, gte, inArray, lt, lte, ne, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { typedContext } from "../../middleware/typed-context.js";
import {
  badRequest,
  conflict,
  notFound,
  serverError,
} from "../../utils/errors.js";
import { getAvailableSlots } from "./availability-engine.js";
import { validateTransition } from "./state-machine.js";

/**
 * Resolve a customer by phone number within a workspace.
 * Creates the customer if not found.
 */
async function resolveCustomer(
  workspaceId: string,
  name: string,
  phone: string
): Promise<string> {
  const normalized = phone.replace(/[\s()-]/g, "");
  const [existing] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(
      and(
        eq(customers.workspaceId, workspaceId),
        eq(customers.phoneNumber, normalized)
      )
    )
    .limit(1);

  if (existing) {
    // Update name if provided and currently null
    if (name) {
      await db
        .update(customers)
        .set({ name, updatedAt: new Date() })
        .where(
          and(eq(customers.id, existing.id), sql`${customers.name} IS NULL`)
        );
    }
    return existing.id;
  }

  const [created] = await db
    .insert(customers)
    .values({
      workspaceId,
      phoneNumber: normalized,
      name: name || null,
    })
    .returning();
  return created.id;
}

export const appointmentModule = new Elysia({ prefix: "/appointments" })
  .use(typedContext)

  // List appointments (with customer and service names)
  .get("/", async ({ workspaceId, query, set }) => {
    try {
      const {
        status,
        limit = "50",
        offset = "0",
        from,
        to,
      } = query as Record<string, string>;
      const parsedLimit = Math.max(1, Math.min(200, Number(limit) || 50));
      const parsedOffset = Math.max(0, Number(offset) || 0);

      const conditions = [eq(appointments.workspaceId, workspaceId!)];
      if (status) {
        const statuses = status
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (statuses.length === 1) {
          conditions.push(eq(appointments.status, statuses[0] as any));
        } else if (statuses.length > 1) {
          conditions.push(inArray(appointments.status, statuses as any));
        }
      }
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          conditions.push(gte(appointments.startAt, fromDate));
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          conditions.push(lte(appointments.startAt, toDate));
        }
      }

      const rows = await db
        .select({
          appointment: appointments,
          customerName: customers.name,
          customerPhone: customers.phoneNumber,
          serviceName: services.name,
        })
        .from(appointments)
        .leftJoin(customers, eq(appointments.customerId, customers.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .where(and(...conditions))
        .orderBy(desc(appointments.startAt))
        .limit(parsedLimit)
        .offset(parsedOffset);

      return rows.map((row) => ({
        ...row.appointment,
        customerName: row.customerName,
        customerPhone: row.customerPhone,
        serviceName: row.serviceName,
      }));
    } catch (err) {
      logger.error("Failed to list appointments", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to list appointments");
    }
  })

  // Get appointment by ID (with customer and service names)
  .get("/:id", async ({ workspaceId, params, set }) => {
    try {
      const [row] = await db
        .select({
          appointment: appointments,
          customerName: customers.name,
          serviceName: services.name,
        })
        .from(appointments)
        .leftJoin(customers, eq(appointments.customerId, customers.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .where(
          and(
            eq(appointments.id, params.id),
            eq(appointments.workspaceId, workspaceId!)
          )
        )
        .limit(1);

      if (!row) {
        return notFound(set, "Appointment not found");
      }
      return {
        ...row.appointment,
        customerName: row.customerName,
        serviceName: row.serviceName,
      };
    } catch (err) {
      logger.error("Failed to get appointment", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get appointment");
    }
  })

  // Create appointment
  .post(
    "/",
    async ({ workspaceId, body, set }) => {
      try {
        const raw = body as Record<string, unknown>;

        // Resolve customerId: either provided directly, or via customerName+customerPhone
        let customerId = raw.customerId as string | undefined;
        let timezone = raw.timezone as string | undefined;

        if (!customerId) {
          const customerName = raw.customerName as string | undefined;
          const customerPhone = raw.customerPhone as string | undefined;
          if (!customerPhone) {
            return badRequest(
              set,
              "Either customerId or customerPhone is required"
            );
          }
          customerId = await resolveCustomer(
            // biome-ignore lint/style/noNonNullAssertion: validated by middleware
            workspaceId!,
            customerName ?? "",
            customerPhone
          );
        }

        // Derive timezone from workspace settings if not provided
        if (!timezone) {
          const [ws] = await db
            .select({ timezone: workspaces.timezone })
            .from(workspaces)
            // biome-ignore lint/style/noNonNullAssertion: validated by middleware
            .where(eq(workspaces.id, workspaceId!))
            .limit(1);
          timezone = ws?.timezone || "UTC";
        }

        const payload = {
          ...raw,
          customerId,
          timezone,
        };

        const parsed = createAppointmentSchema.safeParse(payload);
        if (!parsed.success) {
          return badRequest(
            set,
            "Validation failed: " +
              parsed.error.issues.map((i) => i.message).join(", ")
          );
        }

        const {
          serviceId,
          staffMemberId,
          startAt,
          sourceConversationId,
          createdBy,
        } = parsed.data;

        const durationMinutes = (raw.durationMinutes as number) ?? 60;
        const startAtDate = new Date(startAt);
        const endAtDate = new Date(
          startAtDate.getTime() + durationMinutes * 60_000
        );

        // Use a transaction with pessimistic lock to prevent double-booking.
        // SELECT FOR UPDATE acquires a lock on overlapping rows so concurrent
        // writers cannot both see "no overlap" and proceed.
        const apt = await db.transaction(async (tx) => {
          // Overlap: same workspace, same staff, overlapping time range, non-terminal status.
          // Two ranges [A_start, A_end) and [B_start, B_end) overlap when:
          //   A_start < B_end AND B_start < A_end
          const overlapConditions = [
            // biome-ignore lint/style/noNonNullAssertion: validated by middleware
            eq(appointments.workspaceId, workspaceId!),
            lt(appointments.startAt, endAtDate),
            gt(appointments.endAt, startAtDate),
            ...TERMINAL_STATUSES.map((s) => ne(appointments.status, s)),
          ];

          if (staffMemberId) {
            overlapConditions.push(
              eq(appointments.staffMemberId, staffMemberId)
            );
          } else {
            overlapConditions.push(sql`${appointments.staffMemberId} IS NULL`);
          }

          const overlapping = await tx
            .select({ id: appointments.id })
            .from(appointments)
            .where(and(...overlapConditions))
            .limit(1)
            .for("update");

          if (overlapping.length > 0) {
            return null;
          }

          const [inserted] = await tx
            .insert(appointments)
            .values({
              // biome-ignore lint/style/noNonNullAssertion: validated by middleware
              workspaceId: workspaceId!,
              customerId,
              serviceId,
              staffMemberId: staffMemberId ?? null,
              status: "pending_confirmation",
              startAt: startAtDate,
              endAt: endAtDate,
              timezone,
              sourceConversationId: sourceConversationId ?? null,
              createdBy: createdBy ?? "owner",
              notes:
                ((body as Record<string, unknown>).notes as string) ?? null,
            })
            .returning();

          return inserted;
        });

        if (!apt) {
          return conflict(set, "Time slot is no longer available");
        }

        logger.info("Appointment created", {
          workspaceId,
          appointmentId: apt.id,
        });

        // Fetch customer and service names for the response
        const [names] = await db
          .select({
            customerName: customers.name,
            serviceName: services.name,
          })
          .from(appointments)
          .leftJoin(customers, eq(appointments.customerId, customers.id))
          .leftJoin(services, eq(appointments.serviceId, services.id))
          .where(eq(appointments.id, apt.id))
          .limit(1);

        return {
          ...apt,
          customerName: names?.customerName ?? null,
          serviceName: names?.serviceName ?? null,
        };
      } catch (err) {
        logger.error("Failed to create appointment", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to create appointment");
      }
    },
    {
      body: t.Object({
        customerId: t.Optional(t.String()),
        customerName: t.Optional(t.String()),
        customerPhone: t.Optional(t.String()),
        serviceId: t.String(),
        startAt: t.String(),
        timezone: t.Optional(t.String()),
        staffMemberId: t.Optional(t.String()),
        sourceConversationId: t.Optional(t.String()),
        createdBy: t.Optional(t.String()),
        durationMinutes: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    }
  )

  // Update appointment status
  .patch(
    "/:id/status",
    async ({ workspaceId, params, body, set }) => {
      try {
        const parsed = updateAppointmentStatusSchema.safeParse(body);
        if (!parsed.success) {
          return badRequest(
            set,
            "Validation failed: " +
              parsed.error.issues.map((i) => i.message).join(", ")
          );
        }

        const { status } = parsed.data;

        const [apt] = await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.id, params.id),
              eq(appointments.workspaceId, workspaceId!)
            )
          )
          .limit(1);

        if (!apt) {
          return notFound(set, "Appointment not found");
        }

        try {
          validateTransition(apt.status, status);
        } catch (err) {
          return conflict(set, (err as Error).message);
        }

        const updates: Record<string, unknown> = {
          status,
          updatedAt: new Date(),
        };
        if (status === "cancelled") {
          updates.cancelledAt = new Date();
        }
        if (status === "completed") {
          updates.completedAt = new Date();
        }

        const [updated] = await db
          .update(appointments)
          .set(updates)
          .where(eq(appointments.id, apt.id))
          .returning();

        // Fetch customer and service names for the response
        const [names] = await db
          .select({
            customerName: customers.name,
            serviceName: services.name,
          })
          .from(appointments)
          .leftJoin(customers, eq(appointments.customerId, customers.id))
          .leftJoin(services, eq(appointments.serviceId, services.id))
          .where(eq(appointments.id, apt.id))
          .limit(1);

        logger.info("Appointment status updated", {
          workspaceId,
          appointmentId: apt.id,
          from: apt.status,
          to: status,
        });
        return {
          ...updated,
          customerName: names?.customerName ?? null,
          serviceName: names?.serviceName ?? null,
        };
      } catch (err) {
        logger.error("Failed to update appointment status", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to update appointment status");
      }
    },
    {
      body: t.Object({
        status: t.String(),
        notes: t.Optional(t.String()),
      }),
    }
  )

  // Get available slots
  .get("/availability", async ({ workspaceId, query, set }) => {
    try {
      const { serviceId, date, staffMemberId } = query as Record<
        string,
        string
      >;
      if (!(serviceId && date)) {
        return badRequest(set, "serviceId and date are required");
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return badRequest(set, "date must be in YYYY-MM-DD format");
      }

      return getAvailableSlots({
        workspaceId: workspaceId!,
        serviceId,
        date,
        staffMemberId,
      });
    } catch (err) {
      logger.error("Failed to get availability", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get availability");
    }
  });
