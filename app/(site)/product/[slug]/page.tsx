import ProductServer from "@/components/product/ProductServer";
import ProductRouteScrollToTop from "@/components/product/ProductRouteScrollToTop";
import YouMightLike from "@/components/product/YouMightLike";
import { Suspense } from "react";
import type { Metadata } from "next";
import { sqlGetProductBySlug, sqlGetProduct, sqlGetCatalogProducts, sqlGetAllProducts } from "@/lib/sql";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildProductMetadata, productCanonicalPath } from "@/lib/seo";
import { redirect, notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 1200; // ISR every 20 minutes

export async function generateStaticParams() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const products = await prisma.product.findMany({
      where: { slug: { not: null } },
      select: { slug: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return products
      .filter((p: { slug: string | null }): p is { slug: string } => p.slug != null)
      .map((p: { slug: string }) => ({ slug: p.slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let product = await sqlGetProductBySlug(slug);
  if (!product && /^\d+$/.test(slug)) {
    product = await sqlGetProduct(Number(slug));
  }
  if (!product) {
    return { title: `Товар не знайдено | ${SITE_STORE_NAME}` };
  }

  const firstMedia = product.media?.length ? product.media[0] : null;

  return buildProductMetadata({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    subtitle: (product as { subtitle?: string | null }).subtitle,
    price: Number(product.price),
    discount_percentage: product.discount_percentage,
    category_name: product.category_name,
    first_media: firstMedia ? { url: firstMedia.url, type: firstMedia.type } : null,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = typeof slug === "string" ? slug.trim() : "";
  if (!slugStr) notFound();

  let product = await sqlGetProductBySlug(slugStr);
  if (!product && /^\d+$/.test(slugStr)) {
    product = await sqlGetProduct(Number(slugStr));
    if (product?.slug && product.slug !== slugStr) {
      redirect(productCanonicalPath(product.slug, product.id));
    }
  }
  if (!product) {
    notFound();
  }

  const boughtTogetherIds = Array.isArray((product as any).bought_together_ids)
    ? ((product as any).bought_together_ids as number[])
    : [];

  const pairTogetherIds = Array.isArray((product as any).pair_together_ids)
    ? ((product as any).pair_together_ids as number[])
    : [];

  // Схожі товари — без дублів груп розмірів
  const catalogProducts = await sqlGetCatalogProducts();
  const others = catalogProducts.filter((p) => p.id !== product.id);

  // Допоміжний шифл
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const currentSubId = (product as any).subcategory_id as number | null | undefined;
  const currentCatIds = new Set<number>(
    Array.from(
      new Set([
        ...(((product as any).category_ids as number[] | undefined) ?? []),
        ...(((product as any).category_id != null ? [(product as any).category_id as number] : []) as number[]),
      ])
    )
  );

  const sameSubcategory: typeof others = [];
  const sameCategory: typeof others = [];
  const rest: typeof others = [];

  for (const p of others) {
    const pSubIds = new Set<number>(
      Array.from(
        new Set([
          ...(((p as any).subcategory_ids as number[] | undefined) ?? []),
          ...(((p as any).subcategory_id != null ? [(p as any).subcategory_id as number] : []) as number[]),
        ])
      )
    );

    const pCatIds = new Set<number>(
      Array.from(
        new Set([
          ...(((p as any).category_ids as number[] | undefined) ?? []),
          ...(((p as any).category_id != null ? [(p as any).category_id as number] : []) as number[]),
        ])
      )
    );

    const sharedSub =
      currentSubId != null && (pSubIds.has(currentSubId) || (p as any).subcategory_id === currentSubId);
    const sharedCat =
      currentCatIds.size > 0 && [...pCatIds].some((id) => currentCatIds.has(id));

    if (sharedSub) {
      sameSubcategory.push(p);
    } else if (sharedCat) {
      sameCategory.push(p);
    } else {
      rest.push(p);
    }
  }

  const ordered = [
    ...shuffle(sameSubcategory),
    ...shuffle(sameCategory),
    ...shuffle(rest),
  ].slice(0, 8);

  const suggestedProducts = ordered.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug ?? null,
    price: p.price,
    old_price: (p as { old_price?: number | null }).old_price ?? null,
    discount_percentage: (p as { discount_percentage?: number | null }).discount_percentage ?? null,
    first_media: p.first_media ?? null,
    subtitle: (p as { subtitle?: string | null }).subtitle ?? null,
    subcategory_name: (p as { subcategory_name?: string | null }).subcategory_name ?? null,
    category_name: (p as { category_name?: string | null }).category_name ?? null,
    is_new: (p as { is_new?: boolean }).is_new ?? false,
    is_hit: (p as { is_hit?: boolean }).is_hit ?? false,
    is_promo: (p as { is_promo?: boolean }).is_promo ?? false,
    gift_product_id: (p as { gift_product_id?: number | null }).gift_product_id ?? null,
    in_stock: (p as { in_stock?: boolean }).in_stock,
    stock: (p as { stock?: number }).stock,
  }));

  const allProductsForLinks = await sqlGetAllProducts();
  const boughtTogetherProducts = boughtTogetherIds.length
    ? allProductsForLinks
        .filter((p) => boughtTogetherIds.includes(p.id))
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug ?? null,
          price: p.price,
          old_price: (p as { old_price?: number | null }).old_price ?? null,
          discount_percentage: (p as { discount_percentage?: number | null }).discount_percentage ?? null,
          first_media: p.first_media ?? null,
          subtitle: (p as { subtitle?: string | null }).subtitle ?? null,
          description: (p as { description?: string | null }).description ?? null,
          is_new: (p as { is_new?: boolean }).is_new ?? false,
          is_hit: (p as { is_hit?: boolean }).is_hit ?? false,
          is_promo: (p as { is_promo?: boolean }).is_promo ?? false,
          gift_product_id: (p as { gift_product_id?: number | null }).gift_product_id ?? null,
          in_stock: (p as { in_stock?: boolean }).in_stock,
          stock: (p as { stock?: number }).stock,
        }))
    : [];

  const pairProducts = pairTogetherIds.length
    ? allProductsForLinks
        .filter((p) => pairTogetherIds.includes(p.id))
        .slice(0, 12)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug ?? null,
          price: p.price,
          old_price: (p as { old_price?: number | null }).old_price ?? null,
          discount_percentage: (p as { discount_percentage?: number | null }).discount_percentage ?? null,
          first_media: p.first_media ?? null,
          subtitle: (p as { subtitle?: string | null }).subtitle ?? null,
          description: (p as { description?: string | null }).description ?? null,
          is_new: (p as { is_new?: boolean }).is_new ?? false,
          is_hit: (p as { is_hit?: boolean }).is_hit ?? false,
          is_promo: (p as { is_promo?: boolean }).is_promo ?? false,
          gift_product_id: (p as { gift_product_id?: number | null }).gift_product_id ?? null,
          in_stock: (p as { in_stock?: boolean }).in_stock,
          stock: (p as { stock?: number }).stock,
        }))
    : [];

  // Прокидаємо на клієнт (ProductClient) для блоку "Купують разом"
  (product as any).bought_together_products = boughtTogetherProducts;

  return (
    <main className="min-h-screen bg-[#FFFFFF]">
      <ProductRouteScrollToTop />
      <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження товару...</div>}>
        <ProductServer product={product} />
      </Suspense>
      <YouMightLike title="Вам також може сподобатися" suggestedProducts={suggestedProducts} showCatalogLink />
      {pairProducts.length > 0 && (
        <YouMightLike title="Обирай у парі" suggestedProducts={pairProducts} />
      )}
    </main>
  );
}
