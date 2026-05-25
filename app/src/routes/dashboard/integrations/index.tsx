import { createFileRoute } from "@tanstack/react-router";
import { Puzzle } from "lucide-react";

export const Route = createFileRoute("/dashboard/integrations/")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="font-bold text-2xl">Integrations</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Connect third-party services to extend your workspace.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-border border-dashed py-20">
        <Puzzle className="mb-4 text-muted-foreground/50" size={48} />
        <p className="font-medium text-muted-foreground">Coming soon</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Integration management will be available here.
        </p>
      </div>
    </div>
  );
}
