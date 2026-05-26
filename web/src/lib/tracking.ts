"use client";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const UTM_STORAGE_KEY = "zenda_utm";
const REFERRAL_CODE_KEY = "zenda_referral_code";

type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/** Read UTM params from URL search params and persist to localStorage */
export function captureUtmParams(searchParams: URLSearchParams): UtmParams {
  const utm: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = searchParams.get(key);
    if (value) {
      utm[key] = value;
    }
  }

  // Also capture referral code from `ref` or `referral` param
  const refCode = searchParams.get("ref") || searchParams.get("referral_code");
  if (refCode) {
    localStorage.setItem(REFERRAL_CODE_KEY, refCode);
  }

  if (Object.keys(utm).length > 0) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
  }

  return utm;
}

/** Retrieve stored UTM params from localStorage */
export function getStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

/** Retrieve stored referral code */
export function getStoredReferralCode(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(REFERRAL_CODE_KEY);
}

/** Clear stored tracking data (called after attribution is consumed) */
export function clearTrackingData(): void {
  localStorage.removeItem(UTM_STORAGE_KEY);
  localStorage.removeItem(REFERRAL_CODE_KEY);
}
