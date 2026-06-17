import { NextRequest, NextResponse } from "next/server";
import { parseCatalogPriority } from "@/lib/catalogPriority";
import { apiLogger } from "@/lib/logger";
import {
  sqlPatchCategoryPriority,
  sqlPatchProductPriority,
} from "@/lib/sql";
import { revalidateCategories, revalidateProducts } from "@/lib/revalidate";

type PriorityEntityType = "product" | "category";

/**
 * PATCH /api/admin/catalog/priorities
 * Body: { type: "product" | "category", id: number, priority: number }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type as PriorityEntityType;
    const id = Number(body.id);
    const priority = parseCatalogPriority(body.priority);

    if (type !== "product" && type !== "category") {
      return NextResponse.json(
        { error: "type має бути product або category" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Некоректний id" }, { status: 400 });
    }
    if (priority === null) {
      return NextResponse.json(
        { error: "Пріоритет має бути цілим числом ≥ 0" },
        { status: 400 }
      );
    }

    if (type === "product") {
      const updated = await sqlPatchProductPriority(id, priority);
      if (!updated) {
        return NextResponse.json({ error: "Товар не знайдено" }, { status: 404 });
      }
      await revalidateProducts();
      return NextResponse.json({ success: true, type, id, priority });
    }

    const updated = await sqlPatchCategoryPriority(id, priority);
    if (!updated) {
      return NextResponse.json(
        { error: "Категорію не знайдено" },
        { status: 404 }
      );
    }
    await revalidateCategories();
    return NextResponse.json({ success: true, type, id, priority });
  } catch (error) {
    apiLogger.error("PATCH", "/api/admin/catalog/priorities", error);
    return NextResponse.json(
      { error: "Не вдалося оновити пріоритет" },
      { status: 500 }
    );
  }
}
