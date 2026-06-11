import {
  parseSizeStock,
  totalStockFromSizeRows,
} from "@/lib/productOptions";

/**
 * Внутрішнє значення складу для режиму «в наявності / немає» без ручного обліку кількості в адмінці.
 * Достатньо велике, щоб декремент після замовлень не робив товар «недоступним» за кількістю.
 */
export const VIRTUAL_STOCK_WHEN_IN_STOCK = 999_999;

export const OUT_OF_STOCK_LABEL = "Немає в наявності";

type StockCheckInput = {
  in_stock?: boolean | null;
  stock?: number | null;
  size_variants?: unknown;
};

function sizeRowsFromProduct(p: StockCheckInput) {
  return parseSizeStock(p.size_variants);
}

/**
 * Чи товар недоступний для покупки на вітрині.
 * Прапорець «В наявності» в адмінці — головний; розміри з нульовим stock не вимикають товар повністю.
 */
export function isProductOutOfStock(p: StockCheckInput): boolean {
  if (p.in_stock === true) return false;
  if (p.in_stock === false) return true;

  const sizeRows = sizeRowsFromProduct(p);
  if (sizeRows.length > 0) {
    return totalStockFromSizeRows(sizeRows) <= 0;
  }

  if (typeof p.stock === "number" && p.stock <= 0) return true;
  return false;
}

/** Чи можна відвантажити вказану кількість. */
export function canFulfillQuantity(
  p: StockCheckInput | null | undefined,
  quantity: number
): boolean {
  if (!p) return false;
  if (p.in_stock === false) return false;
  if (p.in_stock === true) return true;

  const sizeRows = sizeRowsFromProduct(p);
  if (sizeRows.length > 0) {
    return totalStockFromSizeRows(sizeRows) >= quantity;
  }

  const s = typeof p.stock === "number" ? p.stock : 0;
  return s >= quantity;
}
