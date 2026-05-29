"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GOOGLE_ADS_SIGNUP_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL;

const CONSENT_KEY = "zenda_cookie_consent";

function hasConsent(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

export function GoogleAnalytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(hasConsent());

    const handler = () => setConsented(hasConsent());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!(consented && GA_MEASUREMENT_ID)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: true
          });
          ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
        `}
      </Script>
    </>
  );
}

function trackEvent(action: string, params?: Record<string, string>) {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID || !hasConsent()) {
    return;
  }
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (w.gtag) {
    w.gtag("event", action, params);
  }
}

export function trackSignup(method = "email") {
  trackEvent("sign_up", { method });
}

/** Fire Google Ads conversion for signup completion */
export function trackAdsConversion() {
  if (
    typeof window === "undefined" ||
    !GOOGLE_ADS_ID ||
    !GOOGLE_ADS_SIGNUP_LABEL ||
    !hasConsent()
  ) {
    return;
  }
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (w.gtag) {
    w.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_SIGNUP_LABEL}`,
    });
  }
}
