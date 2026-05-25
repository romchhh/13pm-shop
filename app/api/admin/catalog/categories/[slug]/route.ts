import { NextRequest, NextResponse } from "next/server";
import { sqlGetCategoryBySlug, sqlPutCategory } from "@/lib/sql";
import { revalidateCategories } from "@/lib/revalidate";
import { parseRequestCategoryPayload } from "@/lib/adminCatalogPayload";
import { uploadProductMediaFiles, getMediaFileType } from "@/lib/uploadProductMedia";
import { apiLogger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * GET /api/admin/catalog/categories/:slug
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);
  const category = await sqlGetCategoryBySlug(slug);
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  return NextResponse.json({ category });
}

/**
 * PUT /api/admin/catalog/categories/:slug
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = decodeURIComponent((await params).slug);
    const existing = await sqlGetCategoryBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const { payload, imageFile } = await parseRequestCategoryPayload(req);

    let mediaType = payload.mediaType ?? existing.mediaType;
    let mediaUrl = payload.mediaUrl ?? existing.mediaUrl;

    if (imageFile) {
      const [saved] = await uploadProductMediaFiles([imageFile]);
      if (saved) {
        mediaType = saved.type;
        mediaUrl = saved.url;
      }
    } else if (mediaUrl && !mediaType) {
      mediaType = getMediaFileType("image/jpeg", mediaUrl);
    }

    const category = await sqlPutCategory(
      existing.id,
      payload.name || existing.name,
      payload.priority ?? existing.priority,
      mediaType,
      mediaUrl,
      payload.description !== undefined ? payload.description : existing.description
    );

    await revalidateCategories();

    return NextResponse.json({ success: true, category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    apiLogger.error("PUT", "/api/admin/catalog/categories/[slug]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
