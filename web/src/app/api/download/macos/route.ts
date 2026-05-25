import { type NextRequest, NextResponse } from "next/server";

const FALLBACK_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://zenda.bot";

// R2/S3 configuration for downloads
const S3_DOWNLOADS_ENDPOINT =
  process.env.S3_DOWNLOADS_ENDPOINT ?? "";
const S3_DOWNLOADS_BUCKET =
  process.env.S3_DOWNLOADS_BUCKET ?? "zenda-downloads";
const S3_DOWNLOADS_ACCESS_KEY_ID =
  process.env.S3_DOWNLOADS_ACCESS_KEY_ID ?? "";
const S3_DOWNLOADS_SECRET_ACCESS_KEY =
  process.env.S3_DOWNLOADS_SECRET_ACCESS_KEY ?? "";
const S3_DOWNLOADS_PUBLIC_URL =
  process.env.S3_DOWNLOADS_PUBLIC_URL ?? "";

export async function GET(_request: NextRequest) {
  try {
    // Strategy 1: If a public R2 URL is configured, redirect directly.
    // The files are publicly readable so we just need the URL pattern.
    if (S3_DOWNLOADS_PUBLIC_URL) {
      // List objects to find the latest .dmg (simple prefix scan)
      // For public buckets, we can redirect to a known path pattern
      // or use the S3 API to find the latest.
      const latestUrl = await findLatestArtifact(".dmg");
      if (latestUrl) {
        return NextResponse.redirect(latestUrl);
      }
    }

    // Strategy 2: Use S3 API to generate a presigned URL
    if (S3_DOWNLOADS_ENDPOINT && S3_DOWNLOADS_ACCESS_KEY_ID) {
      const presignedUrl = await findLatestArtifact(".dmg");
      if (presignedUrl) {
        return NextResponse.redirect(presignedUrl);
      }
    }

    // No download source configured
    return NextResponse.redirect(
      `${FALLBACK_BASE}/download?error=no-release`
    );
  } catch {
    return NextResponse.redirect(
      `${FALLBACK_BASE}/download?error=fetch-failed`
    );
  }
}

async function findLatestArtifact(
  extension: string
): Promise<string | null> {
  // If we have a public URL, try listing objects via S3 API
  // For Cloudflare R2 public buckets, objects are accessible at:
  // {publicUrl}/{objectKey}

  // For now, use a simple manifest approach:
  // The CI/CD publishes a latest.json alongside the artifacts.
  if (S3_DOWNLOADS_PUBLIC_URL) {
    try {
      const manifestUrl = `${S3_DOWNLOADS_PUBLIC_URL}/latest.json`;
      const res = await fetch(manifestUrl, {
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const manifest = await res.json();
        const artifact = manifest?.platforms?.macos;
        if (artifact?.url) {
          return artifact.url;
        }
        // Fallback: construct URL from filename
        if (artifact?.filename) {
          return `${S3_DOWNLOADS_PUBLIC_URL}/${artifact.filename}`;
        }
      }
    } catch {
      // manifest not found, fall through
    }
  }

  return null;
}
