import { db } from '@zenda/db/client'
import { customers, appointments } from '@zenda/db/schema'
import { eq, and, count, desc } from 'drizzle-orm'

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
