import {
  Calendar,
  CheckCircle,
  LogOut,
  RefreshCw,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";

interface CalendarInfo {
  email?: string;
  id: string;
  name: string;
  primary?: boolean;
}

interface CalendarSettingsProps {
  calendars?: CalendarInfo[];
  className?: string;
  isConnected?: boolean;
  isLoading?: boolean;
  isSyncing?: boolean;
  lastSyncedAt?: Date;
  onCalendarSelect?: (calendarId: string) => void;
  onDisconnect?: () => void;
  onSyncNow?: () => void;
  onToggleSync?: (enabled: boolean) => void;
  selectedCalendarId?: string;
  syncEnabled?: boolean;
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
  const [localSyncEnabled, setLocalSyncEnabled] = useState(syncEnabled);

  const handleToggleSync = (enabled: boolean) => {
    setLocalSyncEnabled(enabled);
    onToggleSync?.(enabled);
  };

  if (!isConnected) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No calendar connected
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <CheckCircle className="text-green-500" size={16} />
        <span className="font-medium text-gray-900 text-sm">
          {calendars.length > 0
            ? `${calendars.length} calendar${calendars.length > 1 ? "s" : ""} found`
            : "Calendar connected"}
        </span>
      </div>

      {/* Calendar Selection */}
      {calendars.length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 font-medium text-gray-700 text-sm">
            <Calendar size={14} />
            Select Calendar
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            onChange={(e) => onCalendarSelect?.(e.target.value)}
            value={selectedCalendarId ?? ""}
          >
            <option value="">Select a calendar...</option>
            {calendars.map((calendar) => (
              <option key={calendar.id} value={calendar.id}>
                {calendar.name}
                {calendar.primary && " (Primary)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sync Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-gray-500" size={14} />
            <span className="font-medium text-gray-700 text-sm">
              Sync Settings
            </span>
          </div>
          <button
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              localSyncEnabled ? "bg-blue-500" : "bg-gray-300"
            } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            disabled={isLoading}
            onClick={() => handleToggleSync(!localSyncEnabled)}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                localSyncEnabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {localSyncEnabled && lastSyncedAt && (
          <div className="pl-6 text-gray-500 text-xs">
            Last synced: {lastSyncedAt.toLocaleString()}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isLoading || isSyncing || !localSyncEnabled}
          onClick={onSyncNow}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            className={`mr-1.5 ${isSyncing ? "animate-spin" : ""}`}
            size={14}
          />
          {isSyncing ? "Syncing..." : "Sync Now"}
        </Button>

        <Button
          className="flex-1"
          disabled={isLoading}
          onClick={onDisconnect}
          size="sm"
          variant="destructive"
        >
          <LogOut className="mr-1.5" size={14} />
          Disconnect
        </Button>
      </div>
    </div>
  );
}
