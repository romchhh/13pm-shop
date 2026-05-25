import { parseSizeVariants } from "@/lib/productOptions";
import { isMultiProductSizeGroup } from "@/lib/sizeGroupLabels";

/**
 * ID товару, який показується в каталозі для цієї групи розмірів.
 * Перший у порядку size_variants (як задано в адмінці), інакше мінімальний id у групі.
 */
export function getCatalogRepresentativeId(
  productId: number,
  sizeVariantsRaw: unknown
): number {
  const variants = parseSizeVariants(sizeVariantsRaw);
  const memberIds = [
    ...new Set(variants.map((v) => v.productId).filter((n) => Number.isInteger(n) && n > 0)),
  ];

  if (!isMultiProductSizeGroup(sizeVariantsRaw)) {
    return productId;
  }

  if (variants.length > 0 && variants[0].productId > 0) {
    return variants[0].productId;
  }

  return Math.min(...memberIds);
}

/**
 * Залишає лише представника кожної групи розмірів (2+ SKU).
 * Окремі товари без групи — усі на місці.
 */
export function dedupeCatalogBySizeGroup<T extends { id: number; size_variants?: unknown }>(
  products: T[]
): T[] {
  const out: T[] = [];

  for (const p of products) {
    const repId = getCatalogRepresentativeId(p.id, p.size_variants ?? []);
    if (p.id !== repId) continue;
    out.push(p);
  }

  return out;
}
