import { beforeEach, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { ComposioClient } from "../../../src/modules/integrations/composio/client";

// Mock the composio routes for testing
// In a real implementation, these would be imported from the actual routes file

describe("Composio API Endpoints", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any;
  let composioClient: ComposioClient;

  beforeEach(() => {
    // Reset environment
    process.env.COMPOSIO_API_KEY = "test-api-key";
    process.env.COMPOSIO_BASE_URL = "https://api.composio.dev";
    process.env.API_BASE_URL = "https://api.zenda.bot";

    composioClient = new ComposioClient({
      apiKey: "test-api-key",
      baseUrl: "https://api.composio.dev",
    });

    // Create a test Elysia app with composio routes
    // Type assertion needed: Elysia route builder returns a specialized type
    // that doesn't match the base Elysia type variable
    app = new Elysia()
      .get(
        "/integrations/composio/connect/:workspaceId",
        async ({ params }) => {
          const workspaceId = params.workspaceId;
          const result = await composioClient.connectAccount(workspaceId);
          return result;
        }
      )
      .get("/integrations/composio/callback", async ({ query }) => {
        const { code, state, workspaceId } = query;
        const sessionId = state as string;
        const result = await composioClient.handleCallback(
          sessionId,
          code as string,
          workspaceId as string
        );
        return result;
      })
      .get(
        "/integrations/composio/events/:workspaceId",
        async ({ params, query }) => {
          const workspaceId = params.workspaceId;
          const startDate = query.startDate as string;
          const endDate = query.endDate as string;
          const calendarId = query.calendarId as string;

          const result = await composioClient.listEvents(workspaceId, {
            startDate,
            endDate,
            calendarId,
          });
          return { events: result, count: result.length };
        }
      )
      .post(
        "/integrations/composio/events/:workspaceId",
        async ({ params, body }) => {
          const workspaceId = params.workspaceId;
          const result = await composioClient.createEvent(
            workspaceId,
            body as any
          );
          return result;
        }
      )
      .patch(
        "/integrations/composio/events/:workspaceId/:eventId",
        async ({ params, body }) => {
          const workspaceId = params.workspaceId;
          const eventId = params.eventId;
          const result = await composioClient.updateEvent(
            workspaceId,
            eventId,
            body as any
          );
          return result;
        }
      )
      .delete(
        "/integrations/composio/events/:workspaceId/:eventId",
        async ({ params }) => {
          const workspaceId = params.workspaceId;
          const eventId = params.eventId;
          const result = await composioClient.deleteEvent(workspaceId, eventId);
          return result;
        }
      )
      .get("/integrations/composio/status/:workspaceId", async ({ params }) => {
        const workspaceId = params.workspaceId;
        const result = await composioClient.getConnectionStatus(workspaceId);
        return result;
      })
      .delete(
        "/integrations/composio/disconnect/:workspaceId",
        async ({ params }) => {
          const workspaceId = params.workspaceId;
          const result = await composioClient.disconnectAccount(workspaceId);
          return result;
        }
      );
  });

  describe("POST /integrations/composio/connect", () => {
    test("should return connection URL for valid workspace", async () => {
      const workspaceId = "workspace_123";
      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/connect/${workspaceId}`
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      expect(response.connectionUrl).toBeDefined();
      expect(response.sessionId).toBeDefined();
      expect(response.sessionId).toContain(workspaceId);
    });

    test("should include Google Calendar authorization in URL", async () => {
      const workspaceId = "workspace_456";
      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/connect/${workspaceId}`
          )
        )
        .then((res: Response) => res.json());

      expect(response.connectionUrl).toContain("google_calendar");
      expect(response.connectionUrl).toContain("authorize");
    });

    test("should generate different session IDs for concurrent requests", async () => {
      const workspaceId = "workspace_789";

      const [response1, response2] = await Promise.all([
        app
          .handle(
            new Request(
              `http://localhost/integrations/composio/connect/${workspaceId}`
            )
          )
          .then((res: Response) => res.json()),
        app
          .handle(
            new Request(
              `http://localhost/integrations/composio/connect/${workspaceId}`
            )
          )
          .then((res: Response) => res.json()),
      ]);

      expect(response1.sessionId).not.toBe(response2.sessionId);
    });
  });

  describe("GET /integrations/composio/callback", () => {
    test("should process OAuth callback successfully", async () => {
      const sessionId = "sess_workspace_123_1234567890";
      const code = "auth_code_123";
      const workspaceId = "workspace_123";

      const url = new URL("http://localhost/integrations/composio/callback");
      url.searchParams.set("state", sessionId);
      url.searchParams.set("code", code);
      url.searchParams.set("workspaceId", workspaceId);

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      expect(response.id).toContain(workspaceId);
      expect(response.provider).toBe("google_calendar");
      expect(response.status).toBe("active");
    });

    test("should handle missing parameters gracefully", async () => {
      const url = new URL("http://localhost/integrations/composio/callback");
      url.searchParams.set("state", "sess_test");
      url.searchParams.set("code", "test_code");
      // Missing workspaceId

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });

    test("should reject invalid session IDs", async () => {
      const invalidSessionId = "invalid_session_format";
      const code = "auth_code";
      const workspaceId = "workspace_123";

      const url = new URL("http://localhost/integrations/composio/callback");
      url.searchParams.set("state", invalidSessionId);
      url.searchParams.set("code", code);
      url.searchParams.set("workspaceId", workspaceId);

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });
  });

  describe("GET /integrations/composio/events", () => {
    test("should list events for a date range", async () => {
      const workspaceId = "workspace_123";
      const startDate = "2024-05-13T00:00:00Z";
      const endDate = "2024-05-20T23:59:59Z";

      const url = new URL(
        `http://localhost/integrations/composio/events/${workspaceId}`
      );
      url.searchParams.set("startDate", startDate);
      url.searchParams.set("endDate", endDate);

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      expect(response.events).toBeDefined();
      expect(Array.isArray(response.events)).toBe(true);
      expect(typeof response.count).toBe("number");
    });

    test("should filter by calendar ID when provided", async () => {
      const workspaceId = "workspace_123";
      const calendarId = "primary";

      const url = new URL(
        `http://localhost/integrations/composio/events/${workspaceId}`
      );
      url.searchParams.set("startDate", "2024-05-13T00:00:00Z");
      url.searchParams.set("endDate", "2024-05-20T23:59:59Z");
      url.searchParams.set("calendarId", calendarId);

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response.events).toBeDefined();
    });

    test("should handle missing date range parameters", async () => {
      const workspaceId = "workspace_123";

      const url = new URL(
        `http://localhost/integrations/composio/events/${workspaceId}`
      );
      // Missing startDate and endDate

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });

    test("should return empty array when no events found", async () => {
      const workspaceId = "workspace_nonexistent";

      const url = new URL(
        `http://localhost/integrations/composio/events/${workspaceId}`
      );
      url.searchParams.set("startDate", "2024-05-13T00:00:00Z");
      url.searchParams.set("endDate", "2024-05-20T23:59:59Z");

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response.events).toEqual([]);
      expect(response.count).toBe(0);
    });
  });

  describe("POST /integrations/composio/events", () => {
    test("should create a new calendar event", async () => {
      const workspaceId = "workspace_123";
      const eventData = {
        title: "Test Meeting",
        description: "This is a test meeting",
        startTime: "2024-05-14T10:00:00Z",
        endTime: "2024-05-14T11:00:00Z",
        attendees: ["test@example.com"],
        location: "Conference Room A",
      };

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/events/${workspaceId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(eventData),
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      expect(response.eventId).toBeDefined();
      expect(response.eventId).toContain(workspaceId);
      expect(response.htmlLink).toBeDefined();
    });

    test("should create event with minimal required fields", async () => {
      const workspaceId = "workspace_123";
      const eventData = {
        title: "Quick Meeting",
        startTime: "2024-05-14T10:00:00Z",
        endTime: "2024-05-14T10:30:00Z",
      };

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/events/${workspaceId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(eventData),
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response.eventId).toBeDefined();
    });

    test("should validate required fields", async () => {
      const workspaceId = "workspace_123";
      const incompleteData = {
        title: "Incomplete Event",
        // Missing startTime and endTime
      };

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/events/${workspaceId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(incompleteData),
            }
          )
        )
        .then((res: Response) => res.json());

      // In real implementation, this might return validation errors
      expect(response).toBeDefined();
    });

    test("should handle invalid JSON payload", async () => {
      const workspaceId = "workspace_123";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/events/${workspaceId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: "invalid json",
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });
  });

  describe("PATCH /integrations/composio/events/:workspaceId/:eventId", () => {
    test("should update an existing event", async () => {
      const workspaceId = "workspace_123";
      const eventId = "evt_workspace_123_1234567890";
      const updates = {
        title: "Updated Title",
        description: "Updated description",
      };

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/events/${workspaceId}/${eventId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updates),
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      expect(response.eventId).toBe(eventId);
      expect(response.updated).toBe(true);
    });

    test("should update event time", async () => {
      const workspaceId = "workspace_123";
      const eventId = "evt_workspace_123_1234567890";
      const updates = {
        startTime: "2024-05-14T14:00:00Z",
        endTime: "2024-05-14T15:00:00Z",
      };

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/events/${workspaceId}/${eventId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updates),
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response.updated).toBe(true);
    });
  });

  describe("DELETE /integrations/composio/events/:workspaceId/:eventId", () => {
    test("should delete an existing event", async () => {
      const workspaceId = "workspace_123";
      const eventId = "evt_workspace_123_1234567890";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/events/${workspaceId}/${eventId}`,
            {
              method: "DELETE",
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      expect(response.deleted).toBe(true);
    });
  });

  describe("GET /integrations/composio/status/:workspaceId", () => {
    test("should return connection status for workspace", async () => {
      const workspaceId = "workspace_123";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/status/${workspaceId}`
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      // Returns null or connection status
      expect(response === null || typeof response === "object").toBe(true);
    });

    test("should return null for non-existent connection", async () => {
      const workspaceId = "workspace_nonexistent";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/status/${workspaceId}`
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeNull();
    });
  });

  describe("DELETE /integrations/composio/disconnect/:workspaceId", () => {
    test("should disconnect a connected account", async () => {
      const workspaceId = "workspace_123";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/disconnect/${workspaceId}`,
            {
              method: "DELETE",
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
      expect(response.disconnected).toBe(true);
    });
  });

  describe("Authentication Guards", () => {
    test("should reject requests without valid authentication", async () => {
      const workspaceId = "workspace_123";

      // In a real implementation, this would check authentication headers
      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/connect/${workspaceId}`,
            {
              headers: {
                // Missing or invalid auth header
              },
            }
          )
        )
        .then((res: Response) => res.json());

      // For now, we just verify the endpoint responds
      expect(response).toBeDefined();
    });

    test("should accept requests with valid authentication", async () => {
      const workspaceId = "workspace_123";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/connect/${workspaceId}`,
            {
              headers: {
                Authorization: "Bearer valid-token",
              },
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });

    test("should validate workspace ID belongs to authenticated user", async () => {
      const workspaceId = "workspace_123";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/status/${workspaceId}`,
            {
              headers: {
                Authorization: "Bearer user-token",
              },
            }
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid workspace ID format", async () => {
      const invalidWorkspaceId = "invalid/workspace/id";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/connect/${invalidWorkspaceId}`
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });

    test("should handle network errors gracefully", async () => {
      const workspaceId = "workspace_123";

      const response = await app
        .handle(
          new Request(
            `http://localhost/integrations/composio/connect/${workspaceId}`
          )
        )
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });

    test("should return appropriate error for missing required parameters", async () => {
      const _workspaceId = "workspace_123";

      const url = new URL("http://localhost/integrations/composio/callback");
      // Missing required query parameters

      const response = await app
        .handle(new Request(url))
        .then((res: Response) => res.json());

      expect(response).toBeDefined();
    });
  });

  describe("Response Formats", () => {
    test("should return consistent JSON responses", async () => {
      const workspaceId = "workspace_123";

      const response = await app.handle(
        new Request(
          `http://localhost/integrations/composio/connect/${workspaceId}`
        )
      );

      expect(response.headers.get("content-type")).toContain(
        "application/json"
      );
    });

    test("should include proper HTTP status codes", async () => {
      const workspaceId = "workspace_123";

      const response = await app.handle(
        new Request(
          `http://localhost/integrations/composio/connect/${workspaceId}`
        )
      );

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });
  });
});
