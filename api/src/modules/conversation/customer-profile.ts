import { db } from '@zenda/db/client'
import { customers } from '@zenda/db/schema'
import { eq, and } from 'drizzle-orm'

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

  // Get memory for this customer
  const { getMemoryForCustomer } = await import('../ai/memory.js')
  const memory = await getMemoryForCustomer(workspaceId, customerId)

  return {
    id: customer.id,
    phoneNumber: customer.phoneNumber,
    name: customer.name,
    language: customer.language,
    totalAppointments: 0, // Would need a count query
    lastVisit: null, // Would need latest appointment query
    memory,
  }
}
