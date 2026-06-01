import { NextRequest, NextResponse } from "next/server";
import {
  sqlGetSubcategoryBySlug,
  sqlPutSubcategory,
  sqlDeleteSubcategory,
} from "@/lib/sql";
import { apiErrorJson } from "@/lib/apiError";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid subcategory slug" },
      { status: 400 }
    );
  }

  try {
    const subcategory = await sqlGetSubcategoryBySlug(slug);

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error("GET subcategory failed:", error);
    return apiErrorJson(error, "Не вдалося завантажити підкатегорію");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid subcategory slug" },
      { status: 400 }
    );
  }

  try {
    const existing = await sqlGetSubcategoryBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { name, parent_category_id } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Вкажіть назву підкатегорії" },
        { status: 400 }
      );
    }

    const categoryId = Number(parent_category_id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: "Невірний parent_category_id — оберіть категорію" },
        { status: 400 }
      );
    }

    const updatedSubcategory = await sqlPutSubcategory(
      existing.id,
      name.trim(),
      categoryId
    );

    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    console.error("PUT subcategory failed:", error);
    return apiErrorJson(error, "Не вдалося оновити підкатегорію");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const slug = decodeURIComponent((await params).slug);

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid subcategory slug" },
      { status: 400 }
    );
  }

  try {
    const existing = await sqlGetSubcategoryBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    await sqlDeleteSubcategory(existing.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE subcategory failed:", error);
    return apiErrorJson(error, "Не вдалося видалити підкатегорію");
  }
}
