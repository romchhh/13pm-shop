/** Пункти головного меню (десктоп і бургер) */
export const mainNavLinks = [
  { label: "Новинки", href: "/catalog?new=1" },
  { label: "Хіти", href: "/catalog?hits=1" },
  { label: "Про нас", href: "/#about" },
  { label: "Контакти", href: "/contacts" },
  { label: "Відгуки", href: "/#reviews" },
] as const;

export type MainNavLink = (typeof mainNavLinks)[number];

export function getMainNavHashId(href: string): "about" | "reviews" | null {
  if (href === "/#about") return "about";
  if (href === "/#reviews") return "reviews";
  return null;
}
