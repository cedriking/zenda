import { db } from "@zenda/db/client";

interface CustomerProfile {
  id: string;
  language: string;
  lastVisit: string | null;
  memory: Array<{ key: string; value: string }>;
  name: string | null;
  phoneNumber: string;
  totalAppointments: number;
}

export async function getCustomerProfile(
  workspaceId: string,
  customerId: string
): Promise<CustomerProfile | null> {
  const customer = await db.customer.findFirst({
    where: { id: customerId, workspaceId },
  });

  if (!customer) {
    return null;
  }

  // Get appointment stats and memory in parallel
  const [appointmentCountResult, lastAppointmentResult, memory] =
    await Promise.all([
      db.appointment.count({
        where: {
          customerId,
          workspaceId,
        },
      }),
      db.appointment.findFirst({
        where: {
          customerId,
          workspaceId,
        },
        select: { startAt: true },
        orderBy: { startAt: "desc" },
      }),
      (async () => {
        const { getMemoryForCustomer } = await import("../ai/memory.js");
        return getMemoryForCustomer(workspaceId, customerId);
      })(),
    ]);

  return {
    id: customer.id,
    phoneNumber: customer.phoneNumber,
    name: customer.name,
    language: customer.language,
    totalAppointments: appointmentCountResult ?? 0,
    lastVisit: lastAppointmentResult?.startAt?.toISOString() ?? null,
    memory,
  };
}

export interface AppointmentWithService {
  confirmationStatus: string;
  endAt: Date;
  id: string;
  serviceName: string;
  startAt: Date;
  status: string;
}

export async function getRecentAppointments(
  workspaceId: string,
  customerId: string,
  limit = 5
): Promise<AppointmentWithService[]> {
  const rows = await db.appointment.findMany({
    where: {
      workspaceId,
      customerId,
    },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      status: true,
      confirmationStatus: true,
      service: {
        select: { name: true },
      },
    },
    orderBy: { startAt: "desc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    serviceName: row.service.name,
    startAt: row.startAt,
    endAt: row.endAt,
    status: row.status,
    confirmationStatus: row.confirmationStatus,
  }));
}
