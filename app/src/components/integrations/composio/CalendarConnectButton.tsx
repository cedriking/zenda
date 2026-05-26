import { useState } from 'react'
import { Button } from '../../ui/button'
import { Loader2, Calendar, ExternalLink, CheckCircle } from 'lucide-react'
import { openExternalLink } from '@/actions/shell'

interface CalendarConnectButtonProps {
  isConnected?: boolean
  isConnecting?: boolean
  onConnect?: () => void
  apiBaseUrl?: string
  provider?: 'google' | 'outlook'
  className?: string
}

export function CalendarConnectButton({
  isConnected = false,
  isConnecting = false,
  onConnect,
  apiBaseUrl = 'https://api.zenda.bot',
  provider = 'google',
  className,
}: CalendarConnectButtonProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleConnect = async () => {
    if (isConnected || isConnecting || isOpening) return

    setIsOpening(true)
    try {
      // Open Composio OAuth flow for Google Calendar
      const connectUrl = `${apiBaseUrl}/integrations/composio/oauth/calendar?provider=${provider}`
      openExternalLink(connectUrl)

      onConnect?.()
    } catch (error) {
      console.error('Failed to open calendar connection:', error)
    } finally {
      setTimeout(() => setIsOpening(false), 1000)
    }
  }

  if (isConnected) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <CheckCircle size={14} className="mr-1.5 text-green-500" />
        Calendar Connected
      </Button>
    )
  }

  return (
    <Button
      variant={isConnecting ? 'secondary' : 'default'}
      size="sm"
      onClick={handleConnect}
      disabled={isConnecting || isOpening}
      className={className}
    >
      {isConnecting || isOpening ? (
        <>
          <Loader2 size={14} className="mr-1.5 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Calendar size={14} className="mr-1.5" />
          <ExternalLink size={14} className="mr-1" />
          Connect {provider === 'google' ? 'Google' : 'Outlook'} Calendar
        </>
      )}
    </Button>
  )
}
