# Rollback Plan: Zernio & Composio Integration

## Overview

This document outlines the rollback procedures for reverting from Zernio/Composio integration back to the previous Baileys-based WhatsApp implementation.

**Critical Success Factor:** Speed of rollback execution
**Target Rollback Time:** < 30 minutes from decision to full restoration
**Data Loss Target:** Zero data loss (messages, conversations, appointments)

---

## Conditions for Rollback

### Critical Triggers (Roll Back Immediately)

1. **Data Integrity Issues**
   - Messages not being saved to database
   - Conversation threadIds becoming NULL or corrupted
   - Appointment calendar events not syncing
   - Data loss detected in any table

2. **Service Outage**
   - WhatsApp message send success rate < 95% for 10 minutes
   - API response time > 10s (p95) for 5 minutes
   - Webhook processing failure rate > 10% for 5 minutes
   - Complete inability to send/receive messages

3. **Security Breach**
   - Webhook signatures not verifying
   - Unauthorized API access detected
   - Data encryption failures
   - API key exposure

4. **Integration Failure**
   - Zernio API complete downtime > 15 minutes
   - Composio API complete downtime > 30 minutes
   - Both integrations failing simultaneously

### Warning Triggers (Monitor Closely, Prepare for Rollback)

1. **Performance Degradation**
   - Message send latency > 5s (p95) for 10 minutes
   - Webhook processing time > 2s (p95)
   - Database query time > 1s (p95)

2. **Elevated Error Rates**
   - Webhook failure rate 5-10% for 15 minutes
   - API error rate 2-5% for 15 minutes
   - Transient integration errors

3. **User Complaints**
   - > 5 users reporting message issues within 30 minutes
   - > 10 support tickets related to integrations in 1 hour
   - Negative feedback about calendar syncing

---

## Pre-Rollback Checklist

### 1. Verify Rollback Necessity

- [ ] Confirm issue cannot be resolved with hotfix
- [ ] Verify issue affects production (not just staging)
- [ ] Estimate impact of continuing vs. rolling back
- [ ] Get approval from engineering lead

### 2. Prepare Rollback Environment

- [ ] Identify previous stable version tag/commit
- [ ] Verify database backup is available and intact
- [ ] Prepare rollback script and verify syntax
- [ ] Notify team of impending rollback

### 3. Communication

- [ ] Create incident ticket (if not exists)
- [ ] Notify stakeholders (product, support, management)
- [ ] Prepare customer communication (if needed)
- [ ] Set status page to "Investigating"

---

## Rollback Procedure

### Step 1: Stop All Services (2 minutes)

**Objective:** Prevent new data corruption during rollback

```bash
# Stop API instances
kubectl scale deployment api --replicas=0

# Or if using Docker Compose
docker-compose stop api

# Or if using PM2
pm2 stop all

# Verify no API processes are running
ps aux | grep -E "(node|bun)" | grep api
```

**Verification:**
```bash
# Check API is down
curl -f https://api.zenda.bot/health || echo "API is down"
```

---

### Step 2: Database Reversion (10 minutes)

**Objective:** Restore database to pre-migration state

#### 2.1: Backup Current State

```bash
# Create emergency backup before rollback
pg_dump $DATABASE_URL > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
pg_restore --list emergency_backup_*.sql | head -20
```

#### 2.2: Restore from Backup

```bash
# Identify the backup file
BACKUP_FILE="backup_before_migration_20250513_100000.sql"

# Stop all connections to database
# (This depends on your setup - example for PostgreSQL)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();

# Restore database
pg_restore -d $DATABASE_URL --clean --if-exists $BACKUP_FILE

# Verify restoration
psql $DATABASE_URL -c "
  SELECT COUNT(*) as conversations FROM conversations;
  SELECT COUNT(*) as messages FROM messages;
  SELECT COUNT(*) as appointments FROM appointments;
  SELECT COUNT(*) as whatsapp_connections FROM whatsapp_connections;
"
```

#### 2.3: Verify Data Integrity

```sql
-- Check for NULL threadIds (should be none in old schema)
SELECT COUNT(*) as null_threads
FROM conversations
WHERE thread_id IS NULL;

-- Check whatsapp_connections provider
SELECT provider, COUNT(*) as count
FROM whatsapp_connections
GROUP BY provider;

-- Expected: All should be 'baileys' or NULL after rollback
```

#### 2.4: Reset Migration Changes (if needed)

If the backup restoration fails or is incomplete:

```sql
-- Drop new columns
ALTER TABLE whatsapp_connections
  DROP COLUMN IF EXISTS zernio_account_id,
  DROP COLUMN IF EXISTS zernio_conversation_id,
  DROP COLUMN IF EXISTS thread_id,
  DROP COLUMN IF EXISTS provider;

ALTER TABLE appointments
  DROP COLUMN IF EXISTS calendar_event_id,
  DROP COLUMN IF EXISTS calendar_provider;

-- Drop integrations table
DROP TABLE IF EXISTS integrations;

-- Drop enums
DROP TYPE IF EXISTS whatsapp_connection_status;
```

---

### Step 3: Code Reversion (10 minutes)

**Objective:** Revert API and app code to previous version

#### 3.1: Identify Previous Version

```bash
# Find last stable tag
git tag -l | grep -E "v[0-9]+\.[0-9]+\.[0-9]+" | sort -V | tail -5

# Or find commit before migration
git log --oneline | grep -i "migration\|zernio\|composio" | head -5

# Example output:
# abc1234 feat: add zernio integration
# def5678 feat: migrate from baileys to zernio
# ghi9012 fix: bug fix

# Use commit BEFORE migration (e.g., ghi9012)
```

#### 3.2: Revert API Code

```bash
cd /path/to/zenda/api

# Option 1: Checkout previous tag
git checkout tags/v1.2.3

# Option 2: Revert migration commit
git revert abc1234 --no-commit

# Option 3: Hard reset to previous commit (DANGEROUS)
git reset --hard ghi9012

# Rebuild API
npm install
npm run build

# Verify build
ls -la dist/
```

#### 3.3: Restore Dependencies

```bash
# Remove new dependencies
npm uninstall @zernio/chat-sdk-adapter
npm uninstall @composio/core @composio/vercel
npm uninstall ai @ai-sdk/anthropic

# Reinstall old dependencies
npm install

# Verify package.json doesn't contain new dependencies
grep -E "zernio|composio" package.json
# Should return nothing
```

#### 3.4: Revert App Code (if needed)

```bash
cd /path/to/zenda/app

# Reinstall Baileys if it was removed
npm install @whiskeysockets/baileys@7.0.0-rc.9

# Restore old code
git checkout tags/v1.2.3

# Rebuild app
npm run build
npm run package
```

---

### Step 4: Deploy Previous Version (5 minutes)

**Objective:** Deploy reverted code to production

#### 4.1: Deploy API

```bash
# Kubernetes
kubectl apply -f k8s/api-deployment-previous.yaml
kubectl rollout status deployment/api

# Docker Compose
docker-compose up -d api

# PM2
pm2 start dist/index.js --name zenda-api
```

#### 4.2: Deploy App (if needed)

```bash
# If app was already updated, distribute previous version
# This depends on your app distribution mechanism

# For Electron app, trigger auto-update
# Or notify users to download previous version
```

#### 4.3: Verify Deployment

```bash
# Health check
curl https://api.zenda.bot/health
# Expected: {"status":"ok","db":true}

# Test authentication
curl -X POST https://api.zenda.bot/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# Test WhatsApp endpoint (old Baileys-based)
curl -X POST https://api.zenda.bot/whatsapp/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+1234567890","message":"Test"}'
```

---

### Step 5: Data Validation (5 minutes)

**Objective:** Verify data integrity after rollback

#### 5.1: Check Conversation Data

```sql
-- Verify conversations exist
SELECT COUNT(*) as total_conversations FROM conversations;

-- Verify no NULL critical fields
SELECT COUNT(*) as null_customers
FROM conversations
WHERE customer_phone IS NULL;

-- Verify message data
SELECT COUNT(*) as total_messages FROM messages;
SELECT COUNT(*) as recent_messages
FROM messages
WHERE created_at > NOW() - INTERVAL '24 hours';
```

#### 5.2: Check WhatsApp Connections

```sql
-- Verify whatsapp_connections table
SELECT
  id,
  workspace_id,
  phone_number,
  status,
  created_at
FROM whatsapp_connections
ORDER BY created_at DESC
LIMIT 10;

-- Verify no zernio-specific columns
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'whatsapp_connections'
  AND column_name IN ('zernio_account_id', 'thread_id');

-- Expected: 0 rows
```

#### 5.3: Check Appointments

```sql
-- Verify appointments data
SELECT COUNT(*) as total_appointments FROM appointments;

-- Verify no calendar_event_id column
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name = 'calendar_event_id';

-- Expected: 0 rows
```

---

### Step 6: Service Verification (3 minutes)

**Objective:** Verify all services are working correctly

#### 6.1: Test Message Flow

```bash
# Send test message (if you have a test setup)
curl -X POST https://api.zenda.bot/test/message \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Rollback test message"
  }'

# Check message was saved
psql $DATABASE_URL -c "
  SELECT id, conversation_id, body, created_at
  FROM messages
  ORDER BY created_at DESC
  LIMIT 5
"
```

#### 6.2: Monitor Logs

```bash
# Check API logs for errors
tail -f /var/log/zenda/api.log | grep -i error

# Check for Baileys initialization
tail -f /var/log/zenda/api.log | grep -i baileys

# Expected: Baileys client initializing successfully
```

#### 6.3: Test Authentication

```bash
# Test login
curl -X POST https://api.zenda.bot/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Expected: JWT token returned
```

---

## Post-Rollback Actions

### Immediate Actions (First 30 minutes)

1. **Monitor Metrics**
   - API response time (< 2s target)
   - Message send success rate (> 99% target)
   - Database query performance
   - Error rates (< 1% target)

2. **Verify User Access**
   - Test with real user account
   - Verify message sending/receiving
   - Check appointment booking flow

3. **Update Status Page**
   - Set to "Monitoring"
   - Add incident summary
   - Estimate resolution time

### Short-Term Actions (First 2 hours)

1. **Root Cause Analysis**
   - Document what went wrong
   - Identify failure point(s)
   - Create prevention plan

2. **Team Debrief**
   - Hold post-mortem meeting
   - Discuss timeline and decisions
   - Identify improvement opportunities

3. **Customer Communication**
   - Send incident report to affected users
   - Apologize for disruption
   - Explain preventive measures

### Long-Term Actions (Within 1 week)

1. **Fix Underlying Issue**
   - Address root cause
   - Add better error handling
   - Improve monitoring

2. **Update Documentation**
   - Document lessons learned
   - Update runbooks
   - Improve rollback procedures

3. **Re-Migration Planning**
   - Schedule re-migration attempt
   - Add more testing
   - Implement gradual rollout

---

## Rollback Verification Checklist

- [ ] All API endpoints responding correctly
- [ ] Database queries returning expected results
- [ ] WhatsApp messages sending/receiving
- [ ] App connecting to API successfully
- [ ] No error spikes in logs
- [ ] Metrics back to normal levels
- [ ] User complaints resolved
- [ ] Status page updated

---

## Rollback Communication Templates

### Internal Team Notification

```
SUBJECT: ROLLBACK INITIATED - Zernio/Composio Integration

Team,

We are initiating an emergency rollback of the Zernio/Composio integration due to:
- [Specific reason: data loss / service outage / security issue]

Rollback started: [Timestamp]
Estimated completion: [Timestamp + 30 minutes]

Current status:
- API: Stopping
- Database: Backup complete, restoration starting
- App: [Status]

Next steps:
1. Complete database restoration
2. Revert code to previous version
3. Deploy previous version
4. Verify services

I will provide updates every 10 minutes.

[Your Name]
Engineering Lead
```

### Stakeholder Notification

```
SUBJECT: Incident Report - Integration Rollback

Hi Team,

We experienced an issue with the new Zernio/Composio integration and are performing an emergency rollback to the previous version.

Issue: [Brief description]
Impact: [Affected services/users]
Rollback started: [Timestamp]
Expected resolution: [Timestamp + 30 minutes]

We will provide a full incident report after rollback is complete.

[Your Name]
```

### Customer Communication (if needed)

```
SUBJECT: Temporary Service Disruption - Resolved

Dear Customers,

We experienced a temporary disruption with our messaging service earlier today. We have resolved the issue and service is now operating normally.

What happened:
- [Brief, non-technical explanation]

What we did:
- Rolled back to previous stable version
- Verified all services are working correctly

We apologize for any inconvenience this may have caused. We are taking steps to prevent this from happening again.

Thank you for your patience.

The Zenda Team
```

---

## Rollback Metrics

### Time Targets

| Step | Target Time | Actual Time |
|------|-------------|-------------|
| Stop Services | 2 min | ___ |
| Database Reversion | 10 min | ___ |
| Code Reversion | 10 min | ___ |
| Deploy Previous Version | 5 min | ___ |
| Data Validation | 5 min | ___ |
| Service Verification | 3 min | ___ |
| **Total** | **35 min** | ___ |

### Success Criteria

- [ ] Zero data loss (conversations, messages, appointments)
- [ ] All services operational
- [ ] API response time < 2s (p95)
- [ ] Message success rate > 99%
- [ ] No new errors in logs

---

## Troubleshooting Rollback Issues

### Issue: Database Restoration Fails

**Symptoms:**
- `pg_restore` command fails
- Tables missing after restoration
- Data inconsistencies

**Solutions:**
```bash
# Check backup file integrity
pg_restore --list backup_file.sql | head -20

# Try restoring to a test database first
createdb test_rollback
pg_restore -d test_rollback backup_file.sql

# If restoration fails, use alternative:
# 1. Manually drop new tables/columns
# 2. Manually recreate old schema
# 3. Import data from CSV backups
```

### Issue: Code Reversion Fails

**Symptoms:**
- Git commands fail
- Build errors after checkout
- Missing dependencies

**Solutions:**
```bash
# Force clean checkout
git clean -fd
git reset --hard HEAD
git checkout tags/v1.2.3

# If git history is corrupted, clone fresh
cd /tmp
git clone https://github.com/yourorg/zenda.git zenda-rollback
cd zenda-rollback
git checkout tags/v1.2.3

# Copy to production
rsync -av /tmp/zenda-rollback/ /path/to/zenda/
```

### Issue: Services Won't Start

**Symptoms:**
- API crashes on startup
- Port conflicts
- Database connection errors

**Solutions:**
```bash
# Check port conflicts
lsof -i :3000
kill -9 $(lsof -t -i:3000)

# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check environment variables
env | grep -E "DATABASE_URL|JWT_SECRET"

# Check logs
tail -f /var/log/zenda/api.log
```

### Issue: Data Inconsistencies After Rollback

**Symptoms:**
- Missing conversations
- NULL threadIds
- Orphaned messages

**Solutions:**
```sql
-- Find conversations without messages
SELECT c.id, c.customer_phone
FROM conversations c
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE m.id IS NULL;

-- Find messages without conversations
SELECT m.id, m.conversation_id
FROM messages m
LEFT JOIN conversations c ON m.conversation_id = c.id
WHERE c.id IS NULL;

-- If inconsistencies found, restore from CSV backup
\copy conversations FROM 'conversations_backup.csv' CSV HEADER
\copy messages FROM 'messages_backup.csv' CSV HEADER
```

---

## Prevention Measures

### Pre-Migration Testing

1. **Staging Environment**
   - Test migration in staging first
   - Run full test suite
   - Load test with production-like traffic

2. **Data Validation**
   - Create data integrity checks
   - Test rollback procedure in staging
   - Verify backup/restore process

3. **Gradual Rollout**
   - Use feature flags
   - Roll out to 1% of users first
   - Monitor metrics closely
   - Gradually increase rollout

### Monitoring Enhancements

1. **Real-Time Alerts**
   - Set up alerts for all rollback triggers
   - Create dashboard for key metrics
   - Implement anomaly detection

2. **Health Checks**
   - Add endpoint-specific health checks
   - Test integration health every minute
   - Alert on degradation

3. **Data Validation Jobs**
   - Run data integrity checks hourly
   - Monitor for NULL values in critical fields
   - Track message/conversation counts

### Documentation

1. **Runbooks**
   - Document common issues
   - Create troubleshooting guides
   - Update rollback procedures

2. **Knowledge Sharing**
   - Conduct post-mortem meetings
   - Document lessons learned
   - Train team on rollback procedures

---

## Appendix

### A. Rollback Command Reference

```bash
# Complete rollback script (all steps)
#!/bin/bash
set -e

echo "Starting rollback..."

# 1. Stop services
echo "Stopping services..."
kubectl scale deployment api --replicas=0

# 2. Backup current state
echo "Creating emergency backup..."
pg_dump $DATABASE_URL > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Restore database
echo "Restoring database..."
pg_restore -d $DATABASE_URL --clean --if-exists backup_before_migration_*.sql

# 4. Revert code
echo "Reverting code..."
cd /path/to/zenda/api
git checkout tags/v1.2.3
npm install
npm run build

# 5. Deploy
echo "Deploying..."
kubectl apply -f k8s/api-deployment.yaml
kubectl rollout status deployment/api

# 6. Verify
echo "Verifying..."
curl -f https://api.zenda.bot/health

echo "Rollback complete!"
```

### B. Database Schema Reference

**Pre-Migration Schema:**
```sql
-- whatsapp_connections table
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL,
  phone_number VARCHAR(20),
  session_data TEXT,
  last_connected_at TIMESTAMPTZ,
  last_disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- No integrations table
-- No calendar_event_id in appointments
```

**Post-Migration Schema:**
```sql
-- whatsapp_connections table (with new columns)
ALTER TABLE whatsapp_connections
  ADD COLUMN provider VARCHAR(20) DEFAULT 'baileys',
  ADD COLUMN zernio_account_id VARCHAR(100),
  ADD COLUMN zernio_conversation_id VARCHAR(100),
  ADD COLUMN thread_id VARCHAR(200);

-- integrations table (new)
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  credentials TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- appointments table (with new columns)
ALTER TABLE appointments
  ADD COLUMN calendar_event_id VARCHAR(200),
  ADD COLUMN calendar_provider VARCHAR(50);
```

### C. Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Engineering Lead | [Name] | [Phone/Slack] |
| DevOps Lead | [Name] | [Phone/Slack] |
| Database Admin | [Name] | [Phone/Slack] |
| Product Manager | [Name] | [Phone/Slack] |
| Zernio Support | support@zernio.com | +1-555-0100 |
| Composio Support | support@composio.dev | +1-555-0101 |

---

**Document Version:** 1.0
**Last Updated:** 2025-05-13
**Next Review:** After rollback drill or actual rollback
