import { NextRequest, NextResponse } from "next/server";
import { sqlPostCategory } from "@/lib/sql";
import { revalidateCategories } from "@/lib/revalidate";
import {
  parseRequestCategoryPayload,
} from "@/lib/adminCatalogPayload";
import { uploadProductMediaFiles, getMediaFileType } from "@/lib/uploadProductMedia";
import { apiLogger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/admin/catalog/categories
 * Створення категорії. JSON або multipart (data + image).
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, imageFile } = await parseRequestCategoryPayload(req);

    let mediaType = payload.mediaType ?? null;
    let mediaUrl = payload.mediaUrl ?? null;

    if (imageFile) {
      const [saved] = await uploadProductMediaFiles([imageFile]);
      if (saved) {
        mediaType = saved.type;
        mediaUrl = saved.url;
      }
    } else if (mediaUrl && !mediaType) {
      mediaType = getMediaFileType("image/jpeg", mediaUrl);
    }

    const category = await sqlPostCategory(
      payload.name,
      payload.priority ?? 0,
      mediaType,
      mediaUrl,
      payload.description ?? null
    );

    await revalidateCategories();

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    apiLogger.error("POST", "/api/admin/catalog/categories", error);
    const status = message.includes("Обов'язкове") || message.includes("multipart") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
