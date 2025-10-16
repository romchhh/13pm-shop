import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

// Define the type for the params - note that params is a Promise
interface RouteParams {
  params: Promise<{
    filename: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Await the params since it's a Promise in App Router
    const { filename } = await context.params;
    const filePath = path.join(process.cwd(), "product-images", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();

    // Image formats that should be converted to webp
    const imageFormats = [".jpg", ".jpeg", ".png", ".gif"];
    
    // Video formats
    const videoFormats = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv", ".flv", ".wmv"];

    // If it's a video, serve as-is
    if (videoFormats.includes(ext)) {
      const fileBuffer = await fs.readFile(filePath);
      let contentType = "video/mp4";
      
      if (ext === ".webm") contentType = "video/webm";
      else if (ext === ".ogg") contentType = "video/ogg";
      else if (ext === ".mov") contentType = "video/quicktime";
      else if (ext === ".avi") contentType = "video/x-msvideo";
      else if (ext === ".mkv") contentType = "video/x-matroska";
      else if (ext === ".flv") contentType = "video/x-flv";
      else if (ext === ".wmv") contentType = "video/x-ms-wmv";

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Accept-Ranges": "bytes",
        },
      });
    }

    // If it's an SVG, serve as-is
    if (ext === ".svg") {
      const fileBuffer = await fs.readFile(filePath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // If it's already a webp, serve as-is
    if (ext === ".webp") {
      const fileBuffer = await fs.readFile(filePath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // For other image formats (jpg, jpeg, png, gif), convert to webp
    if (imageFormats.includes(ext)) {
      const fileBuffer = await fs.readFile(filePath);
      
      // Convert to webp using sharp
      const webpBuffer = await sharp(fileBuffer)
        .webp({ quality: 85 }) // Good balance between quality and file size
        .toBuffer();

      return new NextResponse(new Uint8Array(webpBuffer), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Fallback: serve file as-is
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}