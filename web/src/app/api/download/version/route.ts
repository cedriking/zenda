import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR ?? "/data/downloads";

export async function GET() {
  try {
    const manifestPath = path.join(DOWNLOADS_DIR, "latest.json");
    const manifestData = await readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestData);

    return NextResponse.json({
      version: manifest.version ?? null,
      platforms: manifest.platforms ?? {},
      releaseDate: manifest.releaseDate ?? null,
    });
  } catch {
    return NextResponse.json(
      { version: null, error: "No release manifest found" },
      { status: 404 }
    );
  }
}
