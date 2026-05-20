/** Промокод зі сторінки кошика переноситься на оформлення через sessionStorage. */

const KEY = "plywood_checkout_promo";

export type StoredCartPromo = {
  code: string;
  promoCodeId: number;
  discountAmount: number;
  message?: string;
};

export function saveCartPromo(data: StoredCartPromo): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function loadCartPromo(): StoredCartPromo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredCartPromo;
    if (
      p &&
      typeof p.code === "string" &&
      typeof p.promoCodeId === "number" &&
      typeof p.discountAmount === "number"
    ) {
      return p;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function clearCartPromo(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
