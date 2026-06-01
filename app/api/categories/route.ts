import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { sqlGetAllCategories, sqlPostCategory } from "@/lib/sql";
import { apiLogger } from "@/lib/logger";
import { revalidateCategories } from "@/lib/revalidate";
import { apiErrorJson } from "@/lib/apiError";

// Enable ISR for this route
export const revalidate = 1200; // 20 minutes

// ========================
// GET /api/categories
// ========================
export async function GET(request: NextRequest) {
  try {
    // ?revalidate=1 — скинути кеш категорій (наприклад після add-categories або в адмінці)
    const url = request.nextUrl ?? new URL(request.url);
    if (url.searchParams.get("revalidate") === "1") {
      revalidateTag("categories", "max");
    }
    const categories = await sqlGetAllCategories();
    
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=2400',
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/categories", error);
    return apiErrorJson(error, "Не вдалося завантажити категорії");
  }
}

// ========================
// POST /api/categories
// ========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, priority, mediaType, mediaUrl, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Вкажіть назву категорії" },
        { status: 400 }
      );
    }

    const priorityNum =
      priority !== undefined && priority !== null ? Number(priority) : 0;
    if (!Number.isFinite(priorityNum) || priorityNum < 0) {
      return NextResponse.json(
        { error: "Пріоритет має бути невід’ємним числом" },
        { status: 400 }
      );
    }

    const newCategory = await sqlPostCategory(
      name.trim(),
      priorityNum,
      mediaType || null,
      mediaUrl || null,
      typeof description === "string" ? description : description == null ? null : String(description)
    );
    
    // Revalidate cache after creating new category
    await revalidateCategories();
    
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    apiLogger.error("POST", "/api/categories", error);
    return apiErrorJson(error, "Не вдалося створити категорію");
  }
}
