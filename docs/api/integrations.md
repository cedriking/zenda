# Integrations API Documentation

## Overview

The Integrations API provides endpoints for managing third-party service connections including WhatsApp (via Zernio) and Google Calendar (via Composio).

**Base URL:** `https://api.zenda.bot`

**Authentication:** Bearer token (JWT) required for all endpoints except webhooks

---

## Table of Contents

1. [Zernio Endpoints](#zernio-endpoints)
2. [Composio Endpoints](#composio-endpoints)
3. [Authentication Patterns](#authentication-patterns)
4. [Webhook Signature Verification](#webhook-signature-verification)
5. [Thread ID Format](#thread-id-format)
6. [Error Codes](#error-codes)

---

## Zernio Endpoints

### Connect WhatsApp Integration

Creates a new Zernio integration for a workspace.

**Endpoint:** `POST /integrations/zernio/connect`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "workspaceId": "uuid-v4",
  "zernioAccountId": "acct_1234567890",
  "phoneNumber": "+1234567890"
}
```

**Response (200 OK):**
```json
{
  "integrationId": "uuid-v4",
  "workspaceId": "uuid-v4",
  "type": "whatsapp",
  "provider": "zernio",
  "status": "active",
  "config": {
    "accountId": "acct_1234567890",
    "phoneNumber": "+1234567890"
  },
  "threadId": "zernio:acct_1234567890:",
  "createdAt": "2025-05-13T10:00:00Z",
  "updatedAt": "2025-05-13T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Integration already exists
- `422 Unprocessable Entity` - Validation failed

**Example:**
```bash
curl -X POST https://api.zenda.bot/integrations/zernio/connect \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
    "zernioAccountId": "acct_1234567890",
    "phoneNumber": "+1234567890"
  }'
```

---

### Disconnect Zernio Integration

Removes a Zernio integration from a workspace.

**Endpoint:** `DELETE /integrations/zernio/:integrationId`

**Authentication:** Required (JWT)

**URL Parameters:**
- `integrationId` (string, required) - Integration UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Integration disconnected successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Integration belongs to different workspace
- `404 Not Found` - Integration not found

**Example:**
```bash
curl -X DELETE https://api.zenda.bot/integrations/zernio/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### Get Zernio Integration Status

Retrieves the current status of a Zernio integration.

**Endpoint:** `GET /integrations/zernio/status`

**Authentication:** Required (JWT)

**Query Parameters:**
- `workspaceId` (string, required) - Workspace UUID

**Response (200 OK):**
```json
{
  "integrationId": "uuid-v4",
  "workspaceId": "uuid-v4",
  "type": "whatsapp",
  "provider": "zernio",
  "status": "active",
  "config": {
    "accountId": "acct_1234567890",
    "phoneNumber": "+1234567890",
    "connectedAt": "2025-05-13T10:00:00Z"
  },
  "health": {
    "webhook": "configured",
    "lastMessageAt": "2025-05-13T15:30:00Z",
    "messageCount": 42
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - No integration found for workspace

**Example:**
```bash
curl "https://api.zenda.bot/integrations/zernio/status?workspaceId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### Send Message via Zernio

Sends a message through Zernio to a WhatsApp conversation.

**Endpoint:** `POST /integrations/zernio/send`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "threadId": "zernio:acct_1234567890:+1234567890",
  "content": "Hello from Zernio!",
  "messageType": "text"
}
```

**Alternative (with media):**
```json
{
  "threadId": "zernio:acct_1234567890:+1234567890",
  "content": {
    "text": "Check out this image!",
    "mediaUrl": "https://example.com/image.jpg"
  },
  "messageType": "media"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "msg_1234567890",
  "threadId": "zernio:acct_1234567890:+1234567890",
  "status": "sent",
  "sentAt": "2025-05-13T15:45:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid thread ID or message content
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Thread not accessible by workspace
- `429 Too Many Requests` - Rate limit exceeded
- `502 Bad Gateway` - Zernio API error

**Example:**
```bash
curl -X POST https://api.zenda.bot/integrations/zernio/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "zernio:acct_1234567890:+1234567890",
    "content": "Hello from Zernio!",
    "messageType": "text"
  }'
```

---

### Zernio Webhook (Public)

Receives incoming message webhooks from Zernio.

**Endpoint:** `POST /webhooks/zernio`

**Authentication:** Webhook signature verification

**Headers:**
- `X-Zernio-Signature` (string, required) - HMAC SHA256 signature

**Request Body:**
```json
{
  "event": "message.received",
  "timestamp": "2025-05-13T15:30:00Z",
  "account": {
    "id": "acct_1234567890",
    "platform": "whatsapp"
  },
  "conversation": {
    "id": "+1234567890",
    "threadId": "zernio:acct_1234567890:+1234567890"
  },
  "message": {
    "id": "msg_1234567890",
    "type": "text",
    "text": "Hello, I need to book an appointment",
    "timestamp": "2025-05-13T15:30:00Z"
  },
  "sender": {
    "id": "+1234567890",
    "phoneNumber": "+1234567890",
    "name": "John Doe"
  }
}
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid payload
- `401 Unauthorized` - Invalid signature
- `500 Internal Server Error` - Processing error

**Example:**
```bash
# This is called by Zernio, not by clients
curl -X POST https://api.zenda.bot/webhooks/zernio \
  -H "Content-Type: application/json" \
  -H "X-Zernio-Signature: sha256=..." \
  -d '{"event":"message.received",...}'
```

---

### Webhook Health Check

Verifies webhook endpoint is accessible.

**Endpoint:** `GET /webhooks/zernio/health`

**Authentication:** None (public)

**Response (200 OK):**
```json
{
  "status": "ok",
  "webhook": "configured",
  "timestamp": "2025-05-13T15:45:00Z"
}
```

**Example:**
```bash
curl https://api.zenda.bot/webhooks/zernio/health
```

---

## Composio Endpoints

### Connect Google Calendar

Initiates the OAuth flow to connect Google Calendar.

**Endpoint:** `POST /integrations/composio/connect`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "workspaceId": "uuid-v4",
  "redirectUri": "https://app.zenda.bot/settings/integrations"
}
```

**Response (200 OK):**
```json
{
  "connectionUrl": "https://app.composio.dev/authorize?client_id=...&redirect_uri=...",
  "state": "random_state_string",
  "expiresAt": "2025-05-13T16:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid token
- `502 Bad Gateway` - Composio API error

**Example:**
```bash
curl -X POST https://api.zenda.bot/integrations/composio/connect \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
    "redirectUri": "https://app.zenda.bot/settings/integrations"
  }'
```

---

### OAuth Callback Handler

Handles the OAuth callback from Composio after user authorization.

**Endpoint:** `GET /integrations/composio/callback`

**Authentication:** None (public)

**Query Parameters:**
- `code` (string, required) - OAuth authorization code
- `state` (string, required) - OAuth state parameter
- `workspaceId` (string, required) - Workspace UUID

**Response (302 Found):**
Redirects to the configured redirect URI with success/error status.

**Example:**
```bash
# This is called by Composio after user authorization
curl "https://api.zenda.bot/integrations/composio/callback?code=...&state=...&workspaceId=..."
```

---

### List Calendars

Retrieves all Google Calendars accessible to the connected account.

**Endpoint:** `GET /integrations/composio/calendars`

**Authentication:** Required (JWT)

**Query Parameters:**
- `workspaceId` (string, required) - Workspace UUID

**Response (200 OK):**
```json
{
  "calendars": [
    {
      "id": "primary",
      "name": "user@example.com",
      "description": "Primary calendar",
      "timezone": "America/New_York",
      "accessRole": "owner",
      "primary": true
    },
    {
      "id": "abc123@example.com",
      "name": "Work Calendar",
      "description": "Work events",
      "timezone": "America/New_York",
      "accessRole": "writer",
      "primary": false
    }
  ],
  "total": 2
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - No Composio integration found
- `502 Bad Gateway` - Composio API error

**Example:**
```bash
curl "https://api.zenda.bot/integrations/composio/calendars?workspaceId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### List Calendar Events

Retrieves events from a Google Calendar within a time range.

**Endpoint:** `GET /integrations/composio/events`

**Authentication:** Required (JWT)

**Query Parameters:**
- `workspaceId` (string, required) - Workspace UUID
- `calendarId` (string, optional) - Calendar ID (default: "primary")
- `timeMin` (string, required) - ISO 8601 start time
- `timeMax` (string, required) - ISO 8601 end time
- `maxResults` (number, optional) - Maximum events to return (default: 100)

**Response (200 OK):**
```json
{
  "events": [
    {
      "id": "abc123xyz",
      "summary": "Team Meeting",
      "description": "Weekly sync",
      "start": "2025-05-13T10:00:00-07:00",
      "end": "2025-05-13T11:00:00-07:00",
      "location": "Conference Room A",
      "attendees": [
        {"email": "user1@example.com", "responseStatus": "accepted"},
        {"email": "user2@example.com", "responseStatus": "tentative"}
      ],
      "status": "confirmed",
      "htmlLink": "https://www.google.com/calendar/event?eid=abc123xyz"
    }
  ],
  "total": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid time range
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - No Composio integration found
- `502 Bad Gateway` - Composio API error

**Example:**
```bash
curl "https://api.zenda.bot/integrations/composio/events?workspaceId=550e8400-e29b-41d4-a716-446655440000&timeMin=2025-05-13T00:00:00Z&timeMax=2025-05-13T23:59:59Z" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

### Create Calendar Event

Creates a new event in Google Calendar.

**Endpoint:** `POST /integrations/composio/events`

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "workspaceId": "uuid-v4",
  "calendarId": "primary",
  "event": {
    "summary": "Appointment: Haircut",
    "description": "Appointment with John Doe",
    "start": "2025-05-13T14:00:00-07:00",
    "end": "2025-05-13T15:00:00-07:00",
    "location": "123 Main St",
    "attendees": [
      {"email": "customer@example.com"},
      {"email": "staff@example.com"}
    ],
    "reminders": {
      "useDefault": false,
      "overrides": [
        {"method": "email", "minutes": 24 * 60},
        {"method": "popup", "minutes": 30}
      ]
    }
  }
}
```

**Response (201 Created):**
```json
{
  "eventId": "abc123xyz",
  "htmlLink": "https://www.google.com/calendar/event?eid=abc123xyz",
  "status": "confirmed",
  "createdAt": "2025-05-13T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid event data
- `401 Unauthorized` - Missing or invalid token
- `409 Conflict` - Event time conflict (optional)
- `502 Bad Gateway` - Composio API error

**Example:**
```bash
curl -X POST https://api.zenda.bot/integrations/composio/events \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
    "calendarId": "primary",
    "event": {
      "summary": "Appointment: Haircut",
      "description": "Appointment with John Doe",
      "start": "2025-05-13T14:00:00-07:00",
      "end": "2025-05-13T15:00:00-07:00"
    }
  }'
```

---

### Update Calendar Event

Updates an existing calendar event.

**Endpoint:** `PATCH /integrations/composio/events/:eventId`

**Authentication:** Required (JWT)

**URL Parameters:**
- `eventId` (string, required) - Google Calendar event ID

**Request Body:**
```json
{
  "workspaceId": "uuid-v4",
  "calendarId": "primary",
  "updates": {
    "summary": "Updated: Appointment: Haircut",
    "start": "2025-05-13T15:00:00-07:00",
    "end": "2025-05-13T16:00:00-07:00"
  }
}
```

**Response (200 OK):**
```json
{
  "eventId": "abc123xyz",
  "htmlLink": "https://www.google.com/calendar/event?eid=abc123xyz",
  "status": "updated",
  "updatedAt": "2025-05-13T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid update data
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Event not found
- `502 Bad Gateway` - Composio API error

**Example:**
```bash
curl -X PATCH https://api.zenda.bot/integrations/composio/events/abc123xyz \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
    "calendarId": "primary",
    "updates": {
      "start": "2025-05-13T15:00:00-07:00",
      "end": "2025-05-13T16:00:00-07:00"
    }
  }'
```

---

### Delete Calendar Event

Deletes a calendar event.

**Endpoint:** `DELETE /integrations/composio/events/:eventId`

**Authentication:** Required (JWT)

**URL Parameters:**
- `eventId` (string, required) - Google Calendar event ID

**Query Parameters:**
- `workspaceId` (string, required) - Workspace UUID
- `calendarId` (string, optional) - Calendar ID (default: "primary")

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Event deleted successfully",
  "deletedAt": "2025-05-13T10:45:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Event not found
- `502 Bad Gateway` - Composio API error

**Example:**
```bash
curl -X DELETE "https://api.zenda.bot/integrations/composio/events/abc123xyz?workspaceId=550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

## Authentication Patterns

### JWT Bearer Token

All authenticated endpoints require a JWT bearer token:

```bash
curl https://api.zenda.bot/integrations/zernio/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Structure

```typescript
interface JWTPayload {
  sub: string      // User ID
  workspaceId: string // Workspace ID
  iat: number      // Issued at
  exp: number      // Expires at
  jti: string      // Token ID (for revocation)
}
```

### Token Refresh

Access tokens expire after 1 hour. Refresh tokens can be used to obtain new access tokens:

**Endpoint:** `POST /auth/refresh`

```bash
curl -X POST https://api.zenda.bot/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your_refresh_token"}'
```

---

## Webhook Signature Verification

### Zernio Webhooks

Zernio signs webhook requests using HMAC SHA256:

```typescript
import { crypto } from 'node:crypto'

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}
```

**Headers:**
- `X-Zernio-Signature`: `sha256=<signature>`

**Example:**
```typescript
import { Elysia } from 'elysia'

app.post('/webhooks/zernio', async ({ request, headers }) => {
  const rawBody = await request.text()
  const signature = headers['x-zernio-signature']

  if (!verifyWebhookSignature(rawBody, signature, process.env.ZERNIO_WEBHOOK_SECRET)) {
    return { error: 'Invalid signature' }
  }

  // Process webhook
  const payload = JSON.parse(rawBody)
  return { status: 'ok' }
})
```

---

## Thread ID Format

### Structure

**Format:** `zernio:{accountId}:{conversationId}`

### Components

1. **Prefix:** `zernio` (constant)
2. **Account ID:** Zernio account identifier (e.g., `acct_1234567890`)
3. **Conversation ID:** Platform-specific conversation identifier

### Examples

| Platform | Thread ID | Description |
|----------|-----------|-------------|
| WhatsApp | `zernio:acct_1234567890:+1234567890` | WhatsApp conversation |
| Instagram | `zernio:acct_1234567890:ig_9876543210` | Instagram DM |
| Telegram | `zernio:acct_1234567890:tg_123456789` | Telegram chat |

### Parsing

```typescript
function parseThreadId(threadId: string): {
  provider: string
  accountId: string
  conversationId: string
} {
  const parts = threadId.split(':')

  if (parts.length < 3 || parts[0] !== 'zernio') {
    throw new Error(`Invalid thread ID format: ${threadId}`)
  }

  return {
    provider: parts[0],
    accountId: parts[1],
    conversationId: parts.slice(2).join(':'), // Handle nested colons
  }
}

// Usage
const { accountId, conversationId } = parseThreadId(
  'zernio:acct_1234567890:+1234567890'
)
// accountId = 'acct_1234567890'
// conversationId = '+1234567890'
```

### Building

```typescript
function buildThreadId(
  accountId: string,
  conversationId: string
): string {
  return `zernio:${accountId}:${conversationId}`
}

// Usage
const threadId = buildThreadId('acct_1234567890', '+1234567890')
// threadId = 'zernio:acct_1234567890:+1234567890'
```

---

## Error Codes

### Standard HTTP Status Codes

| Code | Title | Description |
|------|-------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Access denied to resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate integration) |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 502 | Bad Gateway | External API error (Zernio/Composio) |

### Integration-Specific Errors

| Code | Title | Description |
|------|-------|-------------|
| `INTEGRATION_NOT_FOUND` | Integration Not Found | No integration found for workspace |
| `INVALID_THREAD_ID` | Invalid Thread ID | Thread ID format is invalid |
| `WEBHOOK_SIGNATURE_INVALID` | Invalid Signature | Webhook signature verification failed |
| `ZERNIO_API_ERROR` | Zernio API Error | Error communicating with Zernio |
| `COMPOSIO_API_ERROR` | Composio API Error | Error communicating with Composio |
| `OAUTH_FLOW_FAILED` | OAuth Failed | OAuth authorization failed |
| `CALENDAR_EVENT_CONFLICT` | Event Conflict | Calendar event time conflict |
| `RATE_LIMIT_EXCEEDED` | Rate Limit | Too many requests to integration |

### Error Response Format

```json
{
  "error": "INTEGRATION_NOT_FOUND",
  "message": "No Zernio integration found for workspace",
  "details": {
    "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
    "provider": "zernio"
  },
  "timestamp": "2025-05-13T10:00:00Z"
}
```

---

## Rate Limiting

### Default Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /integrations/zernio/send` | 100 requests | 1 minute |
| `GET /integrations/composio/events` | 50 requests | 1 minute |
| `POST /integrations/composio/events` | 20 requests | 1 minute |
| All other endpoints | 1000 requests | 1 hour |

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1715600400
```

### Rate Limit Error Response

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Try again in 30 seconds.",
  "retryAfter": 30
}
```

---

## Testing

### Postman Collection

Import the provided Postman collection for testing all endpoints:

```json
{
  "info": {
    "name": "Zenda Integrations API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Zernio",
      "item": [
        {
          "name": "Connect WhatsApp",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "{{base_url}}/integrations/zernio/connect",
              "host": ["{{base_url}}"],
              "path": ["integrations", "zernio", "connect"]
            }
          }
        }
      ]
    }
  ]
}
```

### cURL Examples

See individual endpoint documentation for cURL examples.

---

## Changelog

### Version 1.0.0 (2025-05-13)

- Initial release
- Zernio WhatsApp integration endpoints
- Composio Google Calendar integration endpoints
- Webhook signature verification
- Thread ID format specification

---

## Support

For issues or questions:
- **Email:** api@zenda.bot
- **Documentation:** https://docs.zenda.bot
- **Status Page:** https://status.zenda.bot

---

**Document Version:** 1.0.0
**Last Updated:** 2025-05-13
**API Version:** v1
