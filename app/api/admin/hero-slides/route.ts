import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllHeroSlides } from "@/lib/heroSlides";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const slides = await getAllHeroSlides();
    return NextResponse.json(slides);
  } catch (e) {
    console.error("[admin/hero-slides GET]", e);
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, desktopImageUrl, mobileImageUrl, sortOrder, isActive } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Заголовок обов'язковий" }, { status: 400 });
    }
    if (!desktopImageUrl?.trim() || !mobileImageUrl?.trim()) {
      return NextResponse.json(
        { error: "Потрібні зображення для десктопу та мобільної версії" },
        { status: 400 }
      );
    }

    const slide = await prisma.heroSlide.create({
      data: {
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        desktopImageUrl: desktopImageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim(),
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        isActive: isActive !== false,
      },
    });

    revalidatePath("/");
    return NextResponse.json(slide, { status: 201 });
  } catch (e) {
    console.error("[admin/hero-slides POST]", e);
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 });
  }
}
