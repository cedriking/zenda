import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const FALLBACK_BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://zenda.bot";
const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR ?? "/data/downloads";

export async function GET(_request: NextRequest) {
  try {
    const artifactPath = await findLatestArtifact(".exe");
    if (artifactPath) {
      const fileBuffer = await readFile(artifactPath);
      const filename = path.basename(artifactPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Length": String(fileBuffer.length),
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    return NextResponse.redirect(`${FALLBACK_BASE}/download?error=no-release`);
  } catch {
    return NextResponse.redirect(
      `${FALLBACK_BASE}/download?error=fetch-failed`
    );
  }
}

async function findLatestArtifact(extension: string): Promise<string | null> {
  try {
    const manifestPath = path.join(DOWNLOADS_DIR, "latest.json");
    const manifestData = await readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestData);
    const artifact = manifest?.platforms?.windows;

    if (artifact?.filename) {
      const filePath = path.join(DOWNLOADS_DIR, artifact.filename);
      const exists = await stat(filePath).then(
        () => true,
        () => false
      );
      if (exists) {
        return filePath;
      }
    }
  } catch {
    // manifest not found
  }

  // Fallback: scan for any .exe file in the updates directory
  try {
    const { readdir } = await import("node:fs/promises");
    const updatesDir = path.join(DOWNLOADS_DIR, "updates");
    const entries = await readdir(updatesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subFiles = await readdir(path.join(updatesDir, entry.name));
        const match = subFiles.find((f) => f.endsWith(extension));
        if (match) {
          return path.join(updatesDir, entry.name, match);
        }
      }
    }
  } catch {
    // directory not found
  }

  return null;
}
