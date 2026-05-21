import { db } from '@zenda/db/client'
import { customers, appointments, services as servicesTable } from '@zenda/db/schema'
import { eq, and, count, desc, asc, sql } from 'drizzle-orm'

interface CustomerProfile {
  id: string
  phoneNumber: string
  name: string | null
  language: string
  totalAppointments: number
  lastVisit: string | null
  memory: Array<{ key: string; value: string }>
}

export async function getCustomerProfile(
  workspaceId: string,
  customerId: string,
): Promise<CustomerProfile | null> {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.workspaceId, workspaceId)))
    .limit(1)

  if (!customer) return null

  // Get appointment stats and memory in parallel
  const [appointmentCountResult, lastAppointmentResult, memory] = await Promise.all([
    db
      .select({ count: count() })
      .from(appointments)
      .where(and(eq(appointments.customerId, customerId), eq(appointments.workspaceId, workspaceId))),
    db
      .select({ startAt: appointments.startAt })
      .from(appointments)
      .where(and(eq(appointments.customerId, customerId), eq(appointments.workspaceId, workspaceId)))
      .orderBy(desc(appointments.startAt))
      .limit(1),
    (async () => {
      const { getMemoryForCustomer } = await import('../ai/memory.js')
      return getMemoryForCustomer(workspaceId, customerId)
    })(),
  ])

  return {
    id: customer.id,
    phoneNumber: customer.phoneNumber,
    name: customer.name,
    language: customer.language,
    totalAppointments: appointmentCountResult[0]?.count ?? 0,
    lastVisit: lastAppointmentResult[0]?.startAt?.toISOString() ?? null,
    memory,
  }
}

export interface AppointmentWithService {
  id: string
  serviceName: string
  startAt: Date
  endAt: Date
  status: string
  confirmationStatus: string
}

export async function getRecentAppointments(
  workspaceId: string,
  customerId: string,
  limit = 5,
): Promise<AppointmentWithService[]> {
  const rows = await db
    .select({
      id: appointments.id,
      serviceName: servicesTable.name,
      startAt: appointments.startAt,
      endAt: appointments.endAt,
      status: appointments.status,
      confirmationStatus: appointments.confirmationStatus,
    })
    .from(appointments)
    .innerJoin(servicesTable, eq(appointments.serviceId, servicesTable.id))
    .where(and(
      eq(appointments.workspaceId, workspaceId),
      eq(appointments.customerId, customerId),
    ))
    .orderBy(desc(appointments.startAt))
    .limit(limit)

  return rows
}
