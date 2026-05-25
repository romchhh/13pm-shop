import { NextRequest, NextResponse } from "next/server";
import {
  sqlPostProduct,
  sqlSyncSizeVariants,
  sqlSyncSizeVariantsOrdered,
  sqlGetProduct,
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
 * POST /api/admin/catalog/products
 * Створення товару з усіма полями + завантаженням кількох фото/відео.
 *
 * JSON або multipart (поле data = JSON, images = файли).
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, imageFiles } = await parseRequestProductPayload(req);

    const uploaded =
      imageFiles.length > 0 ? await uploadProductMediaFiles(imageFiles) : [];
    const media = [...(payload.media ?? []), ...uploaded];

    const product = await sqlPostProduct(adminProductPayloadToSql(payload, media));

    if (payload.size_group_ordered_ids && payload.size_group_ordered_ids.length > 0) {
      const newId = product.id;
      const resolved = payload.size_group_ordered_ids
        .map((x) => (x === 0 ? newId : x))
        .filter((n) => Number.isInteger(n) && n > 0);
      const seen = new Set<number>();
      const orderedUnique: number[] = [];
      for (const id of resolved) {
        if (seen.has(id)) continue;
        seen.add(id);
        orderedUnique.push(id);
      }
      if (orderedUnique.length > 0) {
        await sqlSyncSizeVariantsOrdered(orderedUnique);
      }
    } else if (payload.size_linked_ids && payload.size_linked_ids.length > 0) {
      await sqlSyncSizeVariants(product.id, payload.size_linked_ids);
    }

    await revalidateProducts();

    const full = await sqlGetProduct(product.id);
    return NextResponse.json(
      {
        success: true,
        id: product.id,
        product: full,
        note_similar_products:
          "Блок «Схожі товари» на сайті формується автоматично за підкатегорією/категорією (окремого поля в БД немає).",
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    apiLogger.error("POST", "/api/admin/catalog/products", error);
    const status = message.includes("Обов'язкові") || message.includes("multipart") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
