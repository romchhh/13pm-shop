/**
 * Stored on Product.colorOptions (JSON) and Product.sizeVariants (JSON).
 */

export type ProductColorOption = {
  hex: string;
  name: string;
};

export type ProductSizeVariant = {
  label: string;
  productId: number;
  slug?: string | null;
};

const VALID_HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

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

export function parseSizeVariants(raw: unknown): ProductSizeVariant[] {
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

export function serializeSizeVariants(variants: ProductSizeVariant[]): unknown {
  return variants.map((v) => ({
    label: v.label.trim(),
    productId: v.productId,
    slug: v.slug ?? null,
  }));
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

/** Linked product IDs from stored variants (excludes current product). */
export function linkedIdsFromSizeVariants(
  variants: ProductSizeVariant[],
  currentProductId: number
): number[] {
  return variants
    .map((v) => v.productId)
    .filter((id) => id !== currentProductId);
}
