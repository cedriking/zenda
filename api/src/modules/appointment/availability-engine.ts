import { db } from '@zenda/db/client'
import { appointments, services, availabilityRules, staffMembers } from '@zenda/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'

interface SlotQuery {
  workspaceId: string
  serviceId: string
  date: string // YYYY-MM-DD
  staffMemberId?: string
}

interface AvailableSlot {
  startTime: string // HH:mm
  endTime: string // HH:mm
  staffMemberId?: string
  staffMemberName?: string
}

export async function getAvailableSlots(query: SlotQuery): Promise<AvailableSlot[]> {
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, query.serviceId), eq(services.workspaceId, query.workspaceId)))
    .limit(1)

  if (!service) return []

  const dateObj = new Date(query.date + 'T00:00:00')
  const dayOfWeek = dateObj.getDay()
  const duration = service.durationMinutes
  const buffer = 5 // 5 min buffer between appointments

  // Get availability rules for this day
  const rules = await db
    .select()
    .from(availabilityRules)
    .where(and(
      eq(availabilityRules.workspaceId, query.workspaceId),
      eq(availabilityRules.dayOfWeek, dayOfWeek),
      eq(availabilityRules.available, true),
    ))

  if (!rules.length) return []

  // Get staff members for this service
  const staff = query.staffMemberId
    ? await db.select().from(staffMembers).where(and(
        eq(staffMembers.id, query.staffMemberId),
        eq(staffMembers.workspaceId, query.workspaceId),
        eq(staffMembers.active, true),
      ))
    : await db.select().from(staffMembers).where(and(
        eq(staffMembers.workspaceId, query.workspaceId),
        eq(staffMembers.active, true),
      ))

  // Get existing appointments for this day
  const dayStart = new Date(query.date + 'T00:00:00Z')
  const dayEnd = new Date(query.date + 'T23:59:59Z')
  const existingAppts = await db
    .select()
    .from(appointments)
    .where(and(
      eq(appointments.workspaceId, query.workspaceId),
      gte(appointments.startAt, dayStart),
      lte(appointments.startAt, dayEnd),
    ))

  const slots: AvailableSlot[] = []

  for (const rule of rules) {
    const [startH, startM] = rule.startTime.split(':').map(Number)
    const [endH, endM] = rule.endTime.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    for (let mins = startMinutes; mins + duration <= endMinutes; mins += duration + buffer) {
      const slotStart = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
      const slotEnd = `${String(Math.floor((mins + duration) / 60)).padStart(2, '0')}:${String((mins + duration) % 60).padStart(2, '0')}`

      const slotStartMs = new Date(`${query.date}T${slotStart}:00`).getTime()
      const slotEndMs = new Date(`${query.date}T${slotEnd}:00`).getTime()

      // Check for conflicts
      const hasConflict = existingAppts.some(appt => {
        const apptStart = new Date(appt.startAt).getTime()
        const apptEnd = new Date(appt.endAt).getTime()
        return slotStartMs < apptEnd && slotEndMs > apptStart
      })

      if (!hasConflict) {
        // Pick a staff member (first available)
        const assignedStaff = staff.find(s =>
          !rule.staffMemberId || s.id === rule.staffMemberId,
        )
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          staffMemberId: assignedStaff?.id,
          staffMemberName: assignedStaff?.name,
        })
      }
    }
  }

  return slots
}
