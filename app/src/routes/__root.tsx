import { Outlet } from '@/utils/router'
import { useBridgeSync } from '@/hooks/use-bridge-sync'
import BaseLayout from '@/layouts/base-layout'

export default function Root() {
  useBridgeSync()

  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  )
}
