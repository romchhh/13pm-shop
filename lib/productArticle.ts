import { ensureUniqueSlug, textToSlug } from "@/lib/slug";

/** Генерує артикул з назви товару (трансліт + uppercase). */
export function generateProductArticleFromName(name: string): string {
  return textToSlug(name).toUpperCase();
}

export function normalizeProductArticleInput(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Артикул для відображення: з БД або згенерований з назви. */
export function resolveProductArticle(
  article: string | null | undefined,
  name: string
): string {
  return normalizeProductArticleInput(article) ?? generateProductArticleFromName(name);
}

export async function ensureUniqueProductArticle(
  baseArticle: string,
  checkExists: (article: string) => Promise<boolean>
): Promise<string> {
  return ensureUniqueSlug(baseArticle, checkExists);
}

export async function resolveArticleForDatabase(
  articleInput: string | null | undefined,
  productName: string,
  checkExists: (article: string) => Promise<boolean>
): Promise<string> {
  const normalized = normalizeProductArticleInput(articleInput);
  const base = normalized ?? generateProductArticleFromName(productName);
  return ensureUniqueProductArticle(base, checkExists);
}
