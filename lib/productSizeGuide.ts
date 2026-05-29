/** Таблиці розмірів за категоріями (public/images/sizes). */
export const SIZE_GUIDE_IMAGES = {
  fleece: "/images/sizes/572125173_18092063218890354_8034513842016664870_n..jpg",
  shirts: "/images/sizes/574217509_18083800967098902_2181439777472061847_n..jpg",
  pants: "/images/sizes/706890989_17927900334312501_3463101373314357686_n..jpg",
} as const;

type SizeGuideKey = keyof typeof SIZE_GUIDE_IMAGES;

function normalizeCategoryText(
  categoryName?: string | null,
  categorySlug?: string | null,
  subcategoryName?: string | null
): { name: string; slug: string } {
  return {
    name: `${categoryName ?? ""} ${subcategoryName ?? ""}`.toLowerCase().trim(),
    slug: (categorySlug ?? "").toLowerCase().trim(),
  };
}

const CATEGORY_RULES: {
  key: SizeGuideKey;
  match: (ctx: { name: string; slug: string }) => boolean;
}[] = [
  {
    key: "fleece",
    match: ({ name, slug }) =>
      slug === "flisova-kofta" || /фліс/.test(name) || /flis/.test(slug),
  },
  {
    key: "shirts",
    match: ({ name, slug }) =>
      slug === "ubacs" || /сороч/.test(name) || /ubacs|убакс/.test(name),
  },
  {
    key: "pants",
    match: ({ name, slug }) => slug === "shtany" || /штан/.test(name) || /shtan/.test(slug),
  },
];

/** URL таблиці розмірів для категорії товару або null, якщо немає. */
export function getProductSizeGuideImage(
  categoryName?: string | null,
  categorySlug?: string | null,
  subcategoryName?: string | null
): string | null {
  const ctx = normalizeCategoryText(categoryName, categorySlug, subcategoryName);
  for (const { key, match } of CATEGORY_RULES) {
    if (match(ctx)) return SIZE_GUIDE_IMAGES[key];
  }
  return null;
}
