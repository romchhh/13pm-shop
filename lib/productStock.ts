import { findSizeStockRow, parseSizeStock } from "@/lib/productOptions";
import { VIRTUAL_STOCK_WHEN_IN_STOCK } from "@/lib/productAvailability";

/** Доступна кількість для розміру (або загальний stock, якщо розмірів немає). */
export function availableStockForSize(
  product: { stock?: number | null; inStock?: boolean | null; sizeVariants?: unknown },
  size?: string | null
): number {
  if (product.inStock === false) return 0;

  const rows = parseSizeStock(product.sizeVariants);
  if (rows.length > 0) {
    const label = (size ?? "").trim();
    if (!label || label === "—") {
      const total = rows.reduce((sum, row) => sum + Math.max(0, row.stock), 0);
      if (total > 0) return total;
      if (product.inStock === true) return VIRTUAL_STOCK_WHEN_IN_STOCK;
      return 0;
    }
    const row = findSizeStockRow(rows, label);
    if (row && row.stock > 0) return row.stock;
    if (product.inStock === true) return VIRTUAL_STOCK_WHEN_IN_STOCK;
    return row ? 0 : 0;
  }

  if (product.inStock === true) {
    return typeof product.stock === "number" && product.stock > 0
      ? product.stock
      : VIRTUAL_STOCK_WHEN_IN_STOCK;
  }

  return typeof product.stock === "number" ? Math.max(0, product.stock) : 0;
}

export function canFulfillSizeQuantity(
  product: { stock?: number | null; inStock?: boolean | null; sizeVariants?: unknown },
  size: string | undefined,
  quantity: number
): boolean {
  return availableStockForSize(product, size) >= quantity;
}
