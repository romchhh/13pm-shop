import { NextRequest, NextResponse } from "next/server";
import {
  sqlGetProduct,
  sqlPutProduct,
  sqlDeleteProduct,
  sqlSyncSizeVariants,
  sqlSyncSizeVariantsOrdered,
} from "@/lib/sql";
import { revalidateProducts } from "@/lib/revalidate";
import {
  adminProductPayloadToSql,
  parseRequestProductPayload,
} from "@/lib/adminCatalogPayload";
import { uploadProductMediaFiles } from "@/lib/uploadProductMedia";
import { apiLogger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * GET /api/admin/catalog/products/:id
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }
  const product = await sqlGetProduct(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

/**
 * PUT /api/admin/catalog/products/:id
 * Оновлення товару (JSON або multipart).
 * Поле media — повний список медіа після змін; нові файли додаються через images.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const existing = await sqlGetProduct(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { payload, imageFiles } = await parseRequestProductPayload(req);
    const uploaded =
      imageFiles.length > 0 ? await uploadProductMediaFiles(imageFiles) : [];
    const media = [...(payload.media ?? []), ...uploaded];

    const useSizeGroupOrder =
      payload.size_group_ordered_ids !== undefined &&
      payload.size_group_ordered_ids.length > 0;
    const useLegacySizeLinks =
      payload.size_linked_ids !== undefined && payload.size_linked_ids.length > 0;

    const sqlPayload = adminProductPayloadToSql(payload, media);
    await sqlPutProduct(id, {
      ...sqlPayload,
      size_variants:
        useSizeGroupOrder || useLegacySizeLinks ? undefined : sqlPayload.size_variants,
    });

    if (useSizeGroupOrder) {
      await sqlSyncSizeVariantsOrdered(payload.size_group_ordered_ids!);
    } else if (useLegacySizeLinks) {
      await sqlSyncSizeVariants(id, payload.size_linked_ids!);
    }

    await revalidateProducts();
    const full = await sqlGetProduct(id);
    return NextResponse.json({ success: true, updated: true, product: full });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    apiLogger.error("PUT", "/api/admin/catalog/products/[id]", error);
    const status = message.includes("Обов'язкові") || message.includes("multipart") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

/**
 * DELETE /api/admin/catalog/products/:id
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }
    await sqlDeleteProduct(id);
    await revalidateProducts();
    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    apiLogger.error("DELETE", "/api/admin/catalog/products/[id]", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
