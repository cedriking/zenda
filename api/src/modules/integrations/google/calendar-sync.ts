import { db } from "@zenda/db/client";
import { decrypt, encrypt } from "../../../infra/encryption.js";
import { logger } from "../../../infra/logger.js";
import type { CalendarEvent } from "./client.js";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  listCalendars,
  refreshAccessToken,
  updateCalendarEvent,
} from "./client.js";

interface AppointmentRow {
  customer?: { name: string | null; phone: string } | null;
  endAt: Date;
  externalCalendarEventId: string | null;
  id: string;
  service?: { name: string } | null;
  startAt: Date;
  status: string;
  timezone: string;
}

/**
 * Get a valid access token for a workspace's Google Calendar integration.
 * Returns null if not connected or on any error.
 */
async function getAccessTokenForWorkspace(
  workspaceId: string
): Promise<{ accessToken: string; calendarId: string } | null> {
  try {
    const integration = await db.integration.findFirst({
      where: {
        workspaceId,
        type: "google_calendar",
        provider: "google",
        status: "active",
      },
    });

    if (!integration?.credentials) {
      return null;
    }

    const creds = JSON.parse(await decrypt(integration.credentials)) as {
      refreshToken: string;
      accessToken: string;
      expiryDate: number;
    };

    const config = integration.config
      ? (JSON.parse(integration.config) as { calendarId?: string })
      : {};
    const calendarId = config.calendarId ?? "primary";

    // Refresh if expired or about to expire (5 min buffer)
    let accessToken = creds.accessToken;
    if (Date.now() >= creds.expiryDate - 300_000) {
      accessToken = await refreshAccessToken(creds.refreshToken);
      // Update stored credentials with new access token
      const updatedCreds = {
        ...creds,
        accessToken,
        expiryDate: Date.now() + 3_600_000,
      };
      await db.integration.update({
        where: { id: integration.id },
        data: { credentials: await encrypt(JSON.stringify(updatedCreds)) },
      });
    }

    return { accessToken, calendarId };
  } catch (err) {
    logger.error("Failed to get Google Calendar access token", {
      workspaceId,
      error: (err as Error).message,
    });
    return null;
  }
}

function buildCalendarEvent(apt: AppointmentRow): CalendarEvent {
  return {
    summary: apt.service?.name
      ? `Appointment: ${apt.service.name}`
      : "Appointment",
    description: `Managed by Zenda. Appointment ID: ${apt.id}`,
    start: {
      dateTime: apt.startAt.toISOString(),
      timeZone: apt.timezone,
    },
    end: {
      dateTime: apt.endAt.toISOString(),
      timeZone: apt.timezone,
    },
    attendeeName: apt.customer?.name ?? undefined,
  };
}

/**
 * Push an appointment to Google Calendar. Best-effort — never throws.
 * Returns the Google event ID on success, or null.
 */
export async function pushToCalendar(
  workspaceId: string,
  apt: AppointmentRow
): Promise<string | null> {
  try {
    const auth = await getAccessTokenForWorkspace(workspaceId);
    if (!auth) {
      return null;
    }

    const event = buildCalendarEvent(apt);
    const eventId = await createCalendarEvent(
      auth.accessToken,
      auth.calendarId,
      event
    );

    logger.info("Pushed appointment to Google Calendar", {
      appointmentId: apt.id,
      calendarEventId: eventId,
    });
    return eventId;
  } catch (err) {
    logger.error("Failed to push appointment to Google Calendar", {
      appointmentId: apt.id,
      error: (err as Error).message,
    });
    return null;
  }
}

/**
 * Update a Google Calendar event. Best-effort — never throws.
 */
export async function updateInCalendar(
  workspaceId: string,
  externalEventId: string,
  apt: AppointmentRow
): Promise<void> {
  try {
    const auth = await getAccessTokenForWorkspace(workspaceId);
    if (!auth) {
      return;
    }

    const event = buildCalendarEvent(apt);
    await updateCalendarEvent(
      auth.accessToken,
      auth.calendarId,
      externalEventId,
      event
    );

    logger.info("Updated Google Calendar event", {
      appointmentId: apt.id,
      calendarEventId: externalEventId,
    });
  } catch (err) {
    logger.error("Failed to update Google Calendar event", {
      appointmentId: apt.id,
      error: (err as Error).message,
    });
  }
}

/**
 * Delete a Google Calendar event. Best-effort — never throws.
 */
export async function deleteFromCalendar(
  workspaceId: string,
  externalEventId: string
): Promise<void> {
  try {
    const auth = await getAccessTokenForWorkspace(workspaceId);
    if (!auth) {
      return;
    }

    await deleteCalendarEvent(
      auth.accessToken,
      auth.calendarId,
      externalEventId
    );

    logger.info("Deleted Google Calendar event", {
      calendarEventId: externalEventId,
    });
  } catch (err) {
    logger.error("Failed to delete Google Calendar event", {
      calendarEventId: externalEventId,
      error: (err as Error).message,
    });
  }
}

/**
 * Get list of Google Calendars for a workspace. Returns empty array on error.
 */
export async function getCalendarList(
  workspaceId: string
): Promise<{ id: string; summary: string; primary: boolean }[]> {
  try {
    const auth = await getAccessTokenForWorkspace(workspaceId);
    if (!auth) {
      return [];
    }
    return await listCalendars(auth.accessToken);
  } catch (err) {
    logger.error("Failed to list Google Calendars", {
      workspaceId,
      error: (err as Error).message,
    });
    return [];
  }
}
