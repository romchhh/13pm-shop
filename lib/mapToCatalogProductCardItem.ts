import type { CatalogProductCardItem } from "@/components/catalog/CatalogProductCard";

type ProductLike = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  old_price?: number | null;
  discount_percentage?: number | null;
  subtitle?: string | null;
  subcategory_name?: string | null;
  category_name?: string | null;
  first_media?: { url: string; type: string } | null;
  is_promo?: boolean;
  is_hit?: boolean;
  is_new?: boolean;
  gift_product_id?: number | null;
  in_stock?: boolean;
  stock?: number;
  description?: string | null;
};

export function mapToCatalogProductCardItem(
  product: ProductLike,
  fallback?: Partial<CatalogProductCardItem>
): CatalogProductCardItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? fallback?.slug ?? null,
    price: product.price,
    old_price: product.old_price ?? fallback?.old_price ?? null,
    discount_percentage:
      product.discount_percentage ?? fallback?.discount_percentage ?? null,
    subtitle:
      product.subtitle?.trim() ||
      product.description?.trim() ||
      fallback?.subtitle ||
      null,
    subcategory_name:
      product.subcategory_name ?? fallback?.subcategory_name ?? null,
    category_name: product.category_name ?? fallback?.category_name ?? null,
    first_media: product.first_media ?? fallback?.first_media ?? null,
    is_promo: product.is_promo ?? fallback?.is_promo,
    is_hit: product.is_hit ?? fallback?.is_hit,
    is_new: product.is_new ?? fallback?.is_new,
    gift_product_id:
      product.gift_product_id ?? fallback?.gift_product_id ?? null,
    in_stock: product.in_stock ?? fallback?.in_stock,
    stock: product.stock ?? fallback?.stock,
  };
}
