import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv"];
const MAX_FILE_SIZE = 15 * 1024 * 1024;

export function getMediaFileType(mimeType: string, filename: string): "photo" | "video" {
  if (mimeType.startsWith("video/")) return "video";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext && VIDEO_EXTENSIONS.includes(ext)) return "video";
  return "photo";
}

async function convertToWebP(inputPath: string, outputDir: string): Promise<string> {
  const newName = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(outputDir, newName);
  await sharp(inputPath).rotate().webp({ quality: 80 }).toFile(outputPath);
  await unlink(inputPath).catch(() => {});
  return newName;
}

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
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Файл ${file.name} перевищує 15 МБ`);
    }

    const ext = file.name.split(".").pop() || "bin";
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, uniqueName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const fileType = getMediaFileType(file.type, file.name);
    let finalFileName = uniqueName;

    if (fileType === "photo") {
      try {
        finalFileName = await convertToWebP(filePath, uploadDir);
      } catch {
        // залишаємо оригінал
      }
    }

    savedMedia.push({ type: fileType, url: finalFileName });
  }

  return savedMedia;
}
