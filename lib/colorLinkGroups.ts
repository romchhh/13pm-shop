/**
 * Групи пов’язаних товарів (інші кольори) за pair_together_ids.
 * Зв’язок двосторонній: якщо A → B, то B → A; при збереженні — повний клік лише серед обраних id.
 */

export function normalizePairTogetherIds(
  ids: unknown,
  excludeId?: number
): number[] {
  if (!Array.isArray(ids)) return [];
  return [
    ...new Set(
      ids
        .map((x) => Number(x))
        .filter((n) => Number.isInteger(n) && n > 0 && n !== excludeId)
    ),
  ].sort((a, b) => a - b);
}

/** Ключ групи (усі id учасників, відсортовані). */
export function colorLinkGroupSignature(
  productId: number,
  pairTogetherIds: unknown
): string {
  const ids = normalizePairTogetherIds(pairTogetherIds, undefined);
  const members = [...new Set([productId, ...ids])].sort((a, b) => a - b);
  if (members.length < 2) return `solo:${productId}`;
  return members.join("-");
}

export function isMultiProductColorLinkGroup(
  productId: number,
  pairTogetherIds: unknown
): boolean {
  return colorLinkGroupSignature(productId, pairTogetherIds).includes("-");
}

/**
 * «Група 1», «Група 2», … для товарів з 2+ пов’язаними кольорами.
 */
export function buildColorLinkGroupLabels(
  products: Array<{ id: number; pair_together_ids?: unknown }>
): Map<number, string> {
  const sigSet = new Set<string>();
  for (const p of products) {
    const sig = colorLinkGroupSignature(p.id, p.pair_together_ids);
    if (!sig.includes("-")) continue;
    sigSet.add(sig);
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
    const sig = colorLinkGroupSignature(p.id, p.pair_together_ids);
    const label = sigToLabel.get(sig);
    if (!label) continue;
    const members = sig.split("-").map(Number);
    for (const id of members) {
      out.set(id, label);
    }
  }
  return out;
}
