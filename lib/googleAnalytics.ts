/** GA4 measurement ID for https://13pm.com.ua/ (stream 15116168951). */
export const GA_MEASUREMENT_ID = "G-M432701GP3";

/** Google Ads conversion tag ID. */
export const GOOGLE_ADS_ID = "AW-17017770137";

/** Google Ads «Покупка» conversion send_to (AW-ID/label). */
export const GOOGLE_ADS_PURCHASE_SEND_TO =
  "AW-17017770137/25aHCJeasroaEJmh2rI_";

export const GTM_CONTAINER_ID = "GTM-N98NJ7ST";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Ads conversion «Покупка» — викликати один раз на сторінці успішного замовлення.
 */
export function trackGoogleAdsPurchaseConversion(params: {
  value: number;
  transactionId: string;
  currency?: string;
  email?: string | null;
  phone?: string | null;
}): void {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;

  const email = params.email?.trim();
  const phone = params.phone?.trim();
  if (email || phone) {
    gtag("set", "user_data", {
      ...(email ? { email } : {}),
      ...(phone ? { phone_number: phone } : {}),
    });
  }

  gtag("event", "conversion", {
    send_to: GOOGLE_ADS_PURCHASE_SEND_TO,
    value: Number.isFinite(params.value) ? params.value : 0,
    currency: params.currency ?? "UAH",
    transaction_id: params.transactionId,
  });
}
