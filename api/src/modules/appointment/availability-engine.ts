import { db } from "@zenda/db/client";

interface SlotQuery {
  date: string; // YYYY-MM-DD
  serviceId: string;
  staffMemberId?: string;
  workspaceId: string;
}

interface AvailableSlot {
  endTime: string; // HH:mm
  staffMemberId?: string;
  staffMemberName?: string;
  startTime: string; // HH:mm
}

export async function getAvailableSlots(
  query: SlotQuery
): Promise<AvailableSlot[]> {
  const service = await db.service.findFirst({
    where: {
      id: query.serviceId,
      workspaceId: query.workspaceId,
    },
  });

  if (!service) {
    return [];
  }

  const dateObj = new Date(`${query.date}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  const duration = service.durationMinutes;
  const buffer = 5; // 5 min buffer between appointments

  // Get availability rules for this day
  const rules = await db.availabilityRule.findMany({
    where: {
      workspaceId: query.workspaceId,
      dayOfWeek,
      available: true,
    },
  });

  if (!rules.length) {
    return [];
  }

  // Get staff members for this service
  const staff = query.staffMemberId
    ? await db.staffMember.findMany({
        where: {
          id: query.staffMemberId,
          workspaceId: query.workspaceId,
          active: true,
        },
      })
    : await db.staffMember.findMany({
        where: {
          workspaceId: query.workspaceId,
          active: true,
        },
      });

  // Get existing appointments for this day
  const dayStart = new Date(`${query.date}T00:00:00Z`);
  const dayEnd = new Date(`${query.date}T23:59:59Z`);
  const existingAppts = await db.appointment.findMany({
    where: {
      workspaceId: query.workspaceId,
      startAt: { gte: dayStart, lte: dayEnd },
    },
  });

  const slots: AvailableSlot[] = [];

  for (const rule of rules) {
    const [startH, startM] = rule.startTime.split(":").map(Number);
    const [endH, endM] = rule.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (
      let mins = startMinutes;
      mins + duration <= endMinutes;
      mins += duration + buffer
    ) {
      const slotStart = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
      const slotEnd = `${String(Math.floor((mins + duration) / 60)).padStart(2, "0")}:${String((mins + duration) % 60).padStart(2, "0")}`;

      const slotStartMs = new Date(`${query.date}T${slotStart}:00`).getTime();
      const slotEndMs = new Date(`${query.date}T${slotEnd}:00`).getTime();

      // Check for conflicts
      const hasConflict = existingAppts.some((appt) => {
        const apptStart = new Date(appt.startAt).getTime();
        const apptEnd = new Date(appt.endAt).getTime();
        return slotStartMs < apptEnd && slotEndMs > apptStart;
      });

      if (!hasConflict) {
        // Pick a staff member (first available)
        const assignedStaff = staff.find(
          (s) => !rule.staffMemberId || s.id === rule.staffMemberId
        );
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          staffMemberId: assignedStaff?.id,
          staffMemberName: assignedStaff?.name,
        });
      }
    }
  }

  return slots;
}
