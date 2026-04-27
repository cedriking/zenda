import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Activity } from "react";
import { inDevelopment } from "@/constants";
import BaseLayout from "@/layouts/base-layout";

function Root() {
  return (
    <BaseLayout>
      <Outlet />
      <Activity mode={inDevelopment ? "visible" : "hidden"}>
        <TanStackRouterDevtools />
      </Activity>
    </BaseLayout>
  );
}

export const Route = createRootRoute({
  component: Root,
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem("accessToken");
    const isAuthRoute = location.pathname.startsWith("/auth");

    if (!token && !isAuthRoute) {
      throw redirect({ to: "/auth/login" });
    }
    if (token && isAuthRoute) {
      throw redirect({ to: "/dashboard" });
    }
  },
});
