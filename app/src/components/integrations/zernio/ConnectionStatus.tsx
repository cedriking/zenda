import { Phone, LogOut, CheckCircle } from 'lucide-react'
import { Button } from '../../ui/button'

interface ZernioConnectionStatusProps {
  isConnected?: boolean
  phoneNumber?: string
  accountInfo?: {
    name?: string
    email?: string
  }
  onDisconnect?: () => void
  isLoading?: boolean
  className?: string
}

export function ZernioConnectionStatus({
  isConnected = false,
  phoneNumber,
  accountInfo,
  onDisconnect,
  isLoading = false,
  className,
}: ZernioConnectionStatusProps) {
  if (!isConnected) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        Not connected to Zernio
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Connection Status Badge */}
      <div className="flex items-center gap-2">
        <CheckCircle size={16} className="text-green-500" />
        <span className="text-sm font-medium text-gray-900">Connected to Zernio</span>
      </div>

      {/* Account Info */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
        {accountInfo?.name && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Account:</span>
            <span className="font-medium text-gray-900">{accountInfo.name}</span>
          </div>
        )}

        {phoneNumber && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1.5">
              <Phone size={14} />
              Phone:
            </span>
            <span className="font-mono text-gray-900">{phoneNumber}</span>
          </div>
        )}

        {accountInfo?.email && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Email:</span>
            <span className="text-gray-900">{accountInfo.email}</span>
          </div>
        )}
      </div>

      {/* Disconnect Button */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onDisconnect}
        disabled={isLoading}
        className="w-full"
      >
        <LogOut size={14} className="mr-1.5" />
        {isLoading ? 'Disconnecting...' : 'Disconnect'}
      </Button>
    </div>
  )
}
