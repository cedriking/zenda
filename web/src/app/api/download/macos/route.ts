import { type NextRequest, NextResponse } from "next/server";

const GITHUB_REPO = "cedriking/zenda";
const FALLBACK_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://zenda.bot";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(_request: NextRequest) {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { headers, next: { revalidate: 300 } },
    );

    if (!res.ok) {
      return NextResponse.redirect(
        `${FALLBACK_BASE}/download?error=no-release`
      );
    }

    const release = await res.json();
    const assets: Array<{ name: string; browser_download_url: string }> =
      release.assets ?? [];

    // Find the DMG asset (e.g. Zenda-0.1.0-arm64.dmg or Zenda-0.1.0.dmg)
    const dmg = assets.find((a) => a.name.endsWith(".dmg"));

    if (!dmg) {
      return NextResponse.redirect(
        `${FALLBACK_BASE}/download?error=no-macos-artifact`
      );
    }

    return NextResponse.redirect(dmg.browser_download_url);
  } catch {
    return NextResponse.redirect(
      `${FALLBACK_BASE}/download?error=fetch-failed`
    );
  }
}
