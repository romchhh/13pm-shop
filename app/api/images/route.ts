import { mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import {
  getMediaFileType,
  MAX_IMAGE_UPLOAD_BYTES,
  savePhotoBufferAsWebP,
} from "@/lib/imageUpload";

const log = createLogger("POST /api/images");

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const savedMedia: { type: "photo" | "video"; url: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: "Max file size is 15MB" },
          { status: 413 }
        );
      }

      log.debug("Uploading file:", file.name, "MIME:", file.type, "Size:", file.size);

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = getMediaFileType(file.type, file.name);

      if (fileType === "video") {
        const ext = file.name.split(".").pop() || "mp4";
        const uniqueName = `${crypto.randomUUID()}.${ext}`;
        await writeFile(path.join(uploadDir, uniqueName), buffer);
        savedMedia.push({ type: fileType, url: uniqueName });
        continue;
      }

      try {
        const finalFileName = await savePhotoBufferAsWebP(buffer, file.name, uploadDir);
        savedMedia.push({ type: "photo", url: finalFileName });
      } catch (error) {
        log.warn("Failed to convert image, keeping original:", file.name, error);
        const ext = file.name.split(".").pop() || "bin";
        const uniqueName = `${crypto.randomUUID()}.${ext}`;
        await writeFile(path.join(uploadDir, uniqueName), buffer);
        savedMedia.push({ type: "photo", url: uniqueName });
      }
    }

    return NextResponse.json({ media: savedMedia }, { status: 201 });
  } catch (error) {
    log.error(error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
