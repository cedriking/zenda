"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

const CONSENT_KEY = "zenda_cookie_consent";

export function CookieConsent() {
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
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 p-4 shadow-lg backdrop-blur-sm md:p-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
        <p className="text-center text-slate-600 text-sm md:text-left">
          We use cookies to improve your experience and analyze site traffic. By
          continuing, you agree to our{" "}
          <Link className="text-primary hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 text-sm hover:bg-slate-50"
            onClick={decline}
            type="button"
          >
            Decline
          </button>
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-sm text-white hover:bg-slate-800"
            onClick={accept}
            type="button"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
