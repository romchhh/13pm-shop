export const GA4_CURRENCY = "UAH";
export const GA4_BRAND = "13pm tactic";
export const GA4_VERTICAL = "retail";

type GA4EcommerceItem = Record<string, unknown>;

type GA4EcommercePayload = {
  currency?: string;
  value?: number;
  transaction_id?: string;
  items: GA4EcommerceItem[];
};

function getDataLayer(): unknown[] {
  if (typeof window === "undefined") return [];
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  return w.dataLayer;
}

export function pushGA4EcommerceEvent(eventName: string, ecommerce: GA4EcommercePayload) {
  if (typeof window === "undefined") return;

  const w = window as Window & { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", eventName, ecommerce);
  }

  const dataLayer = getDataLayer();
  dataLayer.push({ ecommerce: null });
  dataLayer.push({ event: eventName, ecommerce });
}

