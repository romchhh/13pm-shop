/**
 * Ціноутворення на вітрині та в кошику.
 *
 * Поле `price` в адмінці — кінцева ціна для покупця.
 * `old_price` — закреслена «стара» ціна.
 * `discount_percentage` — лише для бейджа «-N%», не зменшує price повторно.
 */

/** Кінцева ціна для покупця (поле «Ціна» в адмінці). */
export function getProductDisplayPrice(price: number): number {
  const n = Number(price);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

/** Закреслена ціна, якщо old_price більша за поточну. */
export function getProductStrikePrice(
  price: number,
  oldPrice?: number | null
): number | null {
  const current = getProductDisplayPrice(price);
  if (oldPrice == null) return null;
  const old = Math.round(Number(oldPrice));
  return Number.isFinite(old) && old > current ? old : null;
}

/** Відсоток для бейджа знижки. */
export function getProductDiscountBadgePercent(
  price: number,
  oldPrice?: number | null,
  discountPercentage?: number | null
): number | null {
  if (discountPercentage != null && Number(discountPercentage) > 0) {
    return Math.round(Number(discountPercentage));
  }
  const strike = getProductStrikePrice(price, oldPrice);
  if (strike != null) {
    const current = getProductDisplayPrice(price);
    return Math.max(1, Math.round((1 - current / strike) * 100));
  }
  return null;
}

/**
 * Кінцева ціна одиниці (alias для сумісності з існуючим кодом).
 * discountPercentage ігнорується — price вже фінальний.
 */
export function getDiscountedPrice(
  price: number,
  _discountPercentage?: number | null
): number {
  return getProductDisplayPrice(price);
}

/** Ціна одиниці в кошику. */
export function getBasketUnitPrice(
  price: number,
  _discountPercentage?: number | null,
  colorSurchargeUah?: number | null
): number {
  void colorSurchargeUah;
  return getProductDisplayPrice(price);
}

/** Підсумок позиції: ціна × кількість. */
export function getItemSubtotal(
  price: number,
  quantity: number,
  discountPercentage?: number | null,
  colorSurchargeUah?: number | null
): number {
  return getBasketUnitPrice(price, discountPercentage, colorSurchargeUah) * quantity;
}
