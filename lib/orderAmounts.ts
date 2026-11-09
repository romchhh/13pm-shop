import { computeOrderTotals } from "@/lib/orderDiscounts";

export type OrderAmountItem = {
  price: number;
  quantity: number;
};

export function getOrderItemsSubtotal(items: OrderAmountItem[]): number {
  return items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
}

export function summarizeOrderAmounts(params: {
  items: OrderAmountItem[];
  deliveryCost?: number;
  loyaltyDiscountAmount?: number | null;
  promoDiscountAmount?: number | null;
}) {
  const subtotal = getOrderItemsSubtotal(params.items);
  const loyaltyDiscountAmount = Math.max(
    0,
    Number(params.loyaltyDiscountAmount) || 0
  );
  const promoDiscountAmount = Math.max(0, Number(params.promoDiscountAmount) || 0);
  const deliveryCost = Math.max(0, Number(params.deliveryCost) || 0);

  const {
    orderTotal,
    bulkDiscountAmount: bulkFromCompute,
    loyaltyDiscountAmount: normalizedLoyalty,
    promoDiscountAmount: normalizedPromo,
  } = computeOrderTotals({
    subtotal,
    deliveryCost,
    promoDiscountAmount,
    loyaltyDiscountAmount,
  });

  const bulkDiscountAmount =
    normalizedLoyalty > 0 ? normalizedLoyalty : bulkFromCompute;

  return {
    subtotal,
    deliveryCost,
    bulkDiscountAmount,
    promoDiscountAmount: normalizedPromo,
    orderTotal,
  };
}
