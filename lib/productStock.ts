import { parseSizeStock } from "@/lib/productOptions";

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
      return rows.reduce((sum, row) => sum + Math.max(0, row.stock), 0);
    }
    const row = rows.find((r) => r.label === label);
    return row ? Math.max(0, row.stock) : 0;
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
