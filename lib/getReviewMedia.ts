import fs from "fs";
import path from "path";

const VIDEO_EXTENSIONS = new Set([".mov", ".mp4", ".webm", ".m4v", ".ogg"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".heic"]);

export type ReviewMediaItem = {
  src: string;
  type: "image" | "video";
  filename: string;
};

const REVIEWS_DIR = path.join(process.cwd(), "public/images/reviews");

export function getReviewMedia(): ReviewMediaItem[] {
  if (!fs.existsSync(REVIEWS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(REVIEWS_DIR)
    .filter((name) => !name.startsWith("."));

  const images: ReviewMediaItem[] = [];
  const videos: ReviewMediaItem[] = [];

  for (const filename of files) {
    const ext = path.extname(filename).toLowerCase();
    const src = `/images/reviews/${encodeURIComponent(filename)}`;

    if (VIDEO_EXTENSIONS.has(ext)) {
      videos.push({ src, type: "video", filename });
    } else if (IMAGE_EXTENSIONS.has(ext)) {
      images.push({ src, type: "image", filename });
    }
  }

  images.sort((a, b) => a.filename.localeCompare(b.filename, "uk"));
  videos.sort((a, b) => a.filename.localeCompare(b.filename, "uk"));

  return [...images, ...videos];
}
