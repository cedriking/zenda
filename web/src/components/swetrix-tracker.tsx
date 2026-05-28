"use client";

import Script from "next/script";

const SWETRIX_PID = "AC1SHDUu6HrE";
const SWETRIX_API_URL = "https://api.20u.net/log";

export function SwetrixTracker() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/swetrix@latest/dist/swetrix.js"
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
      <noscript>
        <img
          alt=""
          height="1"
          referrerPolicy="no-referrer-when-downgrade"
          src={`${SWETRIX_API_URL}/noscript?pid=${SWETRIX_PID}`}
          style={{ display: "none" }}
          width="1"
        />
      </noscript>
    </>
  );
}
