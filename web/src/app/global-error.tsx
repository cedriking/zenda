"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            padding: "2rem",
            textAlign: "center",
            backgroundColor: "#f8fafc",
            color: "#1e293b",
          }}
        >
          <div
            style={{
              maxWidth: "28rem",
              padding: "2.5rem",
              borderRadius: "1rem",
              backgroundColor: "#ffffff",
              boxShadow:
                "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
                color: "#0f172a",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: "#64748b",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              We encountered an unexpected error. Please try again or refresh
              the page.
            </p>
            <button
              onBlur={(e) =>
                (e.currentTarget.style.backgroundColor = "#10b981")
              }
              onClick={reset}
              onFocus={(e) =>
                (e.currentTarget.style.backgroundColor = "#059669")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#10b981")
              }
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#059669")
              }
              style={{
                padding: "0.625rem 1.5rem",
                background: "#10b981",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "background-color 0.15s",
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
