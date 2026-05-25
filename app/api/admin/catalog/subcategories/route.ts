import { NextRequest, NextResponse } from "next/server";
import { sqlPostSubcategory } from "@/lib/sql";
import { revalidateCategories } from "@/lib/revalidate";
import { apiLogger } from "@/lib/logger";

/**
 * POST /api/admin/catalog/subcategories
 * Body: { name, category_id, priority? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const categoryId = Number(body.category_id ?? body.categoryId);

    if (!name || !Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: "Обов'язкові поля: name, category_id" },
        { status: 400 }
      );
    }

    const subcategory = await sqlPostSubcategory(name, categoryId);

    await revalidateCategories();

    return NextResponse.json({ success: true, subcategory }, { status: 201 });
  } catch (error) {
    apiLogger.error("POST", "/api/admin/catalog/subcategories", error);
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 });
  }
}
