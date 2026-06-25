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

  const { orderTotal } = computeOrderTotals({
    subtotal,
    deliveryCost,
    promoDiscountAmount,
  });

  const bulkFromCompute = computeOrderTotals({
    subtotal,
    deliveryCost: 0,
    promoDiscountAmount: 0,
  }).bulkDiscountAmount;

  const bulkDiscountAmount =
    loyaltyDiscountAmount > 0 ? loyaltyDiscountAmount : bulkFromCompute;

  const finalTotal =
    loyaltyDiscountAmount > 0 || promoDiscountAmount > 0 || deliveryCost > 0
      ? Math.max(0, subtotal - bulkDiscountAmount - promoDiscountAmount + deliveryCost)
      : orderTotal;

  return {
    subtotal,
    deliveryCost,
    bulkDiscountAmount,
    promoDiscountAmount,
    orderTotal: finalTotal,
  };
}
