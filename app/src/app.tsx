import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useTranslation } from "react-i18next";
import { updateAppLanguage } from "./actions/language";
import { syncWithLocalTheme } from "./actions/theme";
import ErrorBoundary from "./components/error-boundary";
import { Router } from "./utils/router";
import { authGuard, indexGuard, routes } from "./utils/routes";
import "./localization/i18n";

function SplashScreenHider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const splash = document.getElementById("splash");
    if (splash) {
      splash.classList.add("fade-out");
      splash.addEventListener("transitionend", () => splash.remove());
      setTimeout(() => splash.remove(), 500);
    }
  }, []);
  return <>{children}</>;
}

function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

function RouteErrorBoundaries({ children }: { children: React.ReactNode }) {
  return <DashboardErrorBoundary>{children}</DashboardErrorBoundary>;
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    syncWithLocalTheme();
    updateAppLanguage(i18n);
  }, [i18n]);

  return (
    <SplashScreenHider>
      <RouteErrorBoundaries>
        <Router
          guards={[{ check: authGuard }, { check: indexGuard }]}
          routes={routes}
        />
      </RouteErrorBoundaries>
    </SplashScreenHider>
  );
}

const container = document.getElementById("app");
if (!container) {
  throw new Error('Root element with id "app" not found');
}
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
