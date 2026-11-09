import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/sessionUser";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                media: {
                  orderBy: { id: "asc" },
                  take: 5,
                  select: { url: true, type: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const ordersWithImageUrl = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const product = item.product as
          | { name: string; media?: { url: string; type: string }[] }
          | null;
        const firstPhoto = product?.media?.find((m) => m.type === "photo");
        const imageUrl = firstPhoto?.url ?? product?.media?.[0]?.url ?? null;
        return {
          ...item,
          product: product
            ? { name: product.name || item.productName, imageUrl }
            : item.productName
              ? { name: item.productName, imageUrl: null }
              : null,
        };
      }),
    }));

    return NextResponse.json(ordersWithImageUrl);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
