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
      { headers, next: { revalidate: 300 } }
    );

    if (!res.ok) {
      return NextResponse.redirect(
        `${FALLBACK_BASE}/download?error=no-release`
      );
    }

    const release = await res.json();
    const assets: Array<{ id: number; name: string }> = release.assets ?? [];

    // Find the Windows installer (.exe from Squirrel)
    const installer = assets.find(
      (a) => a.name.endsWith(".exe") || a.name === "ZendaSetup.exe"
    );

    if (!installer) {
      return NextResponse.redirect(
        `${FALLBACK_BASE}/download?error=no-windows-artifact`
      );
    }

    // For private repos, resolve a temporary download URL via the Assets API.
    // The browser_download_url requires auth; the Assets API with octet-stream
    // returns a 302 to a time-limited S3 URL that works without auth.
    if (GITHUB_TOKEN) {
      const assetRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/assets/${installer.id}`,
        {
          headers: {
            Accept: "application/octet-stream",
            Authorization: `Bearer ${GITHUB_TOKEN}`,
          },
          redirect: "manual",
        }
      );
      const location = assetRes.headers.get("location");
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    // Public repo fallback — redirect directly
    const publicUrl = `https://github.com/${GITHUB_REPO}/releases/download/${release.tag_name}/${installer.name}`;
    return NextResponse.redirect(publicUrl);
  } catch {
    return NextResponse.redirect(
      `${FALLBACK_BASE}/download?error=fetch-failed`
    );
  }
}
