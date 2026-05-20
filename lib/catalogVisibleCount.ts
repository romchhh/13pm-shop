/** Крок сітки каталогу: мобільна 2 колонки, десктоп 3. */
export const CATALOG_GRID_STEP_MOBILE = 2;
export const CATALOG_GRID_STEP_DESKTOP = 3;

/** Скільки карток додавати по «Показати ще» (3 ряди). */
export const CATALOG_PAGE_SIZE_MOBILE = 6;
export const CATALOG_PAGE_SIZE_DESKTOP = 9;

export function catalogInitialVisibleCount(isDesktop: boolean): number {
  return isDesktop ? CATALOG_PAGE_SIZE_DESKTOP : CATALOG_PAGE_SIZE_MOBILE;
}

export function catalogLoadMoreIncrement(isDesktop: boolean): number {
  return isDesktop ? CATALOG_PAGE_SIZE_DESKTOP : CATALOG_PAGE_SIZE_MOBILE;
}

function floorToGridStep(count: number, step: number): number {
  if (count <= 0 || step <= 0) return 0;
  return Math.floor(count / step) * step;
}

/**
 * Перед «Показати ще» — парна кількість (моб) / кратна 3 (десктоп).
 * Коли показуємо весь список — усі товари, навіть якщо ряд неповний.
 */
export function getCatalogAlignedVisibleCount(
  visibleCount: number,
  total: number,
  isDesktop: boolean
): number {
  if (total <= 0) return 0;
  if (visibleCount >= total) return total;

  const step = isDesktop ? CATALOG_GRID_STEP_DESKTOP : CATALOG_GRID_STEP_MOBILE;
  const aligned = floorToGridStep(visibleCount, step);
  if (aligned > 0) return aligned;
  return Math.min(step, total);
}

export function catalogHasMoreToShow(
  visibleCount: number,
  total: number,
  isDesktop: boolean
): boolean {
  return getCatalogAlignedVisibleCount(visibleCount, total, isDesktop) < total;
}
