import { useEffect, useRef } from 'react'

/**
 * Auto-connects the WhatsApp-to-API bridge when the app loads
 * and the user is authenticated with onboarding complete.
 * Runs once per session.
 */
export function useBridgeSync() {
  const connected = useRef(false)

  useEffect(() => {
    if (connected.current) return

    const token = localStorage.getItem('accessToken')
    const workspaceRaw = localStorage.getItem('workspace')

    if (!token || !workspaceRaw) return

    try {
      const workspace = JSON.parse(workspaceRaw)
      if (!workspace?.id) return
      // Only connect bridge if onboarding is done
      if (workspace.onboardingStep && workspace.onboardingStep !== 'ready') return

      connected.current = true
      window.electron?.invoke?.('bridge:connect', {
        workspaceId: workspace.id,
        accessToken: token,
      })
    } catch {
      // Invalid workspace data
    }
  }, [])
}
