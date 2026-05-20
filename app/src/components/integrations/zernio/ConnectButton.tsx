import { useState } from 'react'
import { Button } from '../../ui/button'
import { Loader2, ExternalLink, CheckCircle } from 'lucide-react'

interface ZernioConnectButtonProps {
  isConnected?: boolean
  isConnecting?: boolean
  onConnect?: () => void
  apiBaseUrl?: string
  className?: string
}

export function ZernioConnectButton({
  isConnected = false,
  isConnecting = false,
  onConnect,
  apiBaseUrl = 'https://api.zenda.bot',
  className,
}: ZernioConnectButtonProps) {
  const [isOpening, setIsOpening] = useState(false)

  const handleConnect = async () => {
    if (isConnected || isConnecting || isOpening) return

    setIsOpening(true)
    try {
      // Open Zernio API URL for OAuth/connection
      const connectUrl = `${apiBaseUrl}/integrations/zernio/auth`
      window.open(connectUrl, '_blank', 'width=800,height=600')

      onConnect?.()
    } catch (error) {
      console.error('Failed to open Zernio connection:', error)
    } finally {
      setTimeout(() => setIsOpening(false), 1000)
    }
  }

  if (isConnected) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <CheckCircle size={14} className="mr-1.5 text-green-500" />
        Connected
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
          <ExternalLink size={14} className="mr-1.5" />
          Connect Zernio
        </>
      )}
    </Button>
  )
}
