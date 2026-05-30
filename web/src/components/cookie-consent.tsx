"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "zenda_cookie_consent";

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if no choice has been recorded
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event("storage"));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    window.dispatchEvent(new Event("storage"));
    setVisible(false);
  }

  return (
    <div
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur-sm transition-transform duration-300 data-[hidden=true]:translate-y-full md:p-6"
      data-hidden={!visible}
      hidden={!visible}
      role="dialog"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
        <p className="text-center text-muted-foreground text-sm md:text-left">
          {t.rich("message", {
            privacy: (chunks: React.ReactNode) => (
              <Link
                className="text-primary hover:underline"
                href="/legal/privacy"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            className="rounded-lg border border-border px-5 py-3 font-medium text-muted-foreground text-sm hover:bg-accent"
            onClick={decline}
            type="button"
          >
            {t("decline")}
          </button>
          <button
            className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground text-sm hover:bg-primary/90"
            onClick={accept}
            type="button"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
