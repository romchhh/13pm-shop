/** GA4 measurement ID for https://13pm.com.ua/ (stream 15116168951). */
export const GA_MEASUREMENT_ID = "G-M432701GP3";

export const GTM_CONTAINER_ID = "GTM-N98NJ7ST";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
