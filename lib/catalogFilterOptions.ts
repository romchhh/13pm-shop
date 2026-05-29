import {
  parseColorOptions,
  parseSizeStock,
  parseSizeVariants,
  type ProductColorOption,
} from "@/lib/productOptions";

export type CatalogColorFilterOption = {
  key: string;
  hex: string;
  name: string;
};

const SIZE_ORDER = [
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

function normalizeColorKeyPart(value: string): string {
  return value.trim().toLowerCase();
}

export function getCatalogColorKey(color: Pick<ProductColorOption, "hex" | "name">): string {
  return `${normalizeColorKeyPart(color.name)}|${normalizeColorKeyPart(color.hex)}`;
}

export function buildCatalogColorOptions(
  products: Array<{ color_options?: unknown }>
): CatalogColorFilterOption[] {
  const map = new Map<string, CatalogColorFilterOption>();

  for (const product of products) {
    for (const color of parseColorOptions(product.color_options)) {
      const key = getCatalogColorKey(color);
      if (!map.has(key)) {
        map.set(key, { key, hex: color.hex, name: color.name });
      }
    }
  }

  return [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "uk", { sensitivity: "base" })
  );
}

function sizeSortRank(label: string): number {
  const upper = label.trim().toUpperCase();
  const idx = SIZE_ORDER.indexOf(upper as (typeof SIZE_ORDER)[number]);
  if (idx >= 0) return idx;
  const num = Number.parseFloat(label.replace(",", "."));
  if (!Number.isNaN(num)) return 1000 + num;
  return 2000;
}

function collectProductSizeLabels(product: {
  subtitle?: string | null;
  size_variants?: unknown;
}): string[] {
  const labels = new Set<string>();

  for (const row of parseSizeStock(product.size_variants)) {
    if (row.label.trim()) labels.add(row.label.trim());
  }

  if (labels.size === 0) {
    const subtitle = product.subtitle?.trim();
    if (subtitle) labels.add(subtitle);
    for (const variant of parseSizeVariants(product.size_variants)) {
      if (variant.label.trim()) labels.add(variant.label.trim());
    }
  }

  return [...labels];
}

export function buildCatalogSizeOptions(
  products: Array<{ subtitle?: string | null; size_variants?: unknown }>
): string[] {
  const labels = new Set<string>();
  for (const product of products) {
    for (const label of collectProductSizeLabels(product)) {
      labels.add(label);
    }
  }

  return [...labels].sort((a, b) => {
    const rankDiff = sizeSortRank(a) - sizeSortRank(b);
    if (rankDiff !== 0) return rankDiff;
    return a.localeCompare(b, "uk", { numeric: true, sensitivity: "base" });
  });
}

export function productMatchesCatalogColor(
  colorOptionsRaw: unknown,
  selectedKey: string | null
): boolean {
  if (!selectedKey) return true;
  const options = parseColorOptions(colorOptionsRaw);
  if (options.length === 0) return false;
  return options.some((opt) => getCatalogColorKey(opt) === selectedKey);
}

export function productMatchesCatalogSizes(
  product: { subtitle?: string | null; size_variants?: unknown },
  selectedSizes: string[]
): boolean {
  if (selectedSizes.length === 0) return true;
  const labels = collectProductSizeLabels(product);
  return labels.some((label) => selectedSizes.includes(label));
}

export function isLightSwatch(hex: string): boolean {
  const value = hex.trim().toLowerCase();
  if (value.includes("white") || value === "#fff" || value === "#ffffff") return true;
  if (value.startsWith("var(")) return false;
  const raw = value.replace(/^#/, "");
  if (!/^[0-9a-f]{3,8}$/i.test(raw)) return false;
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw.slice(0, 6);
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.72;
}
