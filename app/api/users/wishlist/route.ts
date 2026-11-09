import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/sessionUser";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const full = request.nextUrl.searchParams.get("full") === "1";

    if (full) {
      const wishlistItems = await prisma.wishlist.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              discountPercentage: true,
              media: {
                orderBy: { id: "asc" },
                take: 1,
                select: { url: true, type: true },
              },
            },
          },
        },
      });

      const products = wishlistItems
        .filter((w) => w.product != null)
        .map((w) => {
          const p = w.product!;
          const firstMedia = p.media?.[0];
          return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            discount_percentage: p.discountPercentage,
            first_media: firstMedia
              ? { url: firstMedia.url, type: firstMedia.type }
              : null,
          };
        });

      return NextResponse.json(products);
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });

    return NextResponse.json({
      productIds: wishlist.map((w) => w.productId),
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let productId = 0;
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    productId = Number(body.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    await prisma.wishlist.create({
      data: { userId: user.id, productId },
    });
    return NextResponse.json({ productId });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === "P2002") {
      return NextResponse.json({ productId });
    }
    console.error("Error adding to wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
