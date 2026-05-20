import { parseSizeVariants } from "@/lib/productOptions";

/** Унікальні id учасників групи розмірів (відсортовані). */
export function sizeGroupMemberIds(raw: unknown): number[] {
  const v = parseSizeVariants(raw);
  return [...new Set(v.map((x) => x.productId))]
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);
}

/** Чи це група з 2+ товарами (показуємо «Група N»). */
export function isMultiProductSizeGroup(raw: unknown): boolean {
  return sizeGroupMemberIds(raw).length >= 2;
}

/** Ключ однаковий для всіх товарів однієї групи. */
export function sizeGroupSignature(raw: unknown, productId: number): string {
  const ids = sizeGroupMemberIds(raw);
  if (ids.length === 0) return `solo:${productId}`;
  if (ids.length === 1) return `solo:${ids[0]}`;
  return ids.join("-");
}

/**
 * Для кожного товару з групи розмірів (2+ SKU) — «Група 1», «Група 2», …
 * Стабільна нумерація: за мінімальним id у групі.
 */
export function buildSizeGroupLabels(
  products: Array<{ id: number; size_variants?: unknown }>
): Map<number, string> {
  const sigSet = new Set<string>();
  for (const p of products) {
    const raw = p.size_variants ?? [];
    if (!isMultiProductSizeGroup(raw)) continue;
    sigSet.add(sizeGroupSignature(raw, p.id));
  }
  const sigs = [...sigSet].sort((a, b) => {
    const minA = Math.min(...a.split("-").map(Number));
    const minB = Math.min(...b.split("-").map(Number));
    return minA - minB;
  });
  const sigToLabel = new Map<string, string>();
  sigs.forEach((sig, i) => sigToLabel.set(sig, `Група ${i + 1}`));

  const out = new Map<number, string>();
  for (const p of products) {
    const raw = p.size_variants ?? [];
    if (!isMultiProductSizeGroup(raw)) continue;
    const sig = sizeGroupSignature(raw, p.id);
    const label = sigToLabel.get(sig);
    if (label) {
      for (const id of sizeGroupMemberIds(raw)) {
        out.set(id, label);
      }
    }
  }
  return out;
}

export type AdminPickerSection<T> = { sectionTitle: string; items: T[] };

/** Розкладка списку для модалок: спочатку Група 1…N, в кінці «Окремі товари». */
export function groupProductsForAdminPicker<T extends { id: number }>(
  items: T[],
  groupLabels: Map<number, string>
): AdminPickerSection<T>[] {
  const byLabel = new Map<string, T[]>();
  const solo: T[] = [];
  for (const p of items) {
    const l = groupLabels.get(p.id);
    if (l) {
      if (!byLabel.has(l)) byLabel.set(l, []);
      byLabel.get(l)!.push(p);
    } else {
      solo.push(p);
    }
  }
  const sections: AdminPickerSection<T>[] = [];
  const sortedNames = [...byLabel.keys()].sort((a, b) => {
    const na = Number(/\d+/.exec(a)?.[0] ?? 0);
    const nb = Number(/\d+/.exec(b)?.[0] ?? 0);
    return na - nb;
  });
  for (const name of sortedNames) {
    const list = [...byLabel.get(name)!];
    list.sort((x, y) => {
      const nx = String((x as { name?: string }).name ?? "").trim();
      const ny = String((y as { name?: string }).name ?? "").trim();
      const c = nx.localeCompare(ny, "uk");
      return c !== 0 ? c : x.id - y.id;
    });
    sections.push({ sectionTitle: name, items: list });
  }
  if (solo.length) {
    const soloSorted = [...solo].sort((x, y) => {
      const nx = String((x as { name?: string }).name ?? "").trim();
      const ny = String((y as { name?: string }).name ?? "").trim();
      const c = nx.localeCompare(ny, "uk");
      return c !== 0 ? c : x.id - y.id;
    });
    sections.push({ sectionTitle: "Окремі товари", items: soloSorted });
  }
  return sections;
}
