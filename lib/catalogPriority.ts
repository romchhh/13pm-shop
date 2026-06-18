/** Порядковий пріоритет: 1 вище за 2; 0 — без місця (в кінці списку). */
export const CATALOG_PRIORITY_HINT =
  "Порядковий номер у списку: 1 — найвище, 2 — нижче. 0 — без пріоритету (в кінці). Натисніть іконку збереження.";

export function parseCatalogPriority(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) return null;
  return n;
}

function catalogPrioritySortKey(priority: number | null | undefined): number {
  const n = priority ?? 0;
  return n === 0 ? Number.MAX_SAFE_INTEGER : n;
}

export function compareByCatalogPriority<
  T extends { priority?: number | null; id?: number | null },
>(a: T, b: T): number {
  const priorityDiff =
    catalogPrioritySortKey(a.priority) - catalogPrioritySortKey(b.priority);
  if (priorityDiff !== 0) return priorityDiff;
  return (b.id ?? 0) - (a.id ?? 0);
}
