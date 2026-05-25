import { type NextRequest, NextResponse } from "next/server";

const R2_PUBLIC_URL =
  process.env.R2_UPDATES_PUBLIC_URL ?? "https://pub-xxx.r2.dev";

export async function GET(_request: NextRequest) {
  // The S3 publisher uploads DMG artifacts to updates/darwin/arm64/
  // Electron Forge MakerDMG names them: Zenda-{version}-arm64.dmg
  // We fetch the RELEASES.json manifest to find the latest version, then redirect.
  try {
    const manifestUrl = `${R2_PUBLIC_URL}/updates/darwin/arm64/RELEASES.json`;
    const res = await fetch(manifestUrl, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.redirect(
        new URL("/download?error=manifest-unavailable", _request.url),
      );
    }
    const manifest = await res.json();
    const dmgUrl = manifest?.dmgUrl;
    if (!dmgUrl) {
      return NextResponse.redirect(
        new URL("/download?error=no-artifact", _request.url),
      );
    }
    // If the URL is relative to the manifest base, resolve it
    const redirectUrl = dmgUrl.startsWith("http")
      ? dmgUrl
      : `${R2_PUBLIC_URL}/updates/darwin/arm64/${dmgUrl}`;
    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(
      new URL("/download?error=fetch-failed", _request.url),
    );
  }
}
