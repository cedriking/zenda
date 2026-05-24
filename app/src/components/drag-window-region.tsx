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
        if (active) {
          setPlatform(value);
        }
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
    <div className="draglayer flex h-9 w-full shrink-0 select-none items-center justify-between border-border/50 border-b bg-card">
      {isMacOS ? (
        <div className="flex-1 pl-20" />
      ) : (
        <div className="flex min-w-0 flex-1 items-center pl-3">
          {title && (
            <span className="font-semibold text-foreground/70 text-xs tracking-wide">
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
      <WindowButton
        hoverClass="hover:bg-muted/80"
        onClick={minimizeWindow}
        title="Minimize"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="1"
          viewBox="0 0 10 1"
          width="10"
        >
          <rect
            className="text-foreground/50"
            fill="currentColor"
            height="1"
            width="10"
          />
        </svg>
      </WindowButton>
      <WindowButton
        hoverClass="hover:bg-muted/80"
        onClick={maximizeWindow}
        title="Maximize"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="10"
          viewBox="0 0 10 10"
          width="10"
        >
          <rect
            className="text-foreground/50"
            fill="none"
            height="9"
            rx="1"
            stroke="currentColor"
            strokeWidth="1"
            width="9"
            x="0.5"
            y="0.5"
          />
        </svg>
      </WindowButton>
      <WindowButton
        hoverClass="hover:bg-red-500 hover:text-white"
        onClick={closeWindow}
        title="Close"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="10"
          viewBox="0 0 10 10"
          width="10"
        >
          <path
            className="text-foreground/50 group-hover:text-white"
            d="M1 1L9 9M9 1L1 9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.2"
          />
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
      aria-label={title}
      className={`flex h-full w-11 items-center justify-center transition-colors duration-150 ${hoverClass}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}
