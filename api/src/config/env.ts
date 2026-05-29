function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const DATABASE_URL = requireEnv("DATABASE_URL");
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = requireEnv("JWT_REFRESH_SECRET");
export const API_PORT = process.env.API_PORT ?? "3001";
export const ZAI_API_KEY = process.env.ZAI_API_KEY ?? "";
export const ZAI_BASE_URL =
  process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/coding/paas/v4";
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
export const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";
export const CORS_ORIGINS =
  process.env.CORS_ORIGINS ??
  "http://localhost:5173,http://localhost:3000,https://zenda.bot,https://api.zenda.bot";
export const UPDATE_BASE_URL =
  process.env.UPDATE_BASE_URL ?? "https://zenda.bot/updates";
export const NODE_ENV = process.env.NODE_ENV ?? "development";

// Local Whisper STT server (faster-whisper)
export const WHISPER_LOCAL_URL =
  process.env.WHISPER_LOCAL_URL ?? "http://localhost:8001";

// Google Calendar Integration
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
export const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ??
  "https://api.zenda.bot/integrations/google/callback";
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY ?? "";

// Queue limits
export const MAX_QUEUE_DEPTH_PER_WORKSPACE = Number.parseInt(
  process.env.MAX_QUEUE_DEPTH_PER_WORKSPACE ?? "1000",
  10
);

/**
 * Validate required environment variables for production.
 * Call this at startup to fail fast with clear error messages.
 */
export function validateProductionEnv(): void {
  if (NODE_ENV !== "production") {
    return;
  }

  const required = [
    "DATABASE_URL",
    "JWT_SECRET",
    "STRIPE_WEBHOOK_SECRET",
    "ADMIN_SECRET",
    "JWT_REFRESH_SECRET",
    "REDIS_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "ENCRYPTION_KEY",
  ];

  const missing = required.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }

  // Billing is critical for paying customers — require Stripe in production
  if (!STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is required in production — billing depends on it"
    );
  }

  if (!process.env.CORS_ORIGINS) {
    console.warn("[env] CORS_ORIGINS not set — using development defaults");
  }
}

/** Returns true if the configured Stripe key is a live key. */
export function isStripeLiveMode(): boolean {
  return STRIPE_SECRET_KEY.startsWith("sk_live_");
}
