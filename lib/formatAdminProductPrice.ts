/** Ціна для відображення в адмінці (з урахуванням знижки %). */
export function formatAdminProductPrice(
  price: number,
  discountPercentage?: number | null
): string {
  const base = Number(price);
  if (!Number.isFinite(base)) return "—";
  const pct =
    discountPercentage != null && Number.isFinite(Number(discountPercentage))
      ? Number(discountPercentage)
      : 0;
  const display =
    pct > 0 ? Math.round(base * (1 - pct / 100)) : Math.round(base);
  return `${display.toLocaleString("uk-UA")} грн`;
}
