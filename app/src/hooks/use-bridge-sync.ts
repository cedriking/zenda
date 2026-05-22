import { useEffect, useRef } from 'react'

/**
 * Auto-connects the WhatsApp-to-API bridge when the app loads
 * and the user is authenticated. Runs once per session.
 *
 * The bridge connects regardless of onboarding status — the API-side
 * conversation engine routes messages based on server-side onboardingStep,
 * so even during onboarding, WhatsApp messages flow correctly.
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
