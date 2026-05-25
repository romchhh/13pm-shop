/**
 * Shared pricing helpers to avoid duplicated discount/subtotal logic.
 */

/**
 * Returns price after applying discount percentage.
 * @param price - Original price
 * @param discountPercentage - Optional discount (0–100). If undefined/0, returns price.
 */
export function getDiscountedPrice(
  price: number,
  discountPercentage?: number | null
): number {
  if (!discountPercentage || discountPercentage <= 0) return price;
  return price * (1 - discountPercentage / 100);
}

/**
 * Ціна одиниці зі знижкою та опційною доплатою за колір (напр. білий +150 грн).
 */
export function getBasketUnitPrice(
  price: number,
  discountPercentage?: number | null,
  colorSurchargeUah?: number | null
): number {
  return (
    Math.round(getDiscountedPrice(price, discountPercentage)) +
    Math.max(0, colorSurchargeUah ?? 0)
  );
}

/**
 * Returns subtotal for an item: (price after discount + color surcharge) * quantity.
 */
export function getItemSubtotal(
  price: number,
  quantity: number,
  discountPercentage?: number | null,
  colorSurchargeUah?: number | null
): number {
  return getBasketUnitPrice(price, discountPercentage, colorSurchargeUah) * quantity;
}
