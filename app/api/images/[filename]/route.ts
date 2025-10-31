import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { access, stat } from "fs/promises";
import sharp from "sharp";

interface RouteParams {
  params: Promise<{
    filename: string;
  }>;
}

// Simple in-memory cache for optimized images (LRU-style with size limit)
const imageCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_SIZE_LIMIT = 100; // Max cached images
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function cleanupCache() {
  if (imageCache.size > CACHE_SIZE_LIMIT) {
    // Remove oldest entries
    const entries = Array.from(imageCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, entries.length - CACHE_SIZE_LIMIT);
    toRemove.forEach(([key]) => imageCache.delete(key));
  }
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

    // Check if it's a video - serve directly without optimization
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov"];
    if (videoExtensions.includes(ext)) {
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
    }

    // For images, optimize with Sharp
    const url = new URL(request.url);
    const width = url.searchParams.get("w") ? parseInt(url.searchParams.get("w")!) : undefined;
    const quality = url.searchParams.get("q") ? parseInt(url.searchParams.get("q")!) : 85;

    // Create cache key based on file and transform params
    const cacheKey = `${filename}_${width || 'full'}_${quality}`;
    const now = Date.now();
    
    // Check cache
    const cached = imageCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      return new NextResponse(Buffer.from(cached.buffer), {
        headers: {
          "Content-Type": "image/webp",
          "Content-Length": cached.buffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Cache": "HIT",
        },
      });
    }

    // Optimize image with Sharp
    const imageBuffer = await sharp(filePath)
      .resize(width, undefined, { withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    // Store in cache
    imageCache.set(cacheKey, { buffer: imageBuffer, timestamp: now });
    cleanupCache();

    return new NextResponse(Buffer.from(imageBuffer), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": imageBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
