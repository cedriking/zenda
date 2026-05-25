import { useEffect } from 'react'
import { useNavigate } from '@/utils/router'

interface ShortcutConfig {
  key: string
  meta?: boolean
  ctrl?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMeta = e.metaKey || false
      const isCtrl = e.ctrlKey || false

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.meta ? isMeta : !isMeta
        const ctrlMatch = shortcut.ctrl ? isCtrl : !isCtrl

        if (e.key === shortcut.key && metaMatch && ctrlMatch) {
          // Don't intercept if user is typing in an input/textarea
          const tag = (e.target as HTMLElement)?.tagName
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
            // Only allow Escape to pass through from inputs
            if (e.key !== 'Escape') continue
          }

          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts])
}

export function useDashboardShortcuts() {
  const navigate = useNavigate()

  const shortcuts: ShortcutConfig[] = [
    {
      key: '1',
      meta: true,
      action: () => navigate('/dashboard'),
      description: 'Go to Dashboard',
    },
    {
      key: '2',
      meta: true,
      action: () => navigate('/dashboard/conversations'),
      description: 'Go to Chats',
    },
    {
      key: '3',
      meta: true,
      action: () => navigate('/dashboard/appointments'),
      description: 'Go to Calendar',
    },
    {
      key: '4',
      meta: true,
      action: () => navigate('/dashboard/settings'),
      description: 'Go to Settings',
    },
    {
      key: '5',
      meta: true,
      action: () => navigate('/dashboard/analytics'),
      description: 'Go to Analytics',
    },
    {
      key: 'k',
      meta: true,
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[data-testid="global-search"]'
        )
        searchInput?.focus()
      },
      description: 'Focus search',
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open notification dropdown
        const closeBtn = document.querySelector<HTMLButtonElement>(
          'button[aria-expanded="true"]'
        )
        if (closeBtn) {
          closeBtn.click()
          return
        }
        // Blur any focused input
        const active = document.activeElement as HTMLElement
        if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') {
          active.blur()
        }
      },
      description: 'Close dropdown or blur input',
    },
  ]

  useKeyboardShortcuts(shortcuts)
  return shortcuts
}
