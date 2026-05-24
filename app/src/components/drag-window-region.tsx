import { type ReactNode, useEffect, useState } from "react";
import { getPlatform } from "@/actions/app";
import { closeWindow, maximizeWindow, minimizeWindow } from "@/actions/window";

interface DragWindowRegionProps {
  title?: ReactNode;
}

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  const [platform, setPlatform] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getPlatform()
      .then((value) => {
        if (active) setPlatform(value);
      })
      .catch((error) => {
        console.error("Failed to detect platform", error);
      });
    return () => {
      active = false;
    };
  }, []);

  const isMacOS = platform === "darwin";

  return (
    <div className="draglayer flex w-full h-9 items-center justify-between select-none shrink-0 bg-card border-b border-border/50">
      {isMacOS ? (
        <div className="flex-1 pl-20" />
      ) : (
        <div className="flex-1 flex items-center pl-3 min-w-0">
          {title && (
            <span className="text-xs font-semibold text-foreground/70 tracking-wide">
              {title}
            </span>
          )}
        </div>
      )}
      {!isMacOS && <WindowControls />}
    </div>
  );
}

function WindowControls() {
  return (
    <div className="flex h-full">
      <WindowButton onClick={minimizeWindow} title="Minimize" hoverClass="hover:bg-muted/80">
        <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
          <rect width="10" height="1" fill="currentColor" className="text-foreground/50" />
        </svg>
      </WindowButton>
      <WindowButton onClick={maximizeWindow} title="Maximize" hoverClass="hover:bg-muted/80">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1" className="text-foreground/50" fill="none" />
        </svg>
      </WindowButton>
      <WindowButton onClick={closeWindow} title="Close" hoverClass="hover:bg-red-500 hover:text-white">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-foreground/50 group-hover:text-white" />
        </svg>
      </WindowButton>
    </div>
  );
}

function WindowButton({
  onClick,
  title,
  hoverClass,
  children,
}: {
  onClick: () => void;
  title: string;
  hoverClass: string;
  children: ReactNode;
}) {
  return (
    <button
      className={`flex items-center justify-center w-11 h-full transition-colors duration-150 ${hoverClass}`}
      onClick={onClick}
      title={title}
      type="button"
      aria-label={title}
    >
      {children}
    </button>
  );
}
