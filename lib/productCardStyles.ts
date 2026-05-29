import { twMerge } from "tailwind-merge";

/** Акцент бренду на бейджах картки */
export const PRODUCT_CARD_ACCENT = "var(--site-accent)";

/** Корінь картки (Link або обгортка) */
export function productCardRootClass(className?: string): string {
  return twMerge(
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]",
    className
  );
}

/** Блок зображення 3:4 */
export function productCardMediaWrapClass(): string {
  return "relative aspect-[3/4] w-full overflow-hidden bg-[#f5f5f4]";
}

export function productCardMediaImageClass(): string {
  return "z-0 object-cover transition-transform duration-300 group-hover:scale-[1.03]";
}

export function productCardMediaVideoClass(): string {
  return "absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]";
}

/** Знижка (−N%) */
export function productCardDiscountBadgeClass(): string {
  return "absolute left-2 top-2 z-20 rounded bg-amber-100/90 px-1.5 py-0.5 font-['Montserrat'] text-[10px] font-semibold text-amber-800/95";
}

/** Бейдж «Новинка» */
export function productCardNewBadgeClass(): string {
  return "absolute left-2 top-2 z-20 rounded-md px-2 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase text-white";
}

export function productCardFavoriteWrapClass(): string {
  return "absolute right-2 top-2 z-30";
}

export function productCardGiftBadgeClass(): string {
  return "absolute right-2 top-12 z-20 rounded border border-[#1C1C1C]/15 bg-white/90 px-1.5 py-0.5 font-['Montserrat'] text-[10px] font-semibold text-[#1C1C1C] shadow-sm";
}

/** Нижні бейджі (акція, хіт) */
export function productCardBottomBadgesWrapClass(): string {
  return "pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/35 to-transparent px-2 pb-2 pt-10";
}

export function productCardBottomBadgesRowClass(): string {
  return "flex flex-wrap gap-1.5";
}

export function productCardPromoBadgeClass(): string {
  return "rounded-md bg-white/95 px-2 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase text-[#1C1C1C]";
}

export function productCardHitBadgeClass(): string {
  return "rounded-md bg-[var(--site-accent)] px-2 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase text-white";
}

export function productCardInlineNewBadgeClass(): string {
  return "rounded-md px-2 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase text-white";
}

/** Тіло картки */
export function productCardBodyClass(): string {
  return "flex flex-1 flex-col p-4 pb-3 sm:pb-4";
}

export function productCardSubtitleClass(): string {
  return "line-clamp-1 font-['Montserrat'] text-sm text-black/50 sm:text-[15px]";
}

export function productCardTitleClass(hasSubtitle: boolean): string {
  return twMerge(
    "font-['Montserrat'] text-base font-semibold leading-snug text-black line-clamp-2 sm:text-lg",
    hasSubtitle && "mt-1.5"
  );
}

/** До lg картка вузька (2 в ряд у каталозі / каруселі) — ціна над кнопкою. */
export function productCardPriceRowClass(): string {
  return "mt-auto flex w-full flex-col items-stretch gap-2 pt-4 lg:flex-row lg:items-end lg:justify-between lg:gap-3";
}

export function productCardStrikePriceClass(): string {
  return "font-['Montserrat'] text-sm text-black/40 line-through sm:text-base";
}

export function productCardPriceClass(): string {
  return "font-['Montserrat'] text-lg font-bold text-black sm:text-xl";
}

/** Слот каруселі (головна, кошик, PDP) */
export const productCarouselItemClass =
  "flex-shrink-0 w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-4.5rem)/4)]";
