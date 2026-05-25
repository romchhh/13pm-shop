import { getDiscountedPrice } from "@/lib/pricing";
import type { ProductColorOption } from "@/lib/productOptions";

/** Доплата за білий колір (вироби з фанери з опцією «білий» у палітрі). */
export const WHITE_COLOR_SURCHARGE_UAH = 150;

const WHITE_NAME_KEYWORDS = ["біл", "white", "крем", "айворі", "молоч"];
const WHITE_HEX_PREFIXES = ["fff", "f5f", "f8f", "faf", "eee", "e8e"];

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase().replace(/^#/, "");
}

/** Чи цей варіант кольору вважається «білим» (назва або hex з адмінки). */
export function isWhiteColorOption(opt: ProductColorOption): boolean {
  const name = opt.name.trim().toLowerCase();
  if (WHITE_NAME_KEYWORDS.some((kw) => name.includes(kw))) return true;
  const h = normalizeHex(opt.hex);
  return WHITE_HEX_PREFIXES.some((p) => h.startsWith(p));
}

/** У товару є опція білого кольору в палітрі (тоді застосовується доплата). */
export function productOffersWhiteColor(colorOptions: ProductColorOption[]): boolean {
  return colorOptions.some(isWhiteColorOption);
}

/** Індекс кольору за замовчуванням: перший небілий, інакше 0. */
export function getDefaultColorIndex(colorOptions: ProductColorOption[]): number {
  if (colorOptions.length === 0) return 0;
  const firstNonWhite = colorOptions.findIndex((c) => !isWhiteColorOption(c));
  return firstNonWhite >= 0 ? firstNonWhite : 0;
}

export type ProductMaterialTexts = {
  /** «Короткий опис (на сторінці товару)» в адмінці */
  description?: string | null;
  /** «Детальний опис» в адмінці (вкладка «Деталі») */
  short_description?: string | null;
  main_info?: string | null;
};

const MATERIAL_LINE = /^\s*(?:матеріал|material)\s*:\s*(.+)$/i;

/** Чи в описі товару вказано матеріал з фанери (рядок «Матеріал: …»). */
export function productHasPlywoodMaterial(texts: ProductMaterialTexts): boolean {
  const fields = [texts.description, texts.short_description, texts.main_info];
  for (const raw of fields) {
    if (!raw?.trim()) continue;
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(MATERIAL_LINE);
      if (match && /фанер/i.test(match[1])) return true;
    }
  }
  return false;
}

/** Доплата в грн: білий колір + матеріал «фанера» в описі товару. */
export function getWhiteColorSurcharge(
  selectedColorName: string | undefined,
  colorOptions: ProductColorOption[],
  materialTexts: ProductMaterialTexts
): number {
  if (!selectedColorName?.trim() || colorOptions.length === 0) return 0;
  if (!productHasPlywoodMaterial(materialTexts)) return 0;
  if (!productOffersWhiteColor(colorOptions)) return 0;

  const selected = colorOptions.find(
    (c) => c.name.trim().toLowerCase() === selectedColorName.trim().toLowerCase()
  );
  if (!selected || !isWhiteColorOption(selected)) return 0;

  return WHITE_COLOR_SURCHARGE_UAH;
}

/** Ціна одиниці зі знижкою та доплатою за колір (для відображення та кошика). */
export function getUnitPriceWithColor(
  basePrice: number,
  discountPercentage: number | null | undefined,
  selectedColorName: string | undefined,
  colorOptions: ProductColorOption[],
  materialTexts: ProductMaterialTexts
): number {
  const base = Math.round(getDiscountedPrice(basePrice, discountPercentage));
  return base + getWhiteColorSurcharge(selectedColorName, colorOptions, materialTexts);
}
