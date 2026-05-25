import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  getMediaFileType,
  MAX_IMAGE_UPLOAD_BYTES,
  normalizeImageBuffer,
  savePhotoBufferAsWebP,
} from "@/lib/imageUpload";

export { getMediaFileType } from "@/lib/imageUpload";

/**
 * Зберігає файли в product-images/ (ті самі, що /api/images).
 */
export async function uploadProductMediaFiles(
  files: File[]
): Promise<{ type: "photo" | "video"; url: string }[]> {
  if (!files.length) return [];

  const uploadDir = path.join(process.cwd(), "product-images");
  await mkdir(uploadDir, { recursive: true });

  const savedMedia: { type: "photo" | "video"; url: string }[] = [];

  for (const file of files) {
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new Error(`Файл ${file.name} перевищує 15 МБ`);
    }

    const fileType = getMediaFileType(file.type, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileType === "video") {
      const ext = file.name.split(".").pop() || "mp4";
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      await writeFile(path.join(uploadDir, uniqueName), buffer);
      savedMedia.push({ type: "video", url: uniqueName });
      continue;
    }

    try {
      const finalFileName = await savePhotoBufferAsWebP(buffer, file.name, uploadDir);
      savedMedia.push({ type: "photo", url: finalFileName });
    } catch (err) {
      const normalized = await normalizeImageBuffer(buffer, file.name).catch(() => buffer);
      const ext = file.name.split(".").pop() || "jpg";
      const fallbackName = `${crypto.randomUUID()}.${ext}`;
      await writeFile(path.join(uploadDir, fallbackName), normalized);
      savedMedia.push({ type: "photo", url: fallbackName });
      console.warn("[uploadProductMedia] WebP failed, kept original:", file.name, err);
    }
  }

  return savedMedia;
}
