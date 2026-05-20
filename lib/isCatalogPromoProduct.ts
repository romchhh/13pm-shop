export type PromoCheckProduct = {
  is_promo?: boolean;
  discount_percentage?: number | null;
  old_price?: number | null;
  price: number;
};

export function isCatalogPromoProduct(p: PromoCheckProduct): boolean {
  if (p.is_promo === true) return true;
  if (p.discount_percentage != null && Number(p.discount_percentage) > 0) return true;
  if (p.old_price != null && Number(p.old_price) > Number(p.price)) return true;
  return false;
}
