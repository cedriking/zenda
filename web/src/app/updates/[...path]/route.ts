import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR ?? "/data/downloads";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.join(DOWNLOADS_DIR, "updates", ...segments);

  // Prevent directory traversal
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(DOWNLOADS_DIR))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await stat(resolved);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fileBuffer = await readFile(resolved);
  const filename = path.basename(resolved);

  let contentType = "application/octet-stream";
  if (filename.endsWith(".json")) {
    contentType = "application/json";
  } else if (filename.endsWith(".zip")) {
    contentType = "application/zip";
  }

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(fileBuffer.length),
      "Cache-Control": "public, max-age=300",
    },
  });
}
