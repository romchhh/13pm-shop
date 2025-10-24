import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 300; // seconds

// Convert uploaded image to WebP
async function convertToWebP(
  inputPath: string,
  outputDir: string
): Promise<string> {
  const newName = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(outputDir, newName);

  await sharp(inputPath)
    .rotate() // auto-orient
    .webp({ quality: 80 })
    .toFile(outputPath);

  await unlink(inputPath).catch(() => {}); // cleanup original
  return newName;
}

// Determine file type
function getFileType(mimeType: string, filename: string): "photo" | "video" {
  if (mimeType.startsWith("video/")) return "video";
  const ext = filename.split(".").pop()?.toLowerCase();
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "mov",
    "avi",
    "mkv",
    "flv",
    "wmv",
  ];
  return ext && videoExtensions.includes(ext) ? "video" : "photo";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
    const savedMedia: { type: "photo" | "video"; url: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Max file size is 15MB" },
          { status: 413 }
        );
      }

      const ext = file.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const fileType = getFileType(file.type, file.name);
      let finalFileName = uniqueName;

      if (fileType === "photo") {
        console.log(`🖼️ Converting ${uniqueName} → WebP`);
        finalFileName = await convertToWebP(filePath, uploadDir);
        console.log(`✅ Image saved as ${finalFileName}`);
      } else {
        console.log(`🎬 Keeping video ${uniqueName} without conversion`);
        // You could optionally rename to .mp4/.mov/.webm if needed
      }

      savedMedia.push({ type: fileType, url: finalFileName });
    }

    console.log("📦 Saved media:", savedMedia);
    return NextResponse.json({ media: savedMedia }, { status: 201 });
  } catch (error) {
    console.error("[POST /upload]", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
