import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { useBridgeSync } from "@/hooks/use-bridge-sync";
import BaseLayout from "@/layouts/base-layout";
import { getPostAuthRoute, isTokenValid } from "@/stores/auth";

function Root() {
  useBridgeSync();

  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
}

export const Route = createRootRoute({
  component: Root,
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem("accessToken");
    const isAuthRoute = location.pathname.startsWith("/auth");
    const isConnectWhatsApp = location.pathname === "/auth/connect-whatsapp";
    const hasValidToken = isTokenValid(token);

    if (!(hasValidToken || isAuthRoute)) {
      throw redirect({ to: "/auth/login" });
    }
    if (hasValidToken && isAuthRoute && !isConnectWhatsApp) {
      throw redirect({ to: getPostAuthRoute() });
    }
  },
});
