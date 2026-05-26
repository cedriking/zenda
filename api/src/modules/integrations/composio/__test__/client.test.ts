/**
 * Composio Client Tests
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { type CalendarEvent, ComposioClient } from "../client";

describe("ComposioClient", () => {
  let client: ComposioClient;

  beforeEach(() => {
    client = new ComposioClient({
      apiKey: "test-api-key",
      baseUrl: "https://test.api.composio.dev",
    });
  });

  describe("connectAccount", () => {
    it("should return connection URL and session ID", async () => {
      const result = await client.connectAccount("workspace-123");

      expect(result).toHaveProperty("connectionUrl");
      expect(result).toHaveProperty("sessionId");
      expect(result.connectionUrl).toContain("google_calendar");
      expect(result.sessionId).toContain("workspace-123");
    });
  });

  describe("handleCallback", () => {
    it("should complete connection with valid code", async () => {
      const result = await client.handleCallback(
        "sess-123",
        "auth-code-123",
        "workspace-123"
      );

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("provider");
      expect(result).toHaveProperty("status");
      expect(result.provider).toBe("google_calendar");
      expect(result.status).toBe("active");
    });
  });

  describe("listEvents", () => {
    it("should list events for date range", async () => {
      const events = await client.listEvents("workspace-123", {
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-07T23:59:59Z",
      });

      expect(Array.isArray(events)).toBe(true);
    });
  });

  describe("createEvent", () => {
    it("should create a new calendar event", async () => {
      const event: CalendarEvent = {
        title: "Test Event",
        description: "Test Description",
        startTime: "2025-01-15T10:00:00Z",
        endTime: "2025-01-15T11:00:00Z",
        attendees: ["test@example.com"],
        location: "Test Location",
      };

      const result = await client.createEvent("workspace-123", event);

      expect(result).toHaveProperty("eventId");
      expect(result).toHaveProperty("htmlLink");
      expect(result.eventId).toContain("workspace-123");
    });
  });

  describe("updateEvent", () => {
    it("should update an existing event", async () => {
      const updates: Partial<CalendarEvent> = {
        title: "Updated Event Title",
      };

      const result = await client.updateEvent(
        "workspace-123",
        "evt-123",
        updates
      );

      expect(result).toHaveProperty("eventId");
      expect(result).toHaveProperty("updated");
      expect(result.updated).toBe(true);
    });
  });

  describe("deleteEvent", () => {
    it("should delete an event", async () => {
      const result = await client.deleteEvent("workspace-123", "evt-123");

      expect(result).toHaveProperty("deleted");
      expect(result.deleted).toBe(true);
    });
  });

  describe("getConnectionStatus", () => {
    it("should return null for non-existent connection", async () => {
      const result = await client.getConnectionStatus("workspace-123");

      expect(result).toBeNull();
    });
  });

  describe("disconnectAccount", () => {
    it("should disconnect account", async () => {
      const result = await client.disconnectAccount("workspace-123");

      expect(result).toHaveProperty("disconnected");
      expect(result.disconnected).toBe(true);
    });
  });
});
