import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { stat, access } from "fs/promises";

interface RouteParams {
  params: Promise<{
    filename: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { filename } = await context.params;
    const filePath = path.join(process.cwd(), "product-images", filename);

    // ✅ Check existence
    try {
      await access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();

    // 🟢 Determine content type (only minimal logic needed)
    const contentTypeMap: Record<string, string> = {
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".gif": "image/gif",
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".ogg": "video/ogg",
      ".mov": "video/quicktime",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // 🧠 Serve videos/images as a stream
    const stats = await stat(filePath);
    const stream = fs.createReadStream(filePath);

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Content-Length": stats.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    return new NextResponse(stream as any, { headers });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
