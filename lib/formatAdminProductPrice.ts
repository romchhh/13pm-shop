/** Ціна для відображення в адмінці (поле «Ціна» — кінцева). */
export function formatAdminProductPrice(
  price: number,
  _discountPercentage?: number | null
): string {
  const base = Number(price);
  if (!Number.isFinite(base)) return "—";
  return `${Math.round(base).toLocaleString("uk-UA")} грн`;
}
