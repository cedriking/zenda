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

    // Find the Windows installer (ZendaSetup.exe from Squirrel or .exe)
    const installer = assets.find(
      (a) => a.name.endsWith(".exe") || a.name === "ZendaSetup.exe"
    );

    if (!installer) {
      return NextResponse.redirect(
        `${FALLBACK_BASE}/download?error=no-windows-artifact`
      );
    }

    return NextResponse.redirect(installer.browser_download_url);
  } catch {
    return NextResponse.redirect(
      `${FALLBACK_BASE}/download?error=fetch-failed`
    );
  }
}
