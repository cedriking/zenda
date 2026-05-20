# Integration Components

React components for Zernio and Composio integrations in the Zenda desktop app.

## Structure

```
integrations/
├── zernio/
│   ├── ConnectButton.tsx         # Button to initiate Zernio connection
│   ├── ConnectionStatus.tsx      # Display Zernio account info and disconnect
│   └── index.ts
├── composio/
│   ├── CalendarConnectButton.tsx # Button to connect Google Calendar via Composio
│   ├── CalendarSettings.tsx      # Calendar selection and sync settings
│   └── index.ts
└── index.ts
```

## Zernio Components

### ZernioConnectButton

Button component to initiate Zernio OAuth/connection flow.

**Props:**
- `isConnected?: boolean` - Current connection status
- `isConnecting?: boolean` - Whether connection is in progress
- `onConnect?: () => void` - Callback when connection is initiated
- `apiBaseUrl?: string` - Base URL for Zernio API (default: 'https://api.zenda.bot')
- `className?: string` - Additional CSS classes

**States:**
- Disconnected: Shows "Connect Zernio" button
- Connecting: Shows loading spinner with "Connecting..."
- Connected: Shows disabled "Connected" button with green checkmark

**Example:**
```tsx
<ZernioConnectButton
  isConnected={zernioConnected}
  isConnecting={isConnecting}
  onConnect={() => console.log('Connection initiated')}
/>
```

### ZernioConnectionStatus

Display component showing Zernio account information with disconnect functionality.

**Props:**
- `isConnected?: boolean` - Current connection status
- `phoneNumber?: string` - Connected phone number
- `accountInfo?: { name?: string; email?: string }` - Account details
- `onDisconnect?: () => void` - Callback when disconnect is clicked
- `isLoading?: boolean` - Whether disconnect action is in progress
- `className?: string` - Additional CSS classes

**Features:**
- Shows connection status badge with green checkmark
- Displays account name, phone number, and email
- Disconnect button with loading state

**Example:**
```tsx
<ZernioConnectionStatus
  isConnected={zernioConnected}
  phoneNumber="+1234567890"
  accountInfo={{
    name: "John Doe",
    email: "john@example.com"
  }}
  onDisconnect={handleDisconnect}
  isLoading={isDisconnecting}
/>
```

## Composio Components

### CalendarConnectButton

Button component to connect Google/Outlook Calendar via Composio OAuth.

**Props:**
- `isConnected?: boolean` - Current connection status
- `isConnecting?: boolean` - Whether connection is in progress
- `onConnect?: () => void` - Callback when connection is initiated
- `apiBaseUrl?: string` - Base URL for Composio API (default: 'https://api.zenda.bot')
- `provider?: 'google' | 'outlook'` - Calendar provider (default: 'google')
- `className?: string` - Additional CSS classes

**States:**
- Disconnected: Shows "Connect Google/Outlook Calendar" button
- Connecting: Shows loading spinner with "Connecting..."
- Connected: Shows disabled "Calendar Connected" button with green checkmark

**Example:**
```tsx
<CalendarConnectButton
  isConnected={calendarConnected}
  isConnecting={isConnecting}
  provider="google"
  onConnect={() => console.log('Connection initiated')}
/>
```

### CalendarSettings

Comprehensive settings panel for calendar integration with selection and sync controls.

**Props:**
- `isConnected?: boolean` - Current connection status
- `calendars?: CalendarInfo[]` - List of available calendars
- `selectedCalendarId?: string` - Currently selected calendar ID
- `syncEnabled?: boolean` - Whether sync is enabled
- `lastSyncedAt?: Date` - Last sync timestamp
- `isLoading?: boolean` - Whether operations are in progress
- `isSyncing?: boolean` - Whether sync is in progress
- `onCalendarSelect?: (calendarId: string) => void` - Callback when calendar is selected
- `onToggleSync?: (enabled: boolean) => void` - Callback when sync is toggled
- `onSyncNow?: () => void` - Callback when manual sync is triggered
- `onDisconnect?: () => void` - Callback when disconnect is clicked
- `className?: string` - Additional CSS classes

**Features:**
- Shows connection status with calendar count
- Dropdown to select from available calendars
- Toggle switch for sync enable/disable
- "Sync Now" button with loading state
- Disconnect button
- Last sync timestamp display

**Example:**
```tsx
<CalendarSettings
  isConnected={calendarConnected}
  calendars={[
    { id: '1', name: 'Personal', primary: true },
    { id: '2', name: 'Work' }
  ]}
  selectedCalendarId="1"
  syncEnabled={true}
  lastSyncedAt={new Date()}
  onCalendarSelect={(id) => setSelectedCalendar(id)}
  onToggleSync={(enabled) => setSyncEnabled(enabled)}
  onSyncNow={handleSync}
  onDisconnect={handleDisconnect}
/>
```

## Usage

Import components from the integrations index:

```tsx
import {
  ZernioConnectButton,
  ZernioConnectionStatus,
  CalendarConnectButton,
  CalendarSettings
} from '@/components/integrations'
```

Or import from specific integration:

```tsx
import { ZernioConnectButton } from '@/components/integrations/zernio'
import { CalendarSettings } from '@/components/integrations/composio'
```

## Design Patterns

All components follow these project patterns:
- **Tailwind CSS** for styling
- **Shadcn UI** Button component
- **Lucide React** icons
- **TypeScript** with full type safety
- **Controlled components** with parent state management
- **Loading states** for async operations
- **Accessibility** with proper ARIA labels

## Integration with API

Components use `apiBaseUrl` prop to construct OAuth URLs:
- Zernio: `{apiBaseUrl}/integrations/zernio/auth`
- Composio: `{apiBaseUrl}/integrations/composio/oauth/calendar?provider={provider}`

OAuth flow opens in new popup window (800x600) for user authentication.
