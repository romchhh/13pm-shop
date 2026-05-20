/** Знімок товару для localStorage (картка у вішлисті без додаткових запитів). */
export type FavoriteProductSnapshot = {
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
  in_stock?: boolean;
  stock?: number;
  is_hit?: boolean;
  is_new?: boolean;
  is_promo?: boolean;
  gift_product_id?: number | null;
};

export const FAVORITES_STORAGE_KEY = "favoriteProducts";

/** Зібрати знімок з полів картки / сторінки товару. */
export function productToFavoriteSnapshot(p: {
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
  media?: { url: string; type: string }[];
  in_stock?: boolean;
  stock?: number;
  is_hit?: boolean;
  is_new?: boolean;
  is_promo?: boolean;
  gift_product_id?: number | null;
}): FavoriteProductSnapshot {
  const first_media =
    p.first_media ??
    (p.media?.[0] ? { url: p.media[0].url, type: p.media[0].type } : null);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    old_price: p.old_price,
    discount_percentage: p.discount_percentage,
    subtitle: p.subtitle,
    subcategory_name: p.subcategory_name,
    category_name: p.category_name,
    first_media,
    in_stock: p.in_stock,
    stock: p.stock,
    is_hit: p.is_hit,
    is_new: p.is_new,
    is_promo: p.is_promo,
    gift_product_id: p.gift_product_id,
  };
}

export function parseFavoritesFromStorage(raw: string | null): FavoriteProductSnapshot[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FavoriteProductSnapshot =>
        item != null &&
        typeof item === "object" &&
        typeof (item as FavoriteProductSnapshot).id === "number" &&
        typeof (item as FavoriteProductSnapshot).name === "string" &&
        typeof (item as FavoriteProductSnapshot).price === "number"
    );
  } catch {
    return [];
  }
}
