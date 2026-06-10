/**
 * JSON на Product: colorOptions, sizeVariants.
 * sizeVariants — або склад по розмірах (одяг), або legacy-посилання на інші товари.
 */

export type ProductColorOption = {
  hex: string;
  name: string;
};

/** Розмір одягу з кількістю на складі */
export type ProductSizeStock = {
  label: string;
  stock: number;
};

/** Legacy: окремий товар на кожен розмір */
export type ProductSizeVariant = {
  label: string;
  productId: number;
  slug?: string | null;
};

const VALID_HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

/** Швидке додавання розмірів у адмінці (створення / редагування товару). */
export const APPAREL_ADMIN_PRESET_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "2XL",
  "3XL",
  "4XL",
] as const;

/** Повний ряд розмірів на сторінці товару (S–4XL). */
export const APPAREL_PDP_SIZE_RANGE = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"] as const;

/** Нормалізація підпису розміру для порівняння (2XL ≈ XXL). */
export function normalizeApparelSizeLabel(label: string): string {
  const upper = label.trim().toUpperCase().replace(/\s+/g, "");
  if (upper === "2XL" || upper === "XXL") return "XXL";
  if (upper === "3XL" || upper === "XXXL") return "3XL";
  return upper;
}

const APPAREL_SIZE_ORDER = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
] as const;

function normalizeHex(raw: string): string {
  const t = raw.trim();
  const h = t.startsWith("#") ? t : `#${t}`;
  return VALID_HEX.test(h) ? h : "#888888";
}

export function parseColorOptions(raw: unknown): ProductColorOption[] {
  if (!Array.isArray(raw)) return [];
  const out: ProductColorOption[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    if (!name) continue;
    const hexRaw = typeof o.hex === "string" ? o.hex.trim() : "#888888";
    out.push({ hex: normalizeHex(hexRaw), name });
  }
  return out;
}

export function isLegacyLinkedSizeVariants(raw: unknown): boolean {
  if (!Array.isArray(raw) || raw.length === 0) return false;
  return raw.some((x) => {
    if (!x || typeof x !== "object") return false;
    const o = x as Record<string, unknown>;
    const productId = typeof o.productId === "number" ? o.productId : Number(o.productId);
    return Number.isInteger(productId) && productId > 0;
  });
}

export function parseSizeStock(raw: unknown): ProductSizeStock[] {
  if (!Array.isArray(raw) || isLegacyLinkedSizeVariants(raw)) return [];
  const out: ProductSizeStock[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const label = typeof o.label === "string" ? o.label.trim() : "";
    if (!label) continue;
    const stockRaw = typeof o.stock === "number" ? o.stock : Number(o.stock);
    const stock = Number.isFinite(stockRaw) ? Math.max(0, Math.round(stockRaw)) : 0;
    out.push({ label, stock });
  }
  return out;
}

export function parseSizeVariants(raw: unknown): ProductSizeVariant[] {
  if (!isLegacyLinkedSizeVariants(raw)) return [];
  if (!Array.isArray(raw)) return [];
  const out: ProductSizeVariant[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const label = typeof o.label === "string" ? o.label.trim() : "";
    const productId = typeof o.productId === "number" ? o.productId : Number(o.productId);
    if (!label || !Number.isInteger(productId) || productId <= 0) continue;
    const slug =
      o.slug === null || o.slug === undefined
        ? null
        : typeof o.slug === "string"
          ? o.slug.trim() || null
          : null;
    out.push({ label, productId, slug });
  }
  return out;
}

export function serializeColorOptions(colors: ProductColorOption[]): unknown {
  return colors.map((c) => ({ hex: c.hex.trim(), name: c.name.trim() }));
}

export function serializeSizeStock(sizes: ProductSizeStock[]): unknown {
  return sizes
    .filter((s) => s.label.trim())
    .map((s) => ({
      label: s.label.trim(),
      stock: Math.max(0, Math.round(s.stock)),
    }));
}

export function serializeSizeVariants(variants: ProductSizeVariant[]): unknown {
  return variants.map((v) => ({
    label: v.label.trim(),
    productId: v.productId,
    slug: v.slug ?? null,
  }));
}

export const ONE_SIZE_LABEL = "One size";

export function isOneSizeLabel(label: string): boolean {
  const n = label.trim().toUpperCase().replace(/\s+/g, "");
  return n === "ONESIZE";
}

export function sizeStockSortRank(label: string): number {
  if (isOneSizeLabel(label)) return -1;
  const upper = label.trim().toUpperCase();
  const idx = APPAREL_SIZE_ORDER.indexOf(upper as (typeof APPAREL_SIZE_ORDER)[number]);
  if (idx >= 0) return idx;
  const num = Number.parseFloat(label.replace(",", "."));
  if (!Number.isNaN(num)) return 1000 + num;
  return 2000;
}

export function sortSizeStockRows(rows: ProductSizeStock[]): ProductSizeStock[] {
  return [...rows].sort((a, b) => {
    const diff = sizeStockSortRank(a.label) - sizeStockSortRank(b.label);
    if (diff !== 0) return diff;
    return a.label.localeCompare(b.label, "uk", { numeric: true, sensitivity: "base" });
  });
}

/**
 * Доповнює розміри товару до повного ряду S–4XL.
 * Відсутні або з нульовим залишком — stock: 0 (видимі, але не в наявності).
 */
export function expandSizeStockForDisplay(rows: ProductSizeStock[]): ProductSizeStock[] {
  const parsed = sortSizeStockRows(rows.filter((row) => row.label.trim()));
  if (parsed.length === 0) return [];
  if (parsed.length === 1 && isOneSizeLabel(parsed[0].label)) return parsed;

  const stockByKey = new Map<string, number>();
  for (const row of parsed) {
    const key = normalizeApparelSizeLabel(row.label);
    const stock = Math.max(0, row.stock);
    const prev = stockByKey.get(key);
    stockByKey.set(key, prev === undefined ? stock : Math.max(prev, stock));
  }

  return APPAREL_PDP_SIZE_RANGE.map((label) => ({
    label,
    stock: stockByKey.get(normalizeApparelSizeLabel(label)) ?? 0,
  }));
}

export function totalStockFromSizeRows(rows: ProductSizeStock[]): number {
  return rows.reduce((sum, row) => sum + Math.max(0, row.stock), 0);
}

export function productHasSizeStockAvailable(
  rows: ProductSizeStock[],
  selectedLabel?: string | null
): boolean {
  if (rows.length === 0) return true;
  if (selectedLabel) {
    const row = rows.find((r) => r.label === selectedLabel);
    return row ? row.stock > 0 : false;
  }
  return rows.some((r) => r.stock > 0);
}

export type SizeVariantProductInfo = {
  id: number;
  subtitle?: string | null;
  slug?: string | null;
  name?: string | null;
};

/** Build size pills from linked products; label = subtitle or name. */
export function buildSizeVariantsForGroup(
  products: SizeVariantProductInfo[],
  orderedIds: number[]
): ProductSizeVariant[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const out: ProductSizeVariant[] = [];
  for (const id of orderedIds) {
    const p = byId.get(id);
    if (!p) continue;
    const label = (p.subtitle?.trim() || p.name?.trim() || "").trim();
    if (!label) continue;
    out.push({
      label,
      productId: id,
      slug: p.slug?.trim() || null,
    });
  }
  return out;
}

export function linkedIdsFromSizeVariants(
  variants: ProductSizeVariant[],
  currentProductId: number
): number[] {
  return variants
    .map((v) => v.productId)
    .filter((id) => id !== currentProductId);
}
