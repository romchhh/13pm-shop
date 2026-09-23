/** GA4 measurement ID for https://13pm.com.ua/ (stream 15116168951). */
export const GA_MEASUREMENT_ID = "G-M432701GP3";

/** Google Ads conversion tag ID. */
export const GOOGLE_ADS_ID = "AW-17017770137";

export const GTM_CONTAINER_ID = "GTM-N98NJ7ST";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
