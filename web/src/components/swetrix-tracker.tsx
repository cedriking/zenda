"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const SWETRIX_PID = "AC1SHDUu6HrE";
const SWETRIX_API_URL = "https://api.20u.net/log";
const CONSENT_KEY = "zenda_cookie_consent";

function hasConsent(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

export function SwetrixTracker() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasConsent());

    const handler = () => setConsented(hasConsent());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!consented) {
    return null;
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/swetrix@10/dist/swetrix.js"
        strategy="afterInteractive"
      />
      <Script id="swetrix-init" strategy="afterInteractive">
        {`
          document.addEventListener('DOMContentLoaded', function() {
            swetrix.init('${SWETRIX_PID}', {
              apiURL: '${SWETRIX_API_URL}',
            })
            swetrix.trackViews()
          })
        `}
      </Script>
    </>
  );
}
