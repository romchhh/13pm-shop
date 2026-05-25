import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import {
  getFileExtension,
  isHeicExtension,
  VIDEO_EXTENSIONS,
} from "@/lib/imageUploadAccept";

export const MAX_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024;

export function getMediaFileType(mimeType: string, filename: string): "photo" | "video" {
  if (mimeType.startsWith("video/")) return "video";
  const ext = getFileExtension(filename);
  if (ext && VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number])) {
    return "video";
  }
  return "photo";
}

async function convertHeicToJpegBuffer(input: Buffer): Promise<Buffer> {
  const heicConvert = (await import("heic-convert")).default;
  const result = await heicConvert({
    buffer: input,
    format: "JPEG",
    quality: 0.92,
  });
  return Buffer.from(result);
}

/**
 * Повертає буфер, який sharp може обробити (HEIC/HEIF → JPEG).
 */
export async function normalizeImageBuffer(
  buffer: Buffer,
  filename: string
): Promise<Buffer> {
  if (!isHeicExtension(filename)) return buffer;

  try {
    return await sharp(buffer).rotate().jpeg({ quality: 92 }).toBuffer();
  } catch {
    return convertHeicToJpegBuffer(buffer);
  }
}

/**
 * Зберігає фото як WebP у outputDir, повертає ім'я файлу.
 */
export async function savePhotoBufferAsWebP(
  buffer: Buffer,
  filename: string,
  outputDir: string
): Promise<string> {
  const normalized = await normalizeImageBuffer(buffer, filename);
  const newName = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(outputDir, newName);

  const ext = getFileExtension(filename);
  if (ext === "svg") {
    const svgName = `${crypto.randomUUID()}.svg`;
    await writeFile(path.join(outputDir, svgName), normalized);
    return svgName;
  }

  await sharp(normalized).rotate().webp({ quality: 80 }).toFile(outputPath);
  return newName;
}

/**
 * З дискового тимчасового файлу (legacy шлях upload).
 */
export async function convertImageFileToWebP(
  inputPath: string,
  filename: string,
  outputDir: string
): Promise<string> {
  const buffer = await import("fs/promises").then((fs) => fs.readFile(inputPath));
  const result = await savePhotoBufferAsWebP(buffer, filename, outputDir);
  await unlink(inputPath).catch(() => {});
  return result;
}
