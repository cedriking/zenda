import type { calendar_v3 } from "googleapis";
import { google } from "googleapis";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "../../../config/env.js";
import { logger } from "../../../infra/logger.js";

export interface CalendarEvent {
  attendeeEmail?: string;
  attendeeName?: string;
  description?: string;
  end: { dateTime: string; timeZone: string };
  start: { dateTime: string; timeZone: string };
  summary: string;
}

export interface CalendarInfo {
  id: string;
  primary: boolean;
  summary: string;
}

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

function createOAuthClient() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
}

/**
 * Generate the Google OAuth consent screen URL.
 * @param state - Opaque state parameter (signed workspaceId) to prevent CSRF.
 */
export function getAuthUrl(state: string): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state,
    prompt: "consent", // Force refresh token on every connect
  });
}

/**
 * Exchange an authorization code for access + refresh tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  email?: string;
}> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);

  if (!(tokens.access_token && tokens.refresh_token)) {
    throw new Error("Google OAuth did not return required tokens");
  }

  // Get the user's email from the token info
  let email: string | undefined;
  try {
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const userinfo = await oauth2.userinfo.get();
    email = userinfo.data.email ?? undefined;
  } catch {
    logger.warn("Could not fetch Google user email during token exchange");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date ?? Date.now() + 3_600_000,
    email,
  };
}

/**
 * Get a fresh access token using a stored refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<string> {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  return credentials.access_token ?? "";
}

/**
 * Create a calendar event and return the Google event ID.
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<string> {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: client });

  const attendees: calendar_v3.Schema$EventAttendee[] = [];
  if (event.attendeeEmail) {
    attendees.push({
      email: event.attendeeEmail,
      displayName: event.attendeeName,
    });
  }

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      attendees: attendees.length > 0 ? attendees : undefined,
    },
  });

  const eventId = response.data.id;
  if (!eventId) {
    throw new Error("Google Calendar did not return an event ID");
  }
  return eventId;
}

/**
 * Update an existing calendar event.
 */
export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  event: CalendarEvent
): Promise<void> {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: client });

  const attendees: calendar_v3.Schema$EventAttendee[] = [];
  if (event.attendeeEmail) {
    attendees.push({
      email: event.attendeeEmail,
      displayName: event.attendeeName,
    });
  }

  await calendar.events.update({
    calendarId,
    eventId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      attendees: attendees.length > 0 ? attendees : undefined,
    },
  });
}

/**
 * Delete a calendar event.
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: client });
  await calendar.events.delete({ calendarId, eventId });
}

/**
 * List the user's Google Calendars.
 */
export async function listCalendars(
  accessToken: string
): Promise<CalendarInfo[]> {
  const client = createOAuthClient();
  client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: client });
  const response = await calendar.calendarList.list();

  return (
    response.data.items?.map((cal) => ({
      id: cal.id ?? "",
      summary: cal.summary ?? "Unnamed Calendar",
      primary: cal.primary ?? false,
    })) ?? []
  );
}
