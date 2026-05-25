import { type NextRequest, NextResponse } from "next/server";

const FALLBACK_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://zenda.bot";

const S3_DOWNLOADS_PUBLIC_URL =
  process.env.S3_DOWNLOADS_PUBLIC_URL ?? "";

export async function GET(_request: NextRequest) {
  try {
    if (S3_DOWNLOADS_PUBLIC_URL) {
      const latestUrl = await findLatestArtifact(".exe");
      if (latestUrl) {
        return NextResponse.redirect(latestUrl);
      }
    }

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
  if (S3_DOWNLOADS_PUBLIC_URL) {
    try {
      const manifestUrl = `${S3_DOWNLOADS_PUBLIC_URL}/latest.json`;
      const res = await fetch(manifestUrl, {
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const manifest = await res.json();
        const artifact = manifest?.platforms?.windows;
        if (artifact?.url) {
          return artifact.url;
        }
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
