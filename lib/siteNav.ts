/** Каталог лише з акційними товарами */
export const CATALOG_PROMO_HREF = "/catalog?promo=1";

/** Пункти головного меню (десктоп і бургер) */
export const mainNavLinks = [
  { label: "Новинки", href: "/catalog?new=1" },
  { label: "BESTSELLERS", href: "/catalog?hits=1" },
  { label: "Акції", href: CATALOG_PROMO_HREF },
  { label: "Про нас", href: "/#about" },
  { label: "Співпраця", href: "/cooperation" },
  { label: "Відгуки", href: "/#reviews" },
] as const;

export type MainNavLink = (typeof mainNavLinks)[number];

export function getMainNavHashId(href: string): "reviews" | "about" | null {
  if (href === "/#reviews") return "reviews";
  if (href === "/#about") return "about";
  return null;
}
