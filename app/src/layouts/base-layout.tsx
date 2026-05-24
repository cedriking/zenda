import type React from "react";
import DragWindowRegion from "@/components/drag-window-region";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DragWindowRegion title="Zenda" />
      {children}
    </div>
  );
}
