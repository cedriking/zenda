import { useState } from 'react'
import { Calendar, CheckCircle, LogOut, RefreshCw, Settings } from 'lucide-react'
import { Button } from '../../ui/button'

interface CalendarInfo {
  id: string
  name: string
  email?: string
  primary?: boolean
}

interface CalendarSettingsProps {
  isConnected?: boolean
  calendars?: CalendarInfo[]
  selectedCalendarId?: string
  syncEnabled?: boolean
  lastSyncedAt?: Date
  isLoading?: boolean
  isSyncing?: boolean
  onCalendarSelect?: (calendarId: string) => void
  onToggleSync?: (enabled: boolean) => void
  onSyncNow?: () => void
  onDisconnect?: () => void
  className?: string
}

export function CalendarSettings({
  isConnected = false,
  calendars = [],
  selectedCalendarId,
  syncEnabled = true,
  lastSyncedAt,
  isLoading = false,
  isSyncing = false,
  onCalendarSelect,
  onToggleSync,
  onSyncNow,
  onDisconnect,
  className,
}: CalendarSettingsProps) {
  const [localSyncEnabled, setLocalSyncEnabled] = useState(syncEnabled)

  const handleToggleSync = (enabled: boolean) => {
    setLocalSyncEnabled(enabled)
    onToggleSync?.(enabled)
  }

  if (!isConnected) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No calendar connected
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <CheckCircle size={16} className="text-green-500" />
        <span className="text-sm font-medium text-gray-900">
          {calendars.length > 0 ? `${calendars.length} calendar${calendars.length > 1 ? 's' : ''} found` : 'Calendar connected'}
        </span>
      </div>

      {/* Calendar Selection */}
      {calendars.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <Calendar size={14} />
            Select Calendar
          </label>
          <select
            value={selectedCalendarId ?? ''}
            onChange={(e) => onCalendarSelect?.(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a calendar...</option>
            {calendars.map((calendar) => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.name}
                {calendar.primary && ' (Primary)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sync Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sync Settings</span>
          </div>
          <button
            onClick={() => handleToggleSync(!localSyncEnabled)}
            disabled={isLoading}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              localSyncEnabled ? 'bg-blue-500' : 'bg-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                localSyncEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {localSyncEnabled && lastSyncedAt && (
          <div className="text-xs text-gray-500 pl-6">
            Last synced: {lastSyncedAt.toLocaleString()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSyncNow}
          disabled={isLoading || isSyncing || !localSyncEnabled}
          className="flex-1"
        >
          <RefreshCw size={14} className={`mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={onDisconnect}
          disabled={isLoading}
          className="flex-1"
        >
          <LogOut size={14} className="mr-1.5" />
          Disconnect
        </Button>
      </div>
    </div>
  )
}
