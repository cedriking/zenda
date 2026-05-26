import { useBridgeSync } from "@/hooks/use-bridge-sync";
import BaseLayout from "@/layouts/base-layout";
import { Outlet } from "@/utils/router";

export default function Root() {
  useBridgeSync();

  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
}
