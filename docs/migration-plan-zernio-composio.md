# Zernio & Composio Integration Plan

## Executive Summary

This document outlines the migration from Baileys (in-app WhatsApp client) to Zernio (server-side adapter) and the integration of Composio for Google Calendar operations.

**Key Requirements:**
- Move WhatsApp handling from desktop app to server-side
- Do NOT expose that we're using Zernio internally
- App contacts API, API talks to Zernio
- Add Google Calendar integration via Composio

---

## Current Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│   Desktop App   │ ◄─────────────────────────► │      API        │
│  (Electron)     │                             │  (Elysia/Bun)   │
│                 │                             │                 │
│  ┌───────────┐  │                             │  ┌───────────┐  │
│  │ Baileys   │  │                             │  │Conversation│  │
│  │ (WA SDK)  │  │                             │  │  Engine   │  │
│  └───────────┘  │                             │  └───────────┘  │
└─────────────────┘                             └─────────────────┘
```

**Flow:**
1. App connects to WhatsApp via Baileys (QR code, etc.)
2. App receives messages via Baileys
3. App forwards messages to API via WebSocket bridge
4. API processes messages (AI, appointment booking, etc.)
5. API sends responses back via WebSocket
6. App sends responses via Baileys

**Problems:**
- Heavy client (Baileys runs in Electron)
- Connection management in desktop app
- QR code flow in app
- No server-side control

---

## Target Architecture

```
┌─────────────────┐         HTTPS/WSS           ┌─────────────────┐
│   Desktop App   │ ◄─────────────────────────► │      API        │
│  (Electron)     │                             │  (Elysia/Bun)   │
│                 │                             │                 │
│  (Light Client) │                             │  ┌───────────┐  │
│                 │                             │  │  Zernio   │  │
│                 │                             │  │ (WA SDK)  │  │
│                 │                             │  └───────────┘  │
│                 │                             │                 │
│                 │                             │  ┌───────────┐  │
│                 │                             │  │ Composio  │  │
│                 │                             │  │ (GCal)    │  │
│                 │                             │  └───────────┘  │
└─────────────────┘                             └─────────────────┘
```

**New Flow:**
1. App is now a lightweight client (no Baileys)
2. API connects to Zernio for WhatsApp operations
3. API receives webhooks from Zernio for incoming messages
4. API processes messages and sends via Zernio
5. App polls/receives status updates via WebSocket
6. Google Calendar operations via Composio

---

## Phase 1: Zernio Integration (WhatsApp)

### 1.1 Dependencies

**API (`api/package.json`):**
```json
{
  "dependencies": {
    "zernio": "^1.0.0",
    "@zernio/core": "^1.0.0"
  }
}
```

**Remove from App (`app/package.json`):**
```json
{
  "dependencies": {
    "@whiskeysockets/baileys": "^7.0.0-rc.9"  // REMOVE
  }
}
```

### 1.2 Environment Variables

**API (`api/src/config/env.ts`):**
```typescript
export const ZERNIO_API_KEY = process.env.ZERNIO_API_KEY ?? ''
export const ZERNIO_WEBHOOK_SECRET = process.env.ZERNIO_WEBHOOK_SECRET ?? ''
export const ZERNIO_WEBHOOK_URL = process.env.ZERNIO_WEBHOOK_URL ?? ''
export const ZERNIO_API_BASE_URL = process.env.ZERNIO_API_BASE_URL ?? 'https://zernio.com/api'
```

**Environment (`.env`):**
```env
ZERNIO_API_KEY=your_api_key_here
ZERNIO_WEBHOOK_SECRET=your_webhook_secret_here
ZERNIO_WEBHOOK_URL=https://api.zenda.bot/webhooks/zernio
ZERNIO_API_BASE_URL=https://zernio.com/api
```

### 1.3 Database Schema Updates

**New table: `integrations`** (`packages/db/src/schema/integrations.ts`):
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const integrations = sqliteTable('integrations', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  type: text('type').notNull(), // 'whatsapp', 'google_calendar', etc.
  provider: text('provider').notNull(), // 'zernio', 'composio', etc.
  config: text('config').notNull(), // JSON string
  status: text('status').notNull(), // 'active', 'inactive', 'error'
  credentials: text('credentials'), // Encrypted JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export type Integration = typeof integrations.$inferSelect
```

**Update `whatsappConnections` table:**
- Add `provider` field (default: 'baileys', will be 'zernio')
- Add `zernioAccountId` field for Zernio account mapping
- Add `zernioConversationId` field for thread mapping
- Add `threadId` computed field: `zernio:{accountId}:{conversationId}`

### 1.4 API Module Structure

**New module: `api/src/modules/integrations/`**

```
api/src/modules/integrations/
├── index.ts                    # Main routes
├── zernio/
│   ├── client.ts              # Zernio client wrapper
│   ├── webhook-handler.ts     # Incoming webhooks
│   ├── message-sender.ts      # Send messages via Zernio
│   └── types.ts               # TypeScript types
└── composio/
    ├── client.ts              # Composio client wrapper
    ├── calendar-tools.ts      # Calendar operations
    └── types.ts               # TypeScript types
```

### 1.5 Zernio Client Implementation

**`api/src/modules/integrations/zernio/client.ts`:**
```typescript
import { createZernioAdapter, verifyWebhookSignature, type ZernioAdapterConfig } from '@zernio/chat-sdk-adapter'
import { logger } from '../../../infra/logger.js'

export interface ZernioConfig {
  apiKey: string
  webhookSecret: string
  webhookUrl: string
  apiBaseUrl?: string
}

export class ZernioClient {
  private adapter: ReturnType<typeof createZernioAdapter>
  private config: ZernioConfig

  constructor(config: ZernioConfig) {
    this.config = config
    this.adapter = createZernioAdapter({
      apiKey: config.apiKey,
      webhookSecret: config.webhookSecret,
      baseUrl: config.apiBaseUrl,
    })
  }

  /**
   * Send a message via Zernio
   * @param threadId - Format: zernio:{accountId}:{conversationId}
   * @param content - Message content
   */
  async sendMessage(threadId: string, content: string | { text: string; mediaUrl?: string }) {
    try {
      // Use the Chat SDK's thread.post via the adapter
      const thread = await this.adapter.getThread(threadId)
      const result = await thread.post(content)

      logger.info('Zernio message sent', { threadId, messageId: result.id })
      return result
    } catch (error) {
      logger.error('Zernio send failed', { error, threadId })
      throw error
    }
  }

  /**
   * Handle incoming webhook from Zernio
   * Returns the response for the webhook endpoint
   */
  async handleWebhook(request: Request): Promise<Response> {
    return this.adapter.webhook(request)
  }

  /**
   * Verify webhook signature manually (if needed outside adapter)
   */
  verifyWebhook(rawBody: string, signature: string): boolean {
    return verifyWebhookSignature(rawBody, signature, this.config.webhookSecret)
  }

  /**
   * Get thread info (platform, participants, etc.)
   */
  async getThreadInfo(threadId: string) {
    const thread = await this.adapter.getThread(threadId)
    return thread.info()
  }

  /**
   * List conversations (optional - for debugging/sync)
   */
  async listConversations(options?: { platform?: string; limit?: number }) {
    // Import the API client for direct access
    const { ZernioApiClient } = await import('@zernio/chat-sdk-adapter')
    const client = new ZernioApiClient(this.config.apiKey, this.config.apiBaseUrl)

    const { data } = await client.listConversations({
      platform: options?.platform,
      limit: options?.limit ?? 50,
    })

    return data
  }
}

// Singleton instance
let zernioClientInstance: ZernioClient | null = null

export function getZernioClient(): ZernioClient {
  if (!zernioClientInstance) {
    const config: ZernioConfig = {
      apiKey: process.env.ZERNIO_API_KEY!,
      webhookSecret: process.env.ZERNIO_WEBHOOK_SECRET!,
      webhookUrl: process.env.ZERNIO_WEBHOOK_URL!,
      apiBaseUrl: process.env.ZERNIO_API_BASE_URL,
    }
    zernioClientInstance = new ZernioClient(config)
  }
  return zernioClientInstance
}
```

### 1.6 Webhook Handler

**`api/src/modules/integrations/zernio/webhook-handler.ts`:**
```typescript
import { Elysia } from 'elysia'
import { getZernioClient } from './client.js'
import { processIncomingMessage } from '../../conversation/engine.js'
import { logger } from '../../../infra/logger.js'

/**
 * Zernio webhook endpoint
 * The Zernio adapter handles signature verification and payload parsing
 */
export const zernioWebhookModule = new Elysia({ prefix: '/webhooks/zernio' })

  /**
   * Main webhook endpoint for Zernio
   * Receives messages from all connected platforms (WhatsApp, IG, Telegram, etc.)
   */
  .post('/', async ({ request, body, headers }) => {
    try {
      const zernio = getZernioClient()

      // Convert Elysia request to Web API Request for the adapter
      const webhookRequest = new Request(
        request.url,
        {
          method: request.method,
          headers: headers as HeadersInit,
          body: JSON.stringify(body),
        }
      )

      // Let the Zernio adapter handle the webhook
      // It verifies signatures and routes to our message handlers
      const response = await zernio.handleWebhook(webhookRequest)
      const responseData = await response.json()

      // If the adapter processed the message successfully, we're done
      if (responseData.status === 'ok') {
        return { status: 'ok' }
      }

      // Handle errors from adapter
      logger.warn('Zernio webhook processing issue', { responseData })
      return { status: 'error', code: responseData.code || 'unknown' }

    } catch (error) {
      logger.error('Zernio webhook error', { error: error instanceof Error ? error.message : String(error) })
      return { status: 'error', code: 'processing_failed' }
    }
  })

  /**
   * Health check for webhook configuration
   */
  .get('/health', () => {
    const zernio = getZernioClient()
    return {
      status: 'ok',
      webhook: 'configured',
      timestamp: new Date().toISOString(),
    }
  })

/**
 * Set up the Chat SDK bot with Zernio adapter
 * This should be called during API initialization
 */
export async function initializeZernioBot() {
  const { Chat } = await import('chat')
  const { getZernioClient } = await import('./client.js')
  const { createMemoryState } = await import('@chat-adapter/state-memory')

  const zernio = getZernioClient()

  // Create the Chat SDK bot with Zernio adapter
  const bot = new Chat({
    userName: 'zenda-bot',
    adapters: {
      zernio: zernio['adapter'], // Access the internal adapter
    },
    state: createMemoryState(),
  })

  // Register handler for incoming messages
  bot.onNewMessage(/.*/, async (thread, message) => {
    try {
      const raw = message.raw as any

      // Extract platform and conversation info
      const platform = raw.platform // 'whatsapp', 'instagram', 'telegram', etc.
      const senderPhone = raw.sender?.phoneNumber
      const senderId = raw.sender?.id

      // Build thread ID: zernio:{accountId}:{conversationId}
      const threadId = thread.id

      // Extract account and conversation IDs from thread ID
      const { accountId, conversationId } = parseThreadId(threadId)

      // Find workspace by Zernio account ID
      const workspaceId = await getWorkspaceByZernioAccount(accountId, platform)
      if (!workspaceId) {
        logger.warn('No workspace found for Zernio account', { accountId, platform })
        return
      }

      // Process the message through our conversation engine
      await processIncomingMessage(workspaceId, {
        phoneNumber: senderPhone || senderId,
        body: message.text,
        contentType: raw.message?.type || 'text',
        mediaUrl: raw.message?.mediaUrl,
        timestamp: new Date(raw.timestamp || Date.now()).toISOString(),
        externalMessageId: message.id,
        platform, // Pass platform for context
      })

    } catch (error) {
      logger.error('Error processing Zernio message', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  })

  logger.info('Zernio bot initialized')

  return bot
}

/**
 * Parse Zernio thread ID: zernio:{accountId}:{conversationId}
 */
function parseThreadId(threadId: string): { accountId: string; conversationId: string } {
  const parts = threadId.split(':')
  if (parts.length < 3 || parts[0] !== 'zernio') {
    throw new Error(`Invalid Zernio thread ID: ${threadId}`)
  }
  return {
    accountId: parts[1],
    conversationId: parts.slice(2).join(':'), // Handle nested colons
  }
}

/**
 * Find workspace by Zernio account ID and platform
 * This queries our integrations table
 */
async function getWorkspaceByZernioAccount(
  accountId: string,
  platform: string
): Promise<string | null> {
  const { db } = await import('@zenda/db/client')
  const { integrations, eq, and } = await import('drizzle-orm')

  const [integration] = await db
    .select()
    .from(integrations)
    .where(
      and(
        eq(integrations.provider, 'zernio'),
        eq(integrations.type, platform) // 'whatsapp', 'instagram', etc.
      )
    )
    .limit(1)

  if (!integration) {
    return null
  }

  const config = JSON.parse(integration.config)
  // Check if this account ID matches
  if (config.accountId === accountId) {
    return integration.workspaceId
  }

  return null
}
```

### 1.7 Integration Routes

**`api/src/modules/integrations/index.ts`:**
```typescript
import { Elysia, t } from 'elysia'
import { zernioWebhookModule } from './zernio/webhook-handler.js'
import { composioRoutes } from './composio/index.js'

export const integrationsModule = new Elysia({ prefix: '/integrations' })
  .use(zernioWebhookModule)
  .use(composioRoutes)

  // Get integration status
  .get('/:workspaceId', async ({ params }) => {
    // Return all integrations for workspace
  })

  // Connect Zernio
  .post('/whatsapp/connect', async ({ body, workspaceId }) => {
    // Validate and store Zernio credentials
  })

  // Test connection
  .post('/whatsapp/test', async ({ body, workspaceId }) => {
    // Send test message via Zernio
  })

  // Disconnect
  .delete('/whatsapp/:integrationId', async ({ params }) => {
    // Remove integration
  })
```

### 1.8 App Changes (Remove Baileys)

**Files to remove:**
- `app/src/main/whatsapp/client.ts`
- `app/src/main/whatsapp/session.ts`
- `app/src/hooks/use-whatsapp.ts` (simplify)

**Files to modify:**
- `app/src/main/whatsapp/bridge.ts` - Remove Baileys-specific code, keep WebSocket
- `app/src/ipc/modules/whatsapp.ts` - Simplify to status updates only
- `app/package.json` - Remove `@whiskeysockets/baileys` dependency

---

## Phase 2: Composio Integration (Google Calendar)

### 2.1 Dependencies

**API (`api/package.json`):**
```json
{
  "dependencies": {
    "@composio/core": "^1.0.0",
    "@composio/vercel": "^1.0.0",
    "ai": "^4.0.0",
    "@ai-sdk/anthropic": "^1.0.0"
  }
}
```

### 2.2 Environment Variables

**API (`api/src/config/env.ts`):**
```typescript
export const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY ?? ''
export const COMPOSIO_BASE_URL = process.env.COMPOSIO_BASE_URL ?? 'https://api.composio.dev'
```

**Environment (`.env`):**
```env
COMPOSIO_API_KEY=your_composio_api_key_here
```

### 2.3 Composio Client

**`api/src/modules/integrations/composio/client.ts`:**
```typescript
import { Composio } from '@composio/core'
import { VercelProvider } from '@composio/vercel'
import { logger } from '../../../infra/logger.js'

export class ComposioClient {
  private composio: Composio

  constructor() {
    this.composio = new Composio({
      provider: new VercelProvider(),
      apiKey: process.env.COMPOSIO_API_KEY,
    })
  }

  async createSession(userId: string) {
    const session = await this.composio.create(userId)
    return session
  }

  async getTools(userId: string) {
    const session = await this.composio.create(userId)
    return session.tools()
  }

  async getConnectedAccounts(userId: string) {
    const session = await this.composio.create(userId)
    return session.connectedAccounts()
  }
}

export const composioClient = new ComposioClient()
```

### 2.4 Calendar Tools

**`api/src/modules/integrations/composio/calendar-tools.ts`:**
```typescript
import { anthropic } from "@ai-sdk/anthropic"
import { streamText, stepCountIs } from "ai"
import { composioClient } from "./client.js"

export interface CalendarEvent {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  attendees?: string[]
  location?: string
}

export class CalendarOperations {
  async createEvent(
    workspaceId: string,
    event: CalendarEvent
  ): Promise<string> {
    const userId = await getUserIdForWorkspace(workspaceId)
    const session = await composioClient.createSession(userId)
    const tools = await session.tools()

    const result = await streamText({
      model: anthropic("claude-sonnet-4-6"),
      prompt: `Create a Google Calendar event:
        Title: ${event.title}
        Description: ${event.description || 'N/A'}
        Start: ${event.startTime.toISOString()}
        End: ${event.endTime.toISOString()}
        ${event.attendees ? `Attendees: ${event.attendees.join(', ')}` : ''}
        ${event.location ? `Location: ${event.location}` : ''}`,
      tools,
      stopWhen: stepCountIs(5),
    })

    let eventId = ''
    for await (const textPart of result.textStream) {
      // Parse event ID from response
    }

    return eventId
  }

  async updateEvent(
    workspaceId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<void> {
    const userId = await getUserIdForWorkspace(workspaceId)
    const session = await composioClient.createSession(userId)
    const tools = await session.tools()

    await streamText({
      model: anthropic("claude-sonnet-4-6"),
      prompt: `Update Google Calendar event ${eventId} with: ${JSON.stringify(updates)}`,
      tools,
      stopWhen: stepCountIs(3),
    })
  }

  async deleteEvent(workspaceId: string, eventId: string): Promise<void> {
    const userId = await getUserIdForWorkspace(workspaceId)
    const session = await composioClient.createSession(userId)
    const tools = await session.tools()

    await streamText({
      model: anthropic("claude-sonnet-4-6"),
      prompt: `Delete Google Calendar event ${eventId}`,
      tools,
      stopWhen: stepCountIs(2),
    })
  }

  async listEvents(
    workspaceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const userId = await getUserIdForWorkspace(workspaceId)
    const session = await composioClient.createSession(userId)
    const tools = await session.tools()

    const result = await streamText({
      model: anthropic("claude-sonnet-4-6"),
      prompt: `List Google Calendar events between ${startDate.toISOString()} and ${endDate.toISOString()}`,
      tools,
      stopWhen: stepCountIs(3),
    })

    // Parse and return events
    return []
  }
}

async function getUserIdForWorkspace(workspaceId: string): Promise<string> {
  // Map workspace ID to Composio user ID
  // This could be stored in the integrations table
  return `workspace_${workspaceId}`
}

export const calendarOps = new CalendarOperations()
```

### 2.5 Connection Flow Routes

**`api/src/modules/integrations/composio/index.ts`:**
```typescript
import { Elysia, t } from 'elysia'
import { composioClient } from './client.js'
import { calendarOps } from './calendar-tools.js'

export const composioRoutes = new Elysia({ prefix: '/composio' })

  // Get connection URL
  .get('/connect/:workspaceId', async ({ params }) => {
    const userId = `workspace_${params.workspaceId}`
    const session = await composioClient.createSession(userId)
    const connectionUrl = await session.getConnectionUrl('google_calendar')

    return {
      connectionUrl,
      // Redirect user to this URL to authorize
    }
  })

  // Callback handler (after user authorizes)
  .get('/callback', async ({ query }) => {
    const { code, state, workspaceId } = query

    // Exchange code for access token
    const userId = `workspace_${workspaceId}`
    const session = await composioClient.createSession(userId as string)
    await session.connect(code as string)

    // Store connection in database
    await storeConnection(workspaceId as string, {
      provider: 'composio',
      type: 'google_calendar',
      status: 'active',
      credentials: { userId },
    })

    return { status: 'connected' }
  })

  // Test connection
  .post('/test/:workspaceId', async ({ params }) => {
    const events = await calendarOps.listEvents(
      params.workspaceId,
      new Date(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
    )

    return { events, count: events.length }
  })

  // Create event (for testing/manual use)
  .post('/events/:workspaceId', async ({ params, body }) => {
    const eventId = await calendarOps.createEvent(
      params.workspaceId,
      body as any
    )

    return { eventId }
  })

async function storeConnection(workspaceId: string, config: any) {
  // Store in integrations table
  // Implementation...
}
```

### 2.6 Integration with Appointment System

**Update appointment engine to use Composio:**

When an appointment is confirmed, automatically create a calendar event:

**`api/src/modules/appointment/index.ts`:**
```typescript
import { calendarOps } from '../integrations/composio/calendar-tools.js'

export async function confirmAppointment(appointmentId: string) {
  // ... existing confirmation logic ...

  // Create calendar event
  const eventId = await calendarOps.createEvent(workspaceId, {
    title: `Appointment: ${service.name}`,
    description: `Appointment with ${customer.name}`,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
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

---

## Phase 3: App UI Updates

### 3.1 Remove WhatsApp QR Flow

**Before:** User scans QR code in app to connect WhatsApp
**After:** User connects WhatsApp via Zernio dashboard, app just shows status

**Update:** `app/src/routes/onboarding` and `app/src/routes/settings`

### 3.2 Integration Settings Screen

New screen to manage integrations:

**`app/src/routes/integrations/index.tsx`:**
```tsx
export function IntegrationsSettings() {
  return (
    <div>
      <h2>Integrations</h2>

      {/* WhatsApp Status */}
      <WhatsAppCard />

      {/* Google Calendar Connect */}
      <GoogleCalendarCard />

      {/* Future integrations */}
      <FutureIntegrations />
    </div>
  )
}

function WhatsAppCard() {
  const { data } = useIntegrationStatus('whatsapp')

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.status === 'active' ? (
          <Badge variant="success">Connected</Badge>
        ) : (
          <Button onClick={handleConnect}>
            Connect via Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function GoogleCalendarCard() {
  const { data } = useIntegrationStatus('google_calendar')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.status === 'active' ? (
          <Badge variant="success">Connected</Badge>
        ) : (
          <Button onClick={handleConnectGoogleCalendar}>
            Connect Calendar
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function handleConnectGoogleCalendar() {
  // Open Composio connection URL in browser
  const connectionUrl = `https://api.zenda.bot/integrations/composio/connect/${workspaceId}`
  shell.openExternal(connectionUrl)
}
```

---

## Implementation Order

### Sprint 1: Foundation (Week 1)
1. Set up integrations table and migrations
2. Create integrations module structure
3. Add environment variables and config
4. Update app package.json (remove Baileys)

### Sprint 2: Zernio Core (Week 2)
1. Implement Zernio client wrapper
2. Create webhook handler
3. Update conversation engine to use Zernio for sending
4. Test webhook receiving and message sending

### Sprint 3: App Migration (Week 3)
1. Remove Baileys code from app
2. Update IPC handlers (remove QR flow)
3. Create integration status API
4. Update UI to show integration status

### Sprint 4: Composio Integration (Week 4)
1. Set up Composio client
2. Create calendar operations
3. Implement connection flow
4. Integrate with appointment system

### Sprint 5: Testing & Polish (Week 5)
1. End-to-end testing
2. Error handling improvements
3. Documentation updates
4. Deployment

---

## Risk Mitigation

### Risk 1: Zernio API Downtime
**Mitigation:** Implement fallback/retry logic, status monitoring

### Risk 2: Composio Rate Limits
**Mitigation:** Implement request queue, batching for calendar ops

### Risk 3: Data Migration
**Mitigation:** Keep old tables for rollback, run parallel during transition

### Risk 4: User Re-authentication
**Mitigation:** Clear communication, step-by-step migration guide

---

## Success Criteria

- [ ] All WhatsApp messages flow through Zernio (no Baileys in app)
- [ ] Google Calendar events created/updated for appointments
- [ ] App works without Baileys (lightweight client)
- [ ] No mention of "Zernio" in user-facing UI
- [ ] All existing functionality preserved
- [ ] Error rates < 1% for both integrations
- [ ] Response time < 2s for message sending

---

## Open Questions

1. **Zernio Setup:** Who will set up the Zernio account and phone number?
2. **Composio Billing:** What's the expected volume? Which tier?
3. **Migration Timeline:** Can we do a gradual rollout or is it all-at-once?
4. **Testing Environment:** Do we have a Zernio/Composio sandbox for testing?
5. **User Communication:** What's the messaging to users about the change?

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Create Zernio account** and get API credentials
3. **Set up Composio** account and get API key
4. **Create detailed tickets** for each sprint
5. **Set up staging environment** for testing
