import { twMerge } from "tailwind-merge";
import { SITE_ACCENT } from "@/lib/siteColors";

/** Акцент бренду на бейджах картки */
export const PRODUCT_CARD_ACCENT = SITE_ACCENT;

/** Корінь картки (Link або обгортка) */
export function productCardRootClass(className?: string): string {
  return twMerge(
    "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]",
    className
  );
}

/** Блок зображення 3:4 */
export function productCardMediaWrapClass(): string {
  return "relative aspect-[3/4] w-full overflow-hidden rounded-t-[1.65rem] bg-[var(--brand-olive-soft)]";
}

export function productCardMediaImageClass(): string {
  return "z-0 object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]";
}

export function productCardMediaVideoClass(): string {
  return "absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]";
}

/** Знижка (−N%) */
export function productCardDiscountBadgeClass(): string {
  return "absolute left-3 top-3 z-20 rounded-full bg-white/95 px-2.5 py-1 font-['Montserrat'] text-[10px] font-semibold text-[var(--brand-olive-dark)] shadow-sm backdrop-blur-sm";
}

/** Бейдж «Новинка» */
export function productCardNewBadgeClass(): string {
  return "absolute left-3 top-3 z-20 rounded-full px-2.5 py-1 font-['Montserrat'] text-[10px] font-bold uppercase text-white shadow-sm";
}

export function productCardFavoriteWrapClass(): string {
  return "absolute right-3 top-3 z-30";
}

export function productCardGiftBadgeClass(): string {
  return "absolute right-3 top-12 z-20 rounded-full border border-[var(--color-border)] bg-white/92 px-2 py-0.5 font-['Montserrat'] text-[10px] font-semibold text-[var(--brand-olive-dark)] shadow-sm backdrop-blur-sm";
}

/** Нижні бейджі (акція, хіт) */
export function productCardBottomBadgesWrapClass(): string {
  return "pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--brand-olive-dark)]/45 to-transparent px-3 pb-3 pt-12";
}

export function productCardBottomBadgesRowClass(): string {
  return "flex flex-wrap gap-1.5";
}

export function productCardPromoBadgeClass(): string {
  return "rounded-full bg-white/95 px-2.5 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase text-[var(--brand-olive-dark)]";
}

export function productCardHitBadgeClass(): string {
  return "rounded-full bg-[var(--brand-olive)] px-2.5 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase text-white";
}

export function productCardInlineNewBadgeClass(): string {
  return "rounded-full px-2.5 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase text-white";
}

/** Тіло картки */
export function productCardBodyClass(): string {
  return "flex flex-1 flex-col p-4 pb-3 sm:p-5 sm:pb-4";
}

export function productCardSubtitleClass(): string {
  return "line-clamp-1 font-['Montserrat'] text-sm text-[var(--color-text-muted)] sm:text-[15px]";
}

export function productCardTitleClass(hasSubtitle: boolean): string {
  return twMerge(
    "font-['Montserrat'] text-base font-semibold leading-snug text-[var(--brand-olive-dark)] line-clamp-2 sm:text-lg",
    hasSubtitle && "mt-1.5"
  );
}

export function productCardPriceRowClass(): string {
  return "mt-auto flex flex-col items-start gap-2 pt-4 sm:flex-row sm:items-end sm:justify-between sm:gap-3";
}

export function productCardStrikePriceClass(): string {
  return "font-['Montserrat'] text-sm text-[var(--color-text-light)] line-through sm:text-[15px]";
}

export function productCardPriceClass(): string {
  return "font-['Montserrat'] text-base font-semibold text-[var(--brand-olive-dark)] sm:text-lg";
}

/** Слот каруселі (головна, кошик, PDP) */
export const productCarouselItemClass =
  "flex-shrink-0 w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-4.5rem)/4)]";
