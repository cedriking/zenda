# Composio Integration - Quick Start Guide

## Setup

1. **Add environment variables** to `.env`:
```env
COMPOSIO_API_KEY=your_api_key_here
COMPOSIO_BASE_URL=https://api.composio.dev
```

2. **Restart the API**:
```bash
cd api
bun run dev
```

## Usage

### 1. Connect Google Calendar

```bash
curl -X POST http://localhost:3001/integrations/composio/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"redirectUri": "http://localhost:3000/callback"}'
```

Response:
```json
{
  "status": "pending",
  "connectionUrl": "https://api.composio.dev/...",
  "sessionId": "sess_workspace_123_...",
  "message": "Visit the connection URL to authorize"
}
```

### 2. Create Calendar Event

```bash
curl -X POST http://localhost:3001/integrations/composio/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startTime": "2025-01-20T10:00:00Z",
    "endTime": "2025-01-20T11:00:00Z",
    "attendees": ["john@example.com"],
    "location": "Conference Room"
  }'
```

### 3. List Events

```bash
curl "http://localhost:3001/integrations/composio/events?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Event

```bash
curl -X PATCH "http://localhost:3001/integrations/composio/events/EVENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### 5. Delete Event

```bash
curl -X DELETE "http://localhost:3001/integrations/composio/events/EVENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Check Connection Status

```bash
curl "http://localhost:3001/integrations/composio/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Disconnect

```bash
curl -X DELETE "http://localhost:3001/integrations/composio/disconnect" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration with App

### In your Electron app:

```typescript
// Connect Google Calendar
async function connectCalendar() {
  const response = await fetch('/integrations/composio/connect', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  })
  const { connectionUrl } = await response.json()

  // Open in browser for authorization
  shell.openExternal(connectionUrl)
}

// Create event from appointment
async function createAppointmentEvent(appointment: Appointment) {
  const response = await fetch('/integrations/composio/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: `Appointment: ${appointment.serviceName}`,
      description: `Customer: ${appointment.customerName}`,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      attendees: [appointment.customerEmail],
      location: appointment.businessAddress,
    }),
  })

  const { eventId } = await response.json()
  return eventId
}
```

## Testing

Run the test suite:
```bash
cd api
bun test src/modules/integrations/composio/__test__/client.test.ts
```

Expected output:
```
✓ 8 tests passed
✗ 0 tests failed
```

## Troubleshooting

### Connection fails
- Check `COMPOSIO_API_KEY` is set
- Verify network connectivity to Composio API
- Check logs for detailed error messages

### Events not created
- Verify calendar is connected: `GET /integrations/composio/status`
- Check event dates are valid ISO 8601 format
- Ensure required fields (title, startTime, endTime) are present

### Tests fail
- Ensure all dependencies are installed: `bun install`
- Check TypeScript version: `bun --version`
- Verify no port conflicts: `lsof -i :3001`

## Files Reference

- **Client Implementation**: `api/src/modules/integrations/composio/client.ts`
- **API Routes**: `api/src/modules/integrations/composio/index.ts`
- **Tests**: `api/src/modules/integrations/composio/__test__/client.test.ts`
- **Documentation**: `api/src/modules/integrations/composio/README.md`

## Support

For detailed documentation, see `README.md`
For implementation details, see `IMPLEMENTATION_SUMMARY.md`
