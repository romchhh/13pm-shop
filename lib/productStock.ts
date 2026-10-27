import {
  availableKitComboStock,
  parseKitOptions,
  parseKitSizeLabel,
} from "@/lib/productKit";
import { findSizeStockRow, parseSizeStock } from "@/lib/productOptions";
import { VIRTUAL_STOCK_WHEN_IN_STOCK } from "@/lib/productAvailability";

type StockProduct = {
  stock?: number | null;
  inStock?: boolean | null;
  sizeVariants?: unknown;
  isKit?: boolean | null;
  kitOptions?: unknown;
};

/** Доступна кількість для розміру (або комплекту верх/низ). */
export function availableStockForSize(
  product: StockProduct,
  size?: string | null
): number {
  if (product.inStock === false) return 0;

  if (product.isKit) {
    const kit = parseKitOptions(product.kitOptions);
    const parsed = parseKitSizeLabel(size ?? "");
    if (kit && parsed) {
      return availableKitComboStock(
        kit,
        parsed.topSize,
        parsed.bottomSize,
        product.inStock
      );
    }
    if (kit) {
      return Math.min(
        kit.top.reduce((s, r) => s + Math.max(0, r.stock), 0),
        kit.bottom.reduce((s, r) => s + Math.max(0, r.stock), 0)
      );
    }
  }

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
  product: StockProduct,
  size: string | undefined,
  quantity: number
): boolean {
  return availableStockForSize(product, size) >= quantity;
}
