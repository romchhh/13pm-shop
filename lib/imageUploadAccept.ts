/**
 * Типи файлів для dropzone (клієнт + сервер). HEIC часто приходить без MIME з iPhone.
 */
export const IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "webp",
  "svg",
  "heic",
  "heif",
] as const;

export const VIDEO_EXTENSIONS = [
  "mp4",
  "webm",
  "ogg",
  "mov",
  "avi",
  "mkv",
  "flv",
  "wmv",
] as const;

export const IMAGE_ONLY_DROPZONE_ACCEPT: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "image/heif": [".heif"],
  "image/svg+xml": [".svg"],
};

export const IMAGE_DROPZONE_ACCEPT: Record<string, string[]> = {
  ...IMAGE_ONLY_DROPZONE_ACCEPT,
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/ogg": [".ogg"],
  "video/quicktime": [".mov"],
  "video/x-msvideo": [".avi"],
  "video/x-matroska": [".mkv"],
  "video/x-flv": [".flv"],
  "video/x-ms-wmv": [".wmv"],
};

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isHeicExtension(filename: string): boolean {
  const ext = getFileExtension(filename);
  return ext === "heic" || ext === "heif";
}

/** react-dropzone: прийняти HEIC навіть з порожнім MIME */
export function adminDropzoneFileValidator(file: File): { code: string; message: string } | null {
  const ext = getFileExtension(file.name);
  if (IMAGE_EXTENSIONS.includes(ext as (typeof IMAGE_EXTENSIONS)[number])) return null;
  if (VIDEO_EXTENSIONS.includes(ext as (typeof VIDEO_EXTENSIONS)[number])) return null;
  if (file.type.startsWith("image/") || file.type.startsWith("video/")) return null;
  return {
    code: "file-invalid-type",
    message: "Дозволені зображення (PNG, JPG, WebP, HEIC, SVG) або відео",
  };
}

export function adminImageOnlyDropzoneValidator(
  file: File
): { code: string; message: string } | null {
  const ext = getFileExtension(file.name);
  if (IMAGE_EXTENSIONS.includes(ext as (typeof IMAGE_EXTENSIONS)[number])) return null;
  if (file.type.startsWith("image/")) return null;
  return {
    code: "file-invalid-type",
    message: "Дозволені зображення: PNG, JPG, WebP, HEIC, SVG",
  };
}
