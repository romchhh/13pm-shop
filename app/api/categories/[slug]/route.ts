import { NextRequest, NextResponse } from "next/server";
import {
  sqlGetCategoryBySlug,
  sqlPutCategory,
  sqlDeleteCategory,
} from "@/lib/sql";
import { revalidateCategories } from "@/lib/revalidate";
import { apiErrorJson } from "@/lib/apiError";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid category slug" },
      { status: 400 }
    );
  }

  try {
    const result = await sqlGetCategoryBySlug(slug);
    if (!result) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/categories/:slug]", error);
    return apiErrorJson(error, "Не вдалося завантажити категорію");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid category slug" },
      { status: 400 }
    );
  }

  try {
    const existing = await sqlGetCategoryBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

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

    const updated = await sqlPutCategory(
      existing.id,
      name.trim(),
      priorityNum,
      mediaType,
      mediaUrl,
      typeof description === "string" ? description : description == null ? null : String(description)
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/categories/:slug]", error);
    return apiErrorJson(error, "Не вдалося оновити категорію");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid category slug" },
      { status: 400 }
    );
  }

  try {
    const existing = await sqlGetCategoryBySlug(slug);
    if (!existing) {
      // Якщо категорії вже немає в БД — вважаємо видалення успішним (idempotent DELETE)
      return NextResponse.json({ deleted: true, alreadyDeleted: true });
    }

    await sqlDeleteCategory(existing.id);
    await revalidateCategories();
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /api/categories/:slug]", error);
    return apiErrorJson(error, "Не вдалося видалити категорію");
  }
}
