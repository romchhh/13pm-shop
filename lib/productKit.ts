/**
 * Комплекти одягу: окремі розміри (і опційно ціни) для верху та низу.
 */

import {
  findSizeStockRow,
  parseSizeStock,
  serializeSizeStock,
  sortSizeStockRows,
  totalStockFromSizeRows,
  type ProductSizeStock,
} from "@/lib/productOptions";

export type ProductKitOptions = {
  topLabel: string;
  bottomLabel: string;
  top: ProductSizeStock[];
  bottom: ProductSizeStock[];
};

export const DEFAULT_KIT_TOP_LABEL = "Верх";
export const DEFAULT_KIT_BOTTOM_LABEL = "Низ";

export function defaultKitSizeRows(): ProductSizeStock[] {
  return [
    { label: "S", stock: 0 },
    { label: "M", stock: 0 },
    { label: "L", stock: 0 },
    { label: "XL", stock: 0 },
  ];
}

export function defaultKitOptions(): ProductKitOptions {
  return {
    topLabel: DEFAULT_KIT_TOP_LABEL,
    bottomLabel: DEFAULT_KIT_BOTTOM_LABEL,
    top: defaultKitSizeRows(),
    bottom: defaultKitSizeRows(),
  };
}

export function parseKitOptions(raw: unknown): ProductKitOptions | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const top = parseSizeStock(o.top);
  const bottom = parseSizeStock(o.bottom);
  if (top.length === 0 && bottom.length === 0) return null;
  const topLabel =
    typeof o.topLabel === "string" && o.topLabel.trim()
      ? o.topLabel.trim()
      : DEFAULT_KIT_TOP_LABEL;
  const bottomLabel =
    typeof o.bottomLabel === "string" && o.bottomLabel.trim()
      ? o.bottomLabel.trim()
      : DEFAULT_KIT_BOTTOM_LABEL;
  return {
    topLabel,
    bottomLabel,
    top: sortSizeStockRows(top),
    bottom: sortSizeStockRows(bottom),
  };
}

export function serializeKitOptions(options: ProductKitOptions): unknown {
  return {
    topLabel: options.topLabel.trim() || DEFAULT_KIT_TOP_LABEL,
    bottomLabel: options.bottomLabel.trim() || DEFAULT_KIT_BOTTOM_LABEL,
    top: serializeSizeStock(options.top),
    bottom: serializeSizeStock(options.bottom),
  };
}

/** Рядок розміру для кошика / замовлення: `Верх: S / Низ: M`. */
export function formatKitSizeLabel(
  topSize: string,
  bottomSize: string,
  topLabel = DEFAULT_KIT_TOP_LABEL,
  bottomLabel = DEFAULT_KIT_BOTTOM_LABEL
): string {
  return `${topLabel.trim() || DEFAULT_KIT_TOP_LABEL}: ${topSize.trim()} / ${bottomLabel.trim() || DEFAULT_KIT_BOTTOM_LABEL}: ${bottomSize.trim()}`;
}

export function parseKitSizeLabel(
  size: string
): { topLabel: string; topSize: string; bottomLabel: string; bottomSize: string } | null {
  const m = size
    .trim()
    .match(/^(.+?):\s*(.+?)\s*\/\s*(.+?):\s*(.+)$/);
  if (!m) return null;
  const topLabel = m[1]!.trim();
  const topSize = m[2]!.trim();
  const bottomLabel = m[3]!.trim();
  const bottomSize = m[4]!.trim();
  if (!topSize || !bottomSize) return null;
  return { topLabel, topSize, bottomLabel, bottomSize };
}

export function kitPartPrice(row: ProductSizeStock | undefined): number | null {
  if (!row) return null;
  if (row.price == null || !Number.isFinite(row.price)) return null;
  return Math.max(0, Math.round(row.price));
}

/** Ціна комплекту: сума цін частин, якщо обидві задані; інакше базова ціна товару. */
export function resolveKitUnitPrice(
  basePrice: number,
  options: ProductKitOptions,
  topSize: string,
  bottomSize: string
): number {
  const top = findSizeStockRow(options.top, topSize);
  const bottom = findSizeStockRow(options.bottom, bottomSize);
  const topP = kitPartPrice(top);
  const bottomP = kitPartPrice(bottom);
  if (topP != null && bottomP != null) {
    return topP + bottomP;
  }
  return Math.max(0, Math.round(Number(basePrice) || 0));
}

export function kitComboAvailable(
  options: ProductKitOptions,
  topSize: string,
  bottomSize: string,
  productInStock?: boolean | null
): boolean {
  const top = findSizeStockRow(options.top, topSize);
  const bottom = findSizeStockRow(options.bottom, bottomSize);
  if (!top || !bottom) return false;
  if (productInStock === true) return true;
  return top.stock > 0 && bottom.stock > 0;
}

export function availableKitComboStock(
  options: ProductKitOptions,
  topSize: string,
  bottomSize: string,
  productInStock?: boolean | null
): number {
  const top = findSizeStockRow(options.top, topSize);
  const bottom = findSizeStockRow(options.bottom, bottomSize);
  if (!top || !bottom) return 0;
  if (productInStock === true && top.stock <= 0 && bottom.stock <= 0) {
    return 99;
  }
  return Math.min(Math.max(0, top.stock), Math.max(0, bottom.stock));
}

/** Для каталогу / загального stock: об’єднані підписи розмірів. */
export function flattenKitSizesForCatalog(options: ProductKitOptions): ProductSizeStock[] {
  const map = new Map<string, ProductSizeStock>();
  for (const row of [...options.top, ...options.bottom]) {
    const key = row.label.trim().toUpperCase();
    if (!key) continue;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, { label: row.label.trim(), stock: Math.max(0, row.stock) });
    } else {
      map.set(key, {
        label: prev.label,
        stock: Math.max(prev.stock, Math.max(0, row.stock)),
      });
    }
  }
  return sortSizeStockRows([...map.values()]);
}

export function totalKitStock(options: ProductKitOptions): number {
  return Math.min(
    totalStockFromSizeRows(options.top),
    totalStockFromSizeRows(options.bottom)
  );
}
