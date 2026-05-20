# Migration Guide: Zernio & Composio Integration

## Overview

This guide provides step-by-step instructions for migrating from Baileys (in-app WhatsApp client) to Zernio (server-side adapter) and integrating Composio for Google Calendar operations.

**Target Audience:** DevOps engineers, backend developers, system administrators

**Estimated Time:** 4-6 hours

**Critical Path:** Database migration → API deployment → App update → Testing

---

## Prerequisites

### 1. API Keys & Credentials

#### Zernio
- [ ] Zernio API account
- [ ] Zernio API Key
- [ ] Zernio Webhook Secret
- [ ] Zernio Account ID (after phone number setup)

**Get credentials:** https://zernio.com/dashboard → API Settings

#### Composio
- [ ] Composio API account
- [ ] Composio API Key
- [ ] OAuth App configured (Google Calendar)

**Get credentials:** https://composio.dev/dashboard → API Keys

### 2. Infrastructure Requirements

- **Database:** PostgreSQL 14+ with migration permissions
- **API Server:** Node.js 18+, Bun 1.0+
- **Webhook URL:** Publicly accessible HTTPS endpoint
- **Redis:** For session caching (optional but recommended)

### 3. Backup Requirements

```bash
# Create database backup
pg_dump $DATABASE_URL > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore --list backup_before_migration_*.sql
```

---

## Phase 1: Database Schema Migration

### Step 1.1: Create Integrations Table

Run this migration **before** deploying the new API:

```sql
-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'whatsapp', 'google_calendar', etc.
  provider VARCHAR(50) NOT NULL, -- 'zernio', 'composio', etc.
  config JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'error'
  credentials TEXT, -- Encrypted JSON
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for lookups
CREATE INDEX idx_integrations_workspace_type ON integrations(workspace_id, type);
CREATE INDEX idx_integrations_provider_status ON integrations(provider, status);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Step 1.2: Update WhatsApp Connections Table

```sql
-- Add new columns to whatsapp_connections
ALTER TABLE whatsapp_connections
  ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'baileys',
  ADD COLUMN IF NOT EXISTS zernio_account_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS zernio_conversation_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS thread_id VARCHAR(200) GENERATED ALWAYS AS (
    CASE
      WHEN provider = 'zernio' AND zernio_account_id IS NOT NULL
      THEN 'zernio:' || zernio_account_id || ':' || COALESCE(zernio_conversation_id, '')
      ELSE NULL
    END
  ) STORED;

-- Create index for thread lookups
CREATE INDEX idx_whatsapp_connections_thread_id ON whatsapp_connections(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_whatsapp_connections_zernio_account ON whatsapp_connections(zernio_account_id) WHERE zernio_account_id IS NOT NULL;
```

### Step 1.3: Add Calendar Event ID to Appointments

```sql
-- Add external calendar event reference
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(200),
  ADD COLUMN IF NOT EXISTS calendar_provider VARCHAR(50); -- 'composio', 'google', etc.

-- Create index for calendar sync
CREATE INDEX idx_appointments_calendar_event ON appointments(calendar_event_id) WHERE calendar_event_id IS NOT NULL;
```

### Step 1.4: Verify Migration

```sql
-- Check tables
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('integrations', 'whatsapp_connections', 'appointments')
  AND column_name IN ('provider', 'zernio_account_id', 'calendar_event_id')
ORDER BY table_name, ordinal_position;

-- Expected output:
-- integrations | provider | character varying
-- integrations | type | character varying
-- whatsapp_connections | provider | character varying
-- whatsapp_connections | zernio_account_id | character varying
-- appointments | calendar_event_id | character varying
```

---

## Phase 2: Environment Configuration

### Step 2.1: API Environment Variables

Add to `.env` file:

```env
# Zernio Configuration
ZERNIO_API_KEY=zk_live_your_api_key_here
ZERNIO_WEBHOOK_SECRET=whsec_your_webhook_secret_here
ZERNIO_WEBHOOK_URL=https://api.zenda.bot/webhooks/zernio
ZERNIO_API_BASE_URL=https://zernio.com/api

# Composio Configuration
COMPOSIO_API_KEY=cpk_your_api_key_here
COMPOSIO_BASE_URL=https://api.composio.dev

# Feature Flags
ENABLE_ZERNIO_WHATSAPP=true
ENABLE_COMPOSIO_CALENDAR=true
```

### Step 2.2: Validate Environment

```bash
# Check environment variables are set
echo "ZERNIO_API_KEY: ${ZERNIO_API_KEY:0:10}..."
echo "ZERNIO_WEBHOOK_URL: $ZERNIO_WEBHOOK_URL"
echo "COMPOSIO_API_KEY: ${COMPOSIO_API_KEY:0:10}..."

# Test webhook URL is accessible
curl -I $ZERNIO_WEBHOOK_URL/health
# Expected: 404 (endpoint not yet deployed) or 200 (if deployed)
```

---

## Phase 3: Data Migration

### Step 3.1: Migrate WhatsApp Connections

**Objective:** Convert existing phone-based connections to thread-based

```sql
-- Migration script: Convert phone numbers to thread IDs
-- This is a preparatory step. Actual thread IDs will be populated
-- when messages are received via Zernio webhooks.

-- 1. Update all existing connections to Zernio provider
UPDATE whatsapp_connections
SET provider = 'zernio',
    status = CASE
      WHEN status = 'connected' THEN 'inactive'
      ELSE status
    END
WHERE provider = 'baileys';

-- 2. Create integration records for each workspace
INSERT INTO integrations (workspace_id, type, provider, config, status)
SELECT
  wc.workspace_id,
  'whatsapp' as type,
  'zernio' as provider,
  jsonb_build_object(
    'phoneNumber', wc.phone_number,
    'migratedFrom', 'baileys',
    'migratedAt', NOW()
  ) as config,
  'inactive' as status
FROM whatsapp_connections wc
WHERE wc.provider = 'zernio'
ON CONFLICT DO NOTHING;

-- 3. Verify migration
SELECT
  i.workspace_id,
  i.provider,
  i.type,
  i.status,
  i.config->>'phoneNumber' as phone_number
FROM integrations i
WHERE i.provider = 'zernio' AND i.type = 'whatsapp';
```

### Step 3.2: Back Up Existing Data

```bash
# Export conversation data for rollback safety
psql $DATABASE_URL -c "
  COPY (
    SELECT 
      id, workspace_id, customer_phone, mode, 
      last_message_at, created_at
    FROM conversations
  ) TO 'conversations_backup_$(date +%Y%m%d).csv' CSV HEADER
"

# Export message data
psql $DATABASE_URL -c "
  COPY (
    SELECT 
      id, conversation_id, sender_type, content_type, 
      body, created_at
    FROM messages
    WHERE created_at > NOW() - INTERVAL '30 days'
  ) TO 'messages_backup_$(date +%Y%m%d).csv' CSV HEADER
"
```

---

## Phase 4: API Deployment

### Step 4.1: Install Dependencies

```bash
cd /path/to/zenda/api

# Install Zernio SDK
npm install @zernio/chat-sdk-adapter

# Install Composio SDK
npm install @composio/core @composio/vercel

# Install AI SDK for Composio tools
npm install ai @ai-sdk/anthropic
```

### Step 4.2: Deploy Integration Module

The integration module should be at `api/src/modules/integrations/`:

**Structure:**
```
api/src/modules/integrations/
├── index.ts                    # Main routes
├── zernio/
│   ├── client.ts              # Zernio client wrapper
│   ├── webhook-handler.ts     # Incoming webhooks
│   └── types.ts               # TypeScript types
└── composio/
    ├── client.ts              # Composio client wrapper
    ├── calendar-tools.ts      # Calendar operations
    └── types.ts               # TypeScript types
```

### Step 4.3: Register Integration Routes

Update `api/src/index.ts`:

```typescript
// Add after other module imports
import { integrationsModule } from './modules/integrations/index.js'

// Add to app routes (before authenticated routes section)
.use(integrationsModule)
```

### Step 4.4: Build & Deploy

```bash
# Build the API
npm run build

# Run database migrations
npm run db:migrate

# Deploy (adjust for your setup)
docker-compose up -d api
# OR
kubectl apply -f k8s/api-deployment.yaml
# OR
vercel --prod
```

### Step 4.5: Verify Deployment

```bash
# Health check
curl https://api.zenda.bot/health
# Expected: {"status":"ok","db":true,"timestamp":"..."}

# Webhook health check
curl https://api.zenda.bot/webhooks/zernio/health
# Expected: {"status":"ok","webhook":"configured","timestamp":"..."}

# Integration status (authenticated)
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://api.zenda.bot/integrations
# Expected: Array of integrations (may be empty initially)
```

---

## Phase 5: Zernio Setup

### Step 5.1: Configure Zernio Account

1. **Log in to Zernio Dashboard**
   - Go to https://zernio.com/dashboard
   - Navigate to "Phone Numbers"

2. **Add WhatsApp Number**
   - Click "Connect Number"
   - Select "WhatsApp"
   - Follow QR code flow (similar to Baileys)
   - Note the `Account ID` from dashboard

3. **Configure Webhook**
   - Go to "Webhooks" → "Add Webhook"
   - URL: `https://api.zenda.bot/webhooks/zernio`
   - Secret: Use the value from `ZERNIO_WEBHOOK_SECRET`
   - Events: `message.received`, `message.sent`, `connection.updated`

### Step 5.2: Connect Workspace to Zernio

```bash
# Connect WhatsApp integration
curl -X POST https://api.zenda.bot/integrations/zernio/connect \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "'$WORKSPACE_ID'",
    "zernioAccountId": "acct_1234567890",
    "phoneNumber": "+1234567890"
  }'

# Expected response:
# {
#   "integrationId": "uuid-...",
#   "status": "active",
#   "threadId": "zernio:acct_1234567890:"
# }
```

### Step 5.3: Test Message Flow

```bash
# Send test message via Zernio
curl -X POST https://api.zenda.bot/integrations/zernio/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "zernio:acct_1234567890:test_conversation",
    "content": "Test message from Zernio integration"
  }'

# Check conversation in database
psql $DATABASE_URL -c "
  SELECT id, customer_phone, mode, last_message_at
  FROM conversations
  WHERE workspace_id = '$WORKSPACE_ID'
  ORDER BY last_message_at DESC
  LIMIT 5
"
```

---

## Phase 6: Composio Setup

### Step 6.1: Configure Composio Account

1. **Log in to Composio Dashboard**
   - Go to https://composio.dev/dashboard
   - Navigate to "Integrations"

2. **Create Google Calendar Integration**
   - Click "Add Integration"
   - Select "Google Calendar"
   - Configure OAuth scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`

3. **Get API Key**
   - Go to "API Keys"
   - Copy your API key to `COMPOSIO_API_KEY`

### Step 6.2: Connect Calendar Integration

```bash
# Get Composio connection URL
curl https://api.zenda.bot/integrations/composio/connect/$WORKSPACE_ID \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response:
# {
#   "connectionUrl": "https://app.composio.dev/authorize?client_id=..."
# }

# Open URL in browser to authorize
```

### Step 6.3: Test Calendar Operations

```bash
# List calendars
curl https://api.zenda.bot/integrations/composio/calendars \
  -H "Authorization: Bearer $JWT_TOKEN"

# Expected response:
# {
#   "calendars": [
#     {"id": "primary", "name": "user@gmail.com"},
#     {"id": "...", "name": "Work Calendar"}
#   ]
# }

# List events
curl "https://api.zenda.bot/integrations/composio/events?timeMin=2024-01-01T00:00:00Z&timeMax=2024-12-31T23:59:59Z" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

---

## Phase 7: App Update

### Step 7.1: Remove Baileys Dependency

```bash
cd /path/to/zenda/app

# Remove Baileys
npm uninstall @whiskeysockets/baileys

# Remove Baileys-related files
rm -rf src/main/whatsapp/client.ts
rm -rf src/main/whatsapp/session.ts
```

### Step 7.2: Update IPC Handlers

Simplify WhatsApp bridge to only handle status updates:

```typescript
// app/src/ipc/modules/whatsapp.ts
// Remove QR code generation
// Remove message sending via Baileys
// Keep only status polling
```

### Step 7.3: Build & Deploy App

```bash
npm run build
npm run package
# Deploy to users
```

---

## Phase 8: Testing Checklist

### 8.1 WhatsApp Message Flow

- [ ] User sends message to WhatsApp number
- [ ] Webhook received at `/webhooks/zernio`
- [ ] Message processed by conversation engine
- [ ] Response sent via Zernio
- [ ] Message appears in WhatsApp
- [ ] Conversation saved in database with correct `threadId`

### 8.2 Calendar Integration

- [ ] User connects Google Calendar
- [ ] Calendar connection appears in integrations list
- [ ] Appointment creation triggers calendar event
- [ ] Event appears in Google Calendar
- [ ] `calendar_event_id` saved in appointments table

### 8.3 Error Handling

- [ ] Invalid webhook signature rejected
- [ ] Rate limiting works (429 response)
- [ ] Failed message sends are retried
- [ ] Connection errors are logged

### 8.4 Performance

- [ ] Message send latency < 2s
- [ ] Webhook processing < 500ms
- [ ] Calendar event creation < 3s
- [ ] Database queries optimized (check EXPLAIN ANALYZE)

---

## Phase 9: Monitoring

### 9.1 Key Metrics to Monitor

```sql
-- Message throughput
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as message_count
FROM messages
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- Integration health
SELECT
  provider,
  type,
  status,
  COUNT(*) as count
FROM integrations
GROUP BY provider, type, status;

-- Failed webhooks (add logging table if needed)
SELECT
  error_type,
  COUNT(*) as error_count,
  MAX(last_occurred_at) as last_occurred
FROM webhook_errors
WHERE last_occurred_at > NOW() - INTERVAL '1 hour'
GROUP BY error_type;
```

### 9.2 Alerting Triggers

Set up alerts for:
- Webhook failure rate > 5%
- Message send latency > 5s (p95)
- Integration status = 'error' for > 5 minutes
- Database connection failures

---

## Rollback Triggers

**Immediately rollback if:**

1. **Critical Data Loss**
   - Messages not being saved to database
   - Conversation threadIds becoming NULL
   - Calendar events not syncing

2. **Service Degradation**
   - Message send success rate < 95%
   - API response time > 10s (p95)
   - Webhook processing failures > 10%

3. **Security Issues**
   - Webhook signatures not verifying
   - Unauthorized API access
   - Data encryption failures

4. **User Impact**
   - Users unable to send/receive messages
   - App crashes on startup
   - Calendar integration completely broken

---

## Rollback Procedure

If rollback is triggered, follow these steps:

### Step 1: Database Reversion

```bash
# Stop all API instances
kubectl scale deployment api --replicas=0

# Restore database from backup
pg_restore -d $DATABASE_URL backup_before_migration_*.sql

# Verify data integrity
psql $DATABASE_URL -c "
  SELECT COUNT(*) FROM conversations;
  SELECT COUNT(*) FROM messages;
  SELECT COUNT(*) FROM appointments;
"
```

### Step 2: Code Reversion

```bash
# Revert to previous commit
git revert <migration-commit-hash>

# Or checkout previous tag
git checkout tags/v<previous-version>

# Rebuild API
cd api && npm run build

# Deploy previous version
kubectl apply -f k8s/api-deployment-previous.yaml
```

### Step 3: App Reversion

```bash
# If app was already updated, revert to previous version
git checkout tags/v<previous-version>
cd app && npm run build && npm run package

# Deploy to users (force update if needed)
```

### Step 4: Verification

```bash
# Test message flow
curl -X POST https://api.zenda.bot/test/message \
  -H "Authorization: Bearer $JWT_TOKEN"

# Check database integrity
psql $DATABASE_URL -c "
  SELECT COUNT(*) as conversations FROM conversations;
  SELECT COUNT(*) as messages FROM messages;
"

# Verify app connectivity
# (Test with real user if possible)
```

---

## Post-Migration Tasks

### 1. Update Documentation

- [ ] Update API documentation with new endpoints
- [ ] Update architecture diagrams
- [ ] Document any breaking changes
- [ ] Update runbooks for troubleshooting

### 2. Clean Up

```sql
-- Remove old Baileys session data (after 30 days)
DELETE FROM whatsapp_connections
WHERE provider = 'baileys'
  AND updated_at < NOW() - INTERVAL '30 days';

-- Remove migration backups (after 60 days)
-- (Only if everything is working perfectly)
```

### 3. Monitor & Optimize

- [ ] Set up dashboards for key metrics
- [ ] Create alerts for anomaly detection
- [ ] Optimize database indexes based on query patterns
- [ ] Tune webhook processing performance

---

## Support & Troubleshooting

### Common Issues

**Issue:** Webhooks not being received
**Solution:** Check webhook URL is publicly accessible, verify Zernio dashboard shows "Active" status

**Issue:** Messages not sending
**Solution:** Verify `ZERNIO_API_KEY` is correct, check account has sufficient credits

**Issue:** Calendar events not appearing
**Solution:** Re-authorize Composio connection, check OAuth scopes

**Issue:** Database errors
**Solution:** Check migration completed successfully, verify indexes exist

### Log Locations

- API logs: `/var/log/zenda/api.log` (or cloud logging)
- Webhook errors: Check API logs for `webhook_error` keyword
- Database logs: PostgreSQL logs, check for `ERROR` level

### Emergency Contacts

- Backend Lead: [Contact info]
- DevOps: [Contact info]
- Zernio Support: support@zernio.com
- Composio Support: support@composio.dev

---

## Appendix

### A. Thread ID Format

**Format:** `zernio:{accountId}:{conversationId}`

**Examples:**
- `zernio:acct_1234567890:+1234567890` (WhatsApp conversation)
- `zernio:acct_1234567890:ig_9876543210` (Instagram DM)

**Parsing:**
```typescript
function parseThreadId(threadId: string) {
  const [prefix, accountId, ...conversationParts] = threadId.split(':')
  if (prefix !== 'zernio') {
    throw new Error('Invalid thread ID format')
  }
  return {
    accountId,
    conversationId: conversationParts.join(':')
  }
}
```

### B. Webhook Signature Verification

```typescript
import { crypto } from 'node:crypto'

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(rawBody).digest('base64')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}
```

### C. Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ZERNIO_API_KEY` | Yes | - | Zernio API key |
| `ZERNIO_WEBHOOK_SECRET` | Yes | - | Webhook signature secret |
| `ZERNIO_WEBHOOK_URL` | Yes | - | Webhook endpoint URL |
| `ZERNIO_API_BASE_URL` | No | `https://zernio.com/api` | API base URL |
| `COMPOSIO_API_KEY` | Yes | - | Composio API key |
| `COMPOSIO_BASE_URL` | No | `https://api.composio.dev` | API base URL |
| `ENABLE_ZERNIO_WHATSAPP` | No | `false` | Enable Zernio integration |
| `ENABLE_COMPOSIO_CALENDAR` | No | `false` | Enable Composio integration |

---

**Document Version:** 1.0
**Last Updated:** 2025-05-13
**Next Review:** After migration completion
