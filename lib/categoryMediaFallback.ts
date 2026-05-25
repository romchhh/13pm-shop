import { prisma } from "@/lib/prisma";

export type CategoryWithMedia = {
  id: number;
  name: string;
  slug: string | null;
  priority: number;
  mediaType: string | null;
  mediaUrl: string | null;
  description: string | null;
};

/**
 * Якщо у категорії немає mediaUrl — підставляє фото (або перше медіа)
 * першого товару цієї категорії (за product_category_links або legacy category_id).
 */
export async function applyCategoryMediaFallback(
  categories: CategoryWithMedia[]
): Promise<CategoryWithMedia[]> {
  const missingIds = categories
    .filter((c) => !c.mediaUrl?.trim())
    .map((c) => c.id);

  if (missingIds.length === 0) return categories;

  const firstProductByCategory = new Map<number, number>();

  const links = await prisma.productCategoryLink.findMany({
    where: { categoryId: { in: missingIds } },
    select: { categoryId: true, productId: true },
    orderBy: [{ categoryId: "asc" }, { productId: "asc" }],
  });

  for (const link of links) {
    if (!firstProductByCategory.has(link.categoryId)) {
      firstProductByCategory.set(link.categoryId, link.productId);
    }
  }

  const legacyProducts = await prisma.product.findMany({
    where: { categoryId: { in: missingIds } },
    select: { id: true, categoryId: true },
    orderBy: { id: "asc" },
  });

  for (const p of legacyProducts) {
    if (p.categoryId != null && !firstProductByCategory.has(p.categoryId)) {
      firstProductByCategory.set(p.categoryId, p.id);
    }
  }

  const productIds = [...new Set(firstProductByCategory.values())];
  if (productIds.length === 0) return categories;

  const allMedia = await prisma.productMedia.findMany({
    where: { productId: { in: productIds } },
    orderBy: [{ productId: "asc" }, { id: "asc" }],
    select: { productId: true, type: true, url: true },
  });

  const mediaByProduct = new Map<number, { type: string; url: string }>();
  for (const m of allMedia) {
    if (m.type === "photo" && !mediaByProduct.has(m.productId)) {
      mediaByProduct.set(m.productId, { type: m.type, url: m.url });
    }
  }
  for (const m of allMedia) {
    if (!mediaByProduct.has(m.productId)) {
      mediaByProduct.set(m.productId, { type: m.type, url: m.url });
    }
  }

  return categories.map((category) => {
    if (category.mediaUrl?.trim()) return category;
    const productId = firstProductByCategory.get(category.id);
    if (!productId) return category;
    const media = mediaByProduct.get(productId);
    if (!media) return category;
    return {
      ...category,
      mediaType: media.type,
      mediaUrl: media.url,
    };
  });
}
