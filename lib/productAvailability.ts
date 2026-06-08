/**
 * Внутрішнє значення складу для режиму «в наявності / немає» без ручного обліку кількості в адмінці.
 * Достатньо велике, щоб декремент після замовлень не робив товар «недоступним» за кількістю.
 */
export const VIRTUAL_STOCK_WHEN_IN_STOCK = 999_999;

export const OUT_OF_STOCK_LABEL = "Немає в наявності";

/** Чи товар недоступний для покупки на вітрині / в кошику. */
export function isProductOutOfStock(p: {
  in_stock?: boolean | null;
  stock?: number | null;
}): boolean {
  if (p.in_stock === false) return true;
  if (typeof p.stock === "number" && p.stock <= 0) return true;
  return false;
}

/** Чи можна відвантажити вказану кількість (in_stock + фактичний stock у БД). */
export function canFulfillQuantity(
  p: { in_stock?: boolean | null; stock?: number | null } | null | undefined,
  quantity: number
): boolean {
  if (!p || p.in_stock === false) return false;
  const s = typeof p.stock === "number" ? p.stock : 0;
  return s >= quantity;
}
