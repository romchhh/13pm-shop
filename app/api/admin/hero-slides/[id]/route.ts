import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { title, subtitle, desktopImageUrl, mobileImageUrl, sortOrder, isActive } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = String(title).trim();
    if (subtitle !== undefined) data.subtitle = subtitle?.trim() || null;
    if (desktopImageUrl !== undefined) data.desktopImageUrl = String(desktopImageUrl).trim();
    if (mobileImageUrl !== undefined) data.mobileImageUrl = String(mobileImageUrl).trim();
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder) || 0;
    if (isActive !== undefined) data.isActive = Boolean(isActive);

    const slide = await prisma.heroSlide.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    return NextResponse.json(slide);
  } catch (e) {
    console.error("[admin/hero-slides PUT]", e);
    return NextResponse.json({ error: "Failed to update hero slide" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.heroSlide.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/hero-slides DELETE]", e);
    return NextResponse.json({ error: "Failed to delete hero slide" }, { status: 500 });
  }
}
