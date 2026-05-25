import { type NextRequest, NextResponse } from "next/server";

const GITHUB_REPO = "cedriking/zenda";

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
        new URL("/download?error=no-release", _request.url)
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
        new URL("/download?error=no-windows-artifact", _request.url)
      );
    }

    return NextResponse.redirect(installer.browser_download_url);
  } catch {
    return NextResponse.redirect(
      new URL("/download?error=fetch-failed", _request.url)
    );
  }
}
