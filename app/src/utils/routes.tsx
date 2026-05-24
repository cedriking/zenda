import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function RoutePending() {
  return (
    <div className="flex h-32 items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export const router = createRouter({
  routeTree,
  history: createMemoryHistory({
    initialEntries: ["/"],
  }),
  defaultPendingComponent: RoutePending,
  defaultPreload: "intent",
  defaultPreloadDelay: 50,
});
