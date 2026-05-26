import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";

const UPLOAD_SECRET = process.env.UPLOAD_SECRET ?? "";
const DOWNLOADS_DIR = process.env.DOWNLOADS_DIR ?? "/data/downloads";

export async function POST(request: NextRequest) {
  if (!UPLOAD_SECRET) {
    return NextResponse.json(
      { error: "Upload not configured (missing UPLOAD_SECRET)" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${UPLOAD_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const filePath = formData.get("path") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine destination path
    const relativePath = filePath ?? file.name;
    const destPath = path.join(DOWNLOADS_DIR, relativePath);

    // Prevent directory traversal
    const resolved = path.resolve(destPath);
    if (!resolved.startsWith(path.resolve(DOWNLOADS_DIR))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ensure directory exists
    await mkdir(path.dirname(destPath), { recursive: true });

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(destPath, buffer);

    return NextResponse.json({
      success: true,
      path: relativePath,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
