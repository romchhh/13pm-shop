import fs from "fs";
import path from "path";
import { HOME_REVIEW_IMAGE_FILES } from "@/lib/homeReviewImages";

const VIDEO_EXTENSIONS = new Set([".mov", ".mp4", ".webm", ".m4v", ".ogg"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic"]);

export type ReviewMediaItem = {
  src: string;
  type: "image" | "video";
  filename: string;
};

const REVIEWS_DIR = path.join(process.cwd(), "public/images/reviews");

function reviewImageSrc(filename: string): string {
  return `/images/reviews/${encodeURIComponent(filename)}`;
}

function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function isVideoFile(filename: string): boolean {
  return VIDEO_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

/** Instagram-скріни спочатку; photo_* — в кінці */
function sortReviewImages(a: string, b: string): number {
  const aPhoto = a.startsWith("photo_");
  const bPhoto = b.startsWith("photo_");
  if (aPhoto && bPhoto) return a.localeCompare(b, "uk");
  if (aPhoto !== bPhoto) return aPhoto ? 1 : -1;
  return a.localeCompare(b, "uk");
}

export function getReviewMedia(): ReviewMediaItem[] {
  if (!fs.existsSync(REVIEWS_DIR)) {
    return [];
  }

  const onDisk = new Set(
    fs.readdirSync(REVIEWS_DIR).filter((name) => !name.startsWith(".") && name !== ".DS_Store")
  );

  const images: ReviewMediaItem[] = [];
  const videos: ReviewMediaItem[] = [];
  const seen = new Set<string>();

  for (const filename of HOME_REVIEW_IMAGE_FILES) {
    if (!onDisk.has(filename)) continue;
    if (!isImageFile(filename)) continue;
    seen.add(filename);
    images.push({
      src: reviewImageSrc(filename),
      type: "image",
      filename,
    });
  }

  const extraImages = [...onDisk]
    .filter((name) => !seen.has(name) && isImageFile(name))
    .sort(sortReviewImages);

  for (const filename of extraImages) {
    images.push({
      src: reviewImageSrc(filename),
      type: "image",
      filename,
    });
  }

  for (const filename of onDisk) {
    if (seen.has(filename) || !isVideoFile(filename)) continue;
    videos.push({
      src: reviewImageSrc(filename),
      type: "video",
      filename,
    });
  }

  videos.sort((a, b) => a.filename.localeCompare(b.filename, "uk"));

  return [...images, ...videos];
}
