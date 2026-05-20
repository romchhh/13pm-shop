import { prisma } from "@/lib/prisma";

export type PopularProductRow = {
  productId: number | null;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
  slug: string | null;
  imageUrl: string | null;
};

export type AdminAnalytics = {
  ordersCount: number;
  totalSales: number;
  averageCheck: number;
  popularProducts: PopularProductRow[];
};

/** Лише оплачені / підтверджені замовлення (без pending та canceled). */
const completedOrderWhere = { paymentStatus: "paid" as const };

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const orders = await prisma.order.findMany({
    where: completedOrderWhere,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  let totalSales = 0;
  const productMap = new Map<
    string,
    {
      productId: number | null;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
    }
  >();

  for (const order of orders) {
    for (const item of order.items) {
      const lineTotal = Number(item.price) * item.quantity;
      totalSales += lineTotal;

      const key =
        item.productId != null
          ? `id:${item.productId}`
          : `name:${(item.productName || "Товар").trim()}`;

      const row = productMap.get(key) ?? {
        productId: item.productId,
        productName: item.productName?.trim() || "Товар",
        totalQuantity: 0,
        totalRevenue: 0,
      };
      row.totalQuantity += item.quantity;
      row.totalRevenue += lineTotal;
      productMap.set(key, row);
    }
  }

  const ordersCount = orders.length;
  const averageCheck = ordersCount > 0 ? totalSales / ordersCount : 0;

  const topRows = [...productMap.values()]
    .sort((a, b) => b.totalQuantity - a.totalQuantity || b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const productIds = topRows
    .map((r) => r.productId)
    .filter((id): id is number => id != null);

  const productsMeta =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            slug: true,
            name: true,
            media: { take: 1, select: { url: true, type: true } },
          },
        })
      : [];

  const metaById = new Map(productsMeta.map((p) => [p.id, p]));

  const popularProducts: PopularProductRow[] = topRows.map((row) => {
    const meta = row.productId != null ? metaById.get(row.productId) : undefined;
    const firstMedia = meta?.media?.[0];
    return {
      productId: row.productId,
      productName: meta?.name || row.productName,
      totalQuantity: row.totalQuantity,
      totalRevenue: row.totalRevenue,
      slug: meta?.slug ?? null,
      imageUrl: firstMedia?.url ?? null,
    };
  });

  return {
    ordersCount,
    totalSales,
    averageCheck,
    popularProducts,
  };
}
