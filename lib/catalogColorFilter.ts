import { parseColorOptions, type ProductColorOption } from "@/lib/productOptions";

/** ID з UI фільтра каталогу → відповідність hex / назві кольору товару */
const COLOR_RULES: Record<
  string,
  { hexPrefixes?: string[]; nameIncludes?: string[] }
> = {
  black: {
    hexPrefixes: ["#000", "#111", "#1a1", "#222", "#333"],
    nameIncludes: ["чорн", "black", "графіт", "антрацит"],
  },
  white: {
    hexPrefixes: ["#fff", "#f5f", "#f8f", "#faf", "#eee", "#e8e"],
    nameIncludes: ["біл", "white", "крем", "айворі", "молоч"],
  },
  brown: {
    hexPrefixes: ["#5c4", "#8b5", "#6b4", "#4a3", "#3d1", "#7a5", "#a67"],
    nameIncludes: ["коричн", "дуб", "горіх", "brown", "wood", "дерев", "венге", "горіх"],
  },
  orange: {
    hexPrefixes: ["#e8a", "#f0a", "#d4a", "#c9a", "#ffb", "#ffa"],
    nameIncludes: ["помаранч", "orange", "беж", "пісоч", "карамел", "медов"],
  },
};

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase().replace(/^#/, "");
}

function hexMatchesPrefix(hex: string, prefix: string): boolean {
  const h = normalizeHex(hex);
  const p = prefix.replace(/^#/, "").toLowerCase();
  return h.startsWith(p);
}

function optionMatchesRule(opt: ProductColorOption, filterId: string): boolean {
  const rule = COLOR_RULES[filterId];
  if (!rule) return false;
  const name = opt.name.toLowerCase();
  if (rule.nameIncludes?.some((kw) => name.includes(kw))) return true;
  if (rule.hexPrefixes?.some((p) => hexMatchesPrefix(opt.hex, p))) return true;
  return false;
}

export function productMatchesColorFilter(
  colorOptionsRaw: unknown,
  filterId: string | null
): boolean {
  if (!filterId) return true;
  const options = parseColorOptions(colorOptionsRaw);
  if (options.length === 0) return false;
  return options.some((opt) => optionMatchesRule(opt, filterId));
}

export const CATALOG_COLOR_SWATCH_IDS = ["black", "white", "brown", "orange"] as const;
