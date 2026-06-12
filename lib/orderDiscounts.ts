/** Автоматична знижка на замовлення від цієї суми товарів (грн). */
export const BULK_ORDER_DISCOUNT_MIN_SUBTOTAL_UAH = 5000;

/** Відсоток автоматичної знижки на замовлення. */
export const BULK_ORDER_DISCOUNT_PERCENT = 15;

export const BULK_ORDER_DISCOUNT_LABEL = `−${BULK_ORDER_DISCOUNT_PERCENT}% від ${BULK_ORDER_DISCOUNT_MIN_SUBTOTAL_UAH.toLocaleString("uk-UA")} грн`;

/** Знижка на суму товарів (без доставки), якщо досягнуто поріг. */
export function getBulkOrderDiscountAmount(subtotal: number): number {
  const normalizedSubtotal = Math.max(0, Math.round(Number(subtotal) || 0));
  if (normalizedSubtotal < BULK_ORDER_DISCOUNT_MIN_SUBTOTAL_UAH) {
    return 0;
  }
  return Math.round((normalizedSubtotal * BULK_ORDER_DISCOUNT_PERCENT) / 100);
}

export function computeOrderTotals({
  subtotal,
  deliveryCost = 0,
  promoDiscountAmount = 0,
}: {
  subtotal: number;
  deliveryCost?: number;
  promoDiscountAmount?: number;
}) {
  const normalizedSubtotal = Math.max(0, Number(subtotal) || 0);
  const normalizedDelivery = Math.max(0, Number(deliveryCost) || 0);
  const bulkDiscountAmount = getBulkOrderDiscountAmount(normalizedSubtotal);
  const amountBeforePromo = Math.max(
    0,
    normalizedSubtotal - bulkDiscountAmount + normalizedDelivery
  );
  const normalizedPromoDiscount = Math.min(
    Math.max(0, Number(promoDiscountAmount) || 0),
    amountBeforePromo
  );
  const orderTotal = Math.max(0, amountBeforePromo - normalizedPromoDiscount);

  return {
    bulkDiscountAmount,
    promoDiscountAmount: normalizedPromoDiscount,
    totalDiscountAmount: bulkDiscountAmount + normalizedPromoDiscount,
    orderTotal,
  };
}
