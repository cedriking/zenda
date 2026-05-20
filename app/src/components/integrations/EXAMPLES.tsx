/**
 * Example usage of Zernio and Composio integration components
 *
 * This file demonstrates how to use the integration components in your pages.
 */

import { useState, useEffect } from 'react'
import { apiFetch } from '../../services/api-client'
import {
  ZernioConnectButton,
  ZernioConnectionStatus,
  CalendarConnectButton,
  CalendarSettings,
} from '.'

// ============================================
// ZERNIO INTEGRATION EXAMPLE
// ============================================

export function ZernioIntegrationExample() {
  const [zernioConnected, setZernioConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [zernioAccount, setZernioAccount] = useState<{
    phoneNumber?: string
    name?: string
    email?: string
  }>({})

  // Check connection status on mount
  useEffect(() => {
    checkZernioStatus()
  }, [])

  const checkZernioStatus = async () => {
    try {
      const status = await apiFetch<{ connected: boolean; account?: typeof zernioAccount }>(
        '/integrations/zernio/status'
      )
      setZernioConnected(status.connected)
      setZernioAccount(status.account ?? {})
    } catch (error) {
      console.error('Failed to check Zernio status:', error)
    }
  }

  const handleConnect = () => {
    setIsConnecting(true)
    // Poll for connection status
    const pollInterval = setInterval(async () => {
      try {
        const status = await apiFetch<{ connected: boolean; account?: typeof zernioAccount }>(
          '/integrations/zernio/status'
        )
        if (status.connected) {
          setZernioConnected(true)
          setZernioAccount(status.account ?? {})
          setIsConnecting(false)
          clearInterval(pollInterval)
        }
      } catch {
        // Keep polling
      }
    }, 2000)

    // Stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval)
      setIsConnecting(false)
    }, 120000)
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await apiFetch('/integrations/zernio/disconnect', { method: 'POST' })
      setZernioConnected(false)
      setZernioAccount({})
    } catch (error) {
      console.error('Failed to disconnect Zernio:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Zernio Integration</h3>
        <ZernioConnectButton
          isConnected={zernioConnected}
          isConnecting={isConnecting}
          onConnect={handleConnect}
        />
      </div>

      {zernioConnected && (
        <ZernioConnectionStatus
          isConnected={zernioConnected}
          phoneNumber={zernioAccount.phoneNumber}
          accountInfo={{
            name: zernioAccount.name,
            email: zernioAccount.email,
          }}
          onDisconnect={handleDisconnect}
          isLoading={isDisconnecting}
        />
      )}
    </div>
  )
}

// ============================================
// COMPOSIO CALENDAR INTEGRATION EXAMPLE
// ============================================

interface Calendar {
  id: string
  name: string
  email?: string
  primary?: boolean
}

export function ComposioCalendarExample() {
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>()
  const [syncEnabled, setSyncEnabled] = useState(true)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>()

  useEffect(() => {
    checkCalendarStatus()
  }, [])

  const checkCalendarStatus = async () => {
    try {
      const status = await apiFetch<{
        connected: boolean
        calendars?: Calendar[]
        selectedCalendarId?: string
        syncEnabled?: boolean
        lastSyncedAt?: string
      }>('/integrations/composio/calendar/status')

      setCalendarConnected(status.connected)
      setCalendars(status.calendars ?? [])
      setSelectedCalendarId(status.selectedCalendarId)
      setSyncEnabled(status.syncEnabled ?? true)
      setLastSyncedAt(status.lastSyncedAt ? new Date(status.lastSyncedAt) : undefined)
    } catch (error) {
      console.error('Failed to check calendar status:', error)
    }
  }

  const handleConnect = () => {
    setIsConnecting(true)
    // Poll for connection status
    const pollInterval = setInterval(async () => {
      try {
        const status = await apiFetch<{ connected: boolean; calendars?: Calendar[] }>(
          '/integrations/composio/calendar/status'
        )
        if (status.connected) {
          setCalendarConnected(true)
          setCalendars(status.calendars ?? [])
          setIsConnecting(false)
          clearInterval(pollInterval)
        }
      } catch {
        // Keep polling
      }
    }, 2000)

    setTimeout(() => {
      clearInterval(pollInterval)
      setIsConnecting(false)
    }, 120000)
  }

  const handleCalendarSelect = async (calendarId: string) => {
    setSelectedCalendarId(calendarId)
    try {
      await apiFetch('/integrations/composio/calendar/select', {
        method: 'POST',
        body: { calendarId },
      })
    } catch (error) {
      console.error('Failed to select calendar:', error)
    }
  }

  const handleToggleSync = async (enabled: boolean) => {
    setSyncEnabled(enabled)
    try {
      await apiFetch('/integrations/composio/calendar/sync', {
        method: 'POST',
        body: { enabled },
      })
    } catch (error) {
      console.error('Failed to toggle sync:', error)
    }
  }

  const handleSyncNow = async () => {
    setIsSyncing(true)
    try {
      await apiFetch('/integrations/composio/calendar/sync/now', { method: 'POST' })
      setLastSyncedAt(new Date())
    } catch (error) {
      console.error('Failed to sync calendar:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      await apiFetch('/integrations/composio/calendar/disconnect', { method: 'POST' })
      setCalendarConnected(false)
      setCalendars([])
      setSelectedCalendarId(undefined)
    } catch (error) {
      console.error('Failed to disconnect calendar:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Calendar Integration</h3>
        <CalendarConnectButton
          isConnected={calendarConnected}
          isConnecting={isConnecting}
          provider="google"
          onConnect={handleConnect}
        />
      </div>

      {calendarConnected && (
        <CalendarSettings
          isConnected={calendarConnected}
          calendars={calendars}
          selectedCalendarId={selectedCalendarId}
          syncEnabled={syncEnabled}
          lastSyncedAt={lastSyncedAt}
          isSyncing={isSyncing}
          onCalendarSelect={handleCalendarSelect}
          onToggleSync={handleToggleSync}
          onSyncNow={handleSyncNow}
          onDisconnect={handleDisconnect}
          isLoading={isDisconnecting}
        />
      )}
    </div>
  )
}

// ============================================
// COMBINED INTEGRATIONS PAGE EXAMPLE
// ============================================

export function IntegrationsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Integrations</h1>
        <p className="text-gray-600">Manage your third-party service connections</p>
      </div>

      <ZernioIntegrationExample />

      <hr className="my-6" />

      <ComposioCalendarExample />
    </div>
  )
}
