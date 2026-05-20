/** Підписи способів оплати (значення в БД: payment_type). */

export const PAYMENT_TYPE_LABELS_LONG: Record<string, string> = {
  prepay: "Накладений платіж (оплата при отриманні)",
  full: "Онлайн-оплата",
  pay_after: "Оплата при отриманні",
  test_payment: "Тест оплата",
  installment: "Розстрочка",
  crypto: "Криптовалюта",
};

/** Короткі підписи для таблиць адмінки */
export const PAYMENT_TYPE_LABELS_SHORT: Record<string, string> = {
  prepay: "Накладений платіж",
  full: "Онлайн-оплата",
  pay_after: "Оплата при отриманні",
  test_payment: "Тест",
  installment: "Розстрочка",
  crypto: "Крипто",
};

export function getPaymentTypeLabel(
  type: string | null | undefined,
  variant: "short" | "long" = "long"
): string {
  if (!type) return "—";
  const map = variant === "short" ? PAYMENT_TYPE_LABELS_SHORT : PAYMENT_TYPE_LABELS_LONG;
  return map[type] ?? type;
}
