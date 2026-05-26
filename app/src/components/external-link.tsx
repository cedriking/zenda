import type { ComponentProps } from "react";
import { openExternalLink } from "@/actions/shell";
import { cn } from "@/utils/tailwind";

type ExternalLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href?: string;
};

export default function ExternalLink({
  children,
  className,
  href,
  onClick,
  ...props
}: ExternalLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Run analytics/tracking handler if provided
    onClick?.(e);
    if (!href || e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    openExternalLink(href);
  };

  return (
    <a
      aria-label={typeof children === "string" ? children : undefined}
      className={cn("cursor-pointer underline", className)}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      {...props}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
