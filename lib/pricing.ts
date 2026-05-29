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

/** Ціна одиниці зі знижкою (застаріла доплата за колір у кошику більше не застосовується). */
export function getBasketUnitPrice(
  price: number,
  discountPercentage?: number | null,
  colorSurchargeUah?: number | null
): number {
  void colorSurchargeUah;
  return Math.round(getDiscountedPrice(price, discountPercentage));
}

/** Підсумок позиції: ціна зі знижкою × кількість. */
export function getItemSubtotal(
  price: number,
  quantity: number,
  discountPercentage?: number | null,
  colorSurchargeUah?: number | null
): number {
  return getBasketUnitPrice(price, discountPercentage, colorSurchargeUah) * quantity;
}
