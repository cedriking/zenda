# Composio Integration - Google Calendar

This module provides Google Calendar integration using Composio, following the Vercel AI SDK pattern for tool execution.

## Architecture

```
┌─────────────────┐         HTTP         ┌─────────────────┐
│   Desktop App   │ ◄────────────────────► │      API        │
│  (Electron)     │                         │  (Elysia/Bun)   │
│                 │                         │                 │
│  Calendar UI    │                         │  ComposioClient │
│                 │                         │  ┌───────────┐  │
└─────────────────┘                         │  │ Composio  │  │
                                            │  │   API    │  │
                                            │  └───────────┘  │
                                            │                 │
                                            │  Google Calendar│
                                            └─────────────────┘
```

## Environment Variables

Add to your `.env` file:

```env
# Composio Integration
COMPOSIO_API_KEY=your_composio_api_key_here
COMPOSIO_BASE_URL=https://api.composio.dev
```

## API Endpoints

### Connection Management

#### POST `/integrations/composio/connect`
Initiate Google Calendar connection for a workspace.

**Request:**
```json
{
  "redirectUri": "https://your-app.com/calendar/callback" // optional
}
```

**Response:**
```json
{
  "status": "pending",
  "connectionUrl": "https://api.composio.dev/v1/connections/google_calendar/authorize?session_id=...",
  "sessionId": "sess_workspace_123_1234567890",
  "message": "Visit the connection URL to authorize Google Calendar access"
}
```

#### GET `/integrations/composio/callback`
Handle OAuth callback from Composio (called after user authorizes).

**Query Parameters:**
- `code`: Authorization code
- `state` or `session_id`: Session identifier

**Response:**
```json
{
  "status": "connected",
  "accountId": "acc_workspace_123",
  "provider": "google_calendar",
  "message": "Google Calendar connected successfully"
}
```

#### GET `/integrations/composio/status`
Get connection status for the workspace.

**Response:**
```json
{
  "status": "active",
  "provider": "google_calendar",
  "accountId": "acc_workspace_123"
}
```

#### DELETE `/integrations/composio/disconnect`
Disconnect Google Calendar for the workspace.

**Response:**
```json
{
  "status": "disconnected",
  "message": "Google Calendar disconnected successfully"
}
```

### Calendar Events

#### GET `/integrations/composio/events`
List calendar events for a date range.

**Query Parameters:**
- `startDate` (required): ISO 8601 start date
- `endDate` (required): ISO 8601 end date
- `calendarId` (optional): Specific calendar ID

**Response:**
```json
{
  "events": [
    {
      "title": "Team Meeting",
      "description": "Weekly team sync",
      "startTime": "2025-01-15T10:00:00Z",
      "endTime": "2025-01-15T11:00:00Z",
      "attendees": ["john@example.com", "jane@example.com"],
      "location": "Conference Room A"
    }
  ],
  "count": 1
}
```

#### POST `/integrations/composio/events`
Create a new calendar event.

**Request:**
```json
{
  "title": "Product Demo",
  "description": "Demo for new client",
  "startTime": "2025-01-20T14:00:00Z",
  "endTime": "2025-01-20T15:00:00Z",
  "attendees": ["client@example.com"],
  "location": "Main Office"
}
```

**Response:**
```json
{
  "status": "created",
  "eventId": "evt_workspace_123_1234567890",
  "htmlLink": "https://calendar.google.com/calendar/event?eid=...",
  "message": "Calendar event created successfully"
}
```

#### PATCH `/integrations/composio/events/:id`
Update an existing calendar event.

**Request:**
```json
{
  "title": "Updated Title",
  "startTime": "2025-01-20T15:00:00Z",
  "endTime": "2025-01-20T16:00:00Z"
}
```

**Response:**
```json
{
  "status": "updated",
  "eventId": "evt_workspace_123_1234567890",
  "updated": true,
  "message": "Calendar event updated successfully"
}
```

#### DELETE `/integrations/composio/events/:id`
Delete a calendar event.

**Response:**
```json
{
  "status": "deleted",
  "deleted": true,
  "message": "Calendar event deleted successfully"
}
```

## Usage Example

### Connect Google Calendar

```typescript
// 1. Initiate connection
const response = await fetch('/integrations/composio/connect', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    redirectUri: 'https://your-app.com/calendar/callback',
  }),
})

const { connectionUrl } = await response.json()

// 2. Redirect user to connection URL
window.location.href = connectionUrl

// 3. After user authorizes, they'll be redirected to your callback
```

### Create Calendar Event

```typescript
const response = await fetch('/integrations/composio/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'Appointment: Haircut',
    description: 'Customer: John Doe',
    startTime: '2025-01-20T10:00:00Z',
    endTime: '2025-01-20T11:00:00Z',
    attendees: ['customer@example.com'],
    location: '123 Main St',
  }),
})

const { eventId, htmlLink } = await response.json()
```

### List Events

```typescript
const response = await fetch(
  `/integrations/composio/events?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
)

const { events } = await response.json()
```

## Integration with Appointment System

When an appointment is confirmed, automatically create a calendar event:

```typescript
import { getComposioClient } from './modules/integrations/composio/client.js'

export async function confirmAppointment(appointmentId: string) {
  // ... existing confirmation logic ...

  const client = getComposioClient()

  // Create calendar event
  const { eventId } = await client.createEvent(workspaceId, {
    title: `Appointment: ${service.name}`,
    description: `Appointment with ${customer.name}`,
    startTime: appointment.startAt.toISOString(),
    endTime: appointment.endAt.toISOString(),
    attendees: [customer.email, staff.email],
    location: business.address,
  })

  // Store event ID with appointment
  await db.update(appointments)
    .set({ calendarEventId: eventId })
    .where(eq(appointments.id, appointmentId))

  return { appointmentId, eventId }
}
```

## Testing

Run tests:

```bash
cd api
bun test src/modules/integrations/composio/__test__/client.test.ts
```

All tests should pass:

```
✓ connectAccount
✓ handleCallback
✓ listEvents
✓ createEvent
✓ updateEvent
✓ deleteEvent
✓ getConnectionStatus
✓ disconnectAccount

8 pass
0 fail
```

## Files Structure

```
api/src/modules/integrations/composio/
├── client.ts           # ComposioClient class
├── index.ts            # API routes
├── __test__/
│   └── client.test.ts  # Unit tests
└── README.md           # This file
```

## Implementation Notes

1. **Mock Implementation**: The current implementation uses mock responses. In production, replace the mock calls with actual Composio API calls.

2. **Error Handling**: All methods include comprehensive error handling with logging.

3. **Type Safety**: Full TypeScript support with proper interfaces.

4. **Vercel AI SDK Pattern**: Follows the pattern of connecting accounts first, then using tools for operations.

5. **Singleton Pattern**: Uses a singleton instance for the client to manage connections efficiently.

## Next Steps

1. Replace mock implementations with actual Composio API calls
2. Add retry logic for failed API calls
3. Implement request queue for rate limit handling
4. Add webhook support for real-time calendar updates
5. Add comprehensive integration tests

## Migration from Zernio

See the full migration plan at:
`docs/migration-plan-zernio-composio.md`

## Support

For issues or questions:
- Check the Composio documentation: https://docs.composio.dev
- Review the migration plan
- Check test files for usage examples
