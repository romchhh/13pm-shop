import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/sessionUser";
import { getNovaPoshtaTracking } from "@/lib/nova-poshta";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (!Number.isFinite(orderId)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
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
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let npStatusCode: string | null = null;
    let npStatusName: string | null = null;
    if (order.novaPoshtaTtn) {
      const live = await getNovaPoshtaTracking(
        order.novaPoshtaTtn,
        order.phoneNumber
      ).catch(() => null);
      if (live?.name) {
        npStatusName = live.name;
        npStatusCode = live.code ?? null;
      }
    }

    const orderWithImageUrl = {
      ...order,
      npStatusCode,
      npStatusName,
      items: order.items.map((item) => {
        const product = item.product as
          | { id: number; name: string; media?: { url: string; type: string }[] }
          | null;
        const firstPhoto = product?.media?.find((m) => m.type === "photo");
        const imageUrl = firstPhoto?.url ?? product?.media?.[0]?.url ?? null;
        return {
          ...item,
          product: product
            ? { id: product.id, name: product.name || item.productName, imageUrl }
            : item.productName
              ? { id: null, name: item.productName, imageUrl: null }
              : null,
        };
      }),
    };

    return NextResponse.json(orderWithImageUrl);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
