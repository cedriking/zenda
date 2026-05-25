import { type NextRequest, NextResponse } from "next/server";

const GITHUB_REPO = "cedriking/zenda";
const FALLBACK_BASE = "https://zenda.bot";

export async function GET(_request: NextRequest) {
  try {
    // Fetch the latest release from GitHub API
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 300 }, // cache for 5 minutes
      }
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
