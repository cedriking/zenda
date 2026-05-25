import { type NextRequest, NextResponse } from "next/server";

const R2_PUBLIC_URL =
  process.env.R2_UPDATES_PUBLIC_URL ?? "https://pub-xxx.r2.dev";

export async function GET(_request: NextRequest) {
  // The S3 publisher uploads Squirrel artifacts to updates/win32/x64/
  // MakerSquirrel produces: ZendaSetup.exe, RELEASES file
  // We redirect to the stable Squirrel installer name
  try {
    // For Squirrel/Windows, the installer is always named ZendaSetup.exe
    // but the S3 publisher may version it. Try to fetch RELEASES first.
    const releasesUrl = `${R2_PUBLIC_URL}/updates/win32/x64/RELEASES`;
    const res = await fetch(releasesUrl, { cache: "no-store" });
    if (!res.ok) {
      // Fallback to direct link
      return NextResponse.redirect(
        `${R2_PUBLIC_URL}/updates/win32/x64/ZendaSetup.exe`,
      );
    }
    // RELEASES file is NuGet-style, contains entry like:
    // <hash> <filename> <size>
    // We just redirect to the latest installer
    const text = await res.text();
    const lines = text.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const parts = lastLine.trim().split(/\s+/);
    const filename = parts.length >= 2 ? parts[1] : "ZendaSetup.exe";
    return NextResponse.redirect(
      `${R2_PUBLIC_URL}/updates/win32/x64/${filename}`,
    );
  } catch {
    return NextResponse.redirect(
      `${R2_PUBLIC_URL}/updates/win32/x64/ZendaSetup.exe`,
    );
  }
}
