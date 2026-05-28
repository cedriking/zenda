import { Calendar, CheckCircle, LogOut, RefreshCw } from "lucide-react";
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
  selectedCalendarId?: string;
}

export function CalendarSettings({
  isConnected = false,
  calendars = [],
  selectedCalendarId,
  lastSyncedAt,
  isLoading = false,
  isSyncing = false,
  onCalendarSelect,
  onSyncNow,
  onDisconnect,
  className,
}: CalendarSettingsProps) {
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
          <label
            className="flex items-center gap-1.5 font-medium text-gray-700 text-sm"
            htmlFor="calendar-select"
          >
            <Calendar size={14} />
            Select Calendar
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            id="calendar-select"
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

      {/* Last sync info */}
      {lastSyncedAt && (
        <div className="text-gray-500 text-xs">
          Last synced: {lastSyncedAt.toLocaleString()}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isLoading || isSyncing}
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
