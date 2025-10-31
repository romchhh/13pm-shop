import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { access, stat } from "fs/promises";

interface RouteParams {
  params: Promise<{
    filename: string;
  }>;
}

// Helper: convert Node.js Readable to Web ReadableStream
function nodeToWebStream(nodeStream: fs.ReadStream): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        // chunk can be string | Buffer — ensure we pass an ArrayLike<number> to Uint8Array
        const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        controller.enqueue(new Uint8Array(buffer));
      });
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { filename } = await context.params;
    const filePath = path.join(process.cwd(), "product-images", filename);

    try {
      await access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();

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

    const fileStats = await stat(filePath);
    const nodeStream = fs.createReadStream(filePath);
    const webStream = nodeToWebStream(nodeStream);

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStats.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
