import { db, Prisma } from "@zenda/db/client";
import {
  createAppointmentSchema,
  TERMINAL_STATUSES,
  updateAppointmentStatusSchema,
} from "@zenda/shared";
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
  const existing = await db.customer.findFirst({
    where: {
      workspaceId,
      phoneNumber: normalized,
    },
    select: { id: true, name: true },
  });

  if (existing) {
    // Update name if provided and currently null
    if (name && !existing.name) {
      await db.customer.update({
        where: { id: existing.id },
        data: { name, updatedAt: new Date() },
      });
    }
    return existing.id;
  }

  const created = await db.customer.create({
    data: {
      workspaceId,
      phoneNumber: normalized,
      name: name || null,
    },
  });
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

      // Build where conditions
      // biome-ignore lint/style/noNonNullAssertion: validated by middleware
      const where: Record<string, unknown> = { workspaceId: workspaceId! };
      if (status) {
        const statuses = status
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (statuses.length === 1) {
          where.status = statuses[0];
        } else if (statuses.length > 1) {
          where.status = { in: statuses };
        }
      }
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.getTime())) {
          where.startAt = {
            ...((where.startAt as Record<string, unknown>) || {}),
            gte: fromDate,
          };
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.getTime())) {
          where.startAt = {
            ...((where.startAt as Record<string, unknown>) || {}),
            lte: toDate,
          };
        }
      }

      const rows = await db.appointment.findMany({
        where,
        orderBy: { startAt: "desc" },
        take: parsedLimit,
        skip: parsedOffset,
        include: {
          customer: { select: { name: true, phoneNumber: true } },
          service: { select: { name: true } },
        },
      });

      return rows.map((row) => ({
        ...row,
        customerName: row.customer?.name ?? null,
        customerPhone: row.customer?.phoneNumber ?? null,
        serviceName: row.service?.name ?? null,
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
      const row = await db.appointment.findFirst({
        where: {
          id: params.id,
          // biome-ignore lint/style/noNonNullAssertion: validated by middleware
          workspaceId: workspaceId!,
        },
        include: {
          customer: { select: { name: true } },
          service: { select: { name: true } },
        },
      });

      if (!row) {
        return notFound(set, "Appointment not found");
      }
      return {
        ...row,
        customerName: row.customer?.name ?? null,
        serviceName: row.service?.name ?? null,
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
          const ws = await db.workspace.findFirst({
            // biome-ignore lint/style/noNonNullAssertion: validated by middleware
            where: { id: workspaceId! },
            select: { timezone: true },
          });
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
        const apt = await db.$transaction(async (tx) => {
          // Overlap: same workspace, same staff, overlapping time range, non-terminal status.
          // Must use raw SQL because Prisma does not support pessimistic locking.
          // biome-ignore lint/style/noNonNullAssertion: validated by middleware
          const wsId = workspaceId!;

          // Use parameterized query to prevent SQL injection
          const overlapping: Array<{ id: string }> = await tx.$queryRaw`
              SELECT id FROM appointments
              WHERE workspace_id = ${wsId}
                AND start_at < ${endAtDate}
                AND end_at > ${startAtDate}
                AND status NOT IN (${Prisma.join(TERMINAL_STATUSES)})
                AND staff_member_id ${staffMemberId ? Prisma.sql`= ${staffMemberId}` : Prisma.sql`IS NULL`}
              LIMIT 1
              FOR UPDATE
            `;

          if (overlapping.length > 0) {
            return null;
          }

          const inserted = await tx.appointment.create({
            data: {
              workspaceId: wsId,
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
            },
          });

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
        const names = await db.appointment.findFirst({
          where: { id: apt.id },
          include: {
            customer: { select: { name: true } },
            service: { select: { name: true } },
          },
        });

        return {
          ...apt,
          customerName: names?.customer?.name ?? null,
          serviceName: names?.service?.name ?? null,
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

        const apt = await db.appointment.findFirst({
          where: {
            id: params.id,
            // biome-ignore lint/style/noNonNullAssertion: validated by middleware
            workspaceId: workspaceId!,
          },
        });

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

        const updated = await db.appointment.update({
          where: { id: apt.id },
          data: updates,
        });

        // Fetch customer and service names for the response
        const names = await db.appointment.findFirst({
          where: { id: apt.id },
          include: {
            customer: { select: { name: true } },
            service: { select: { name: true } },
          },
        });

        logger.info("Appointment status updated", {
          workspaceId,
          appointmentId: apt.id,
          from: apt.status,
          to: status,
        });
        return {
          ...updated,
          customerName: names?.customer?.name ?? null,
          serviceName: names?.service?.name ?? null,
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
