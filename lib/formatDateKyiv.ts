/** Часовий пояс для всіх дат на сайті та в сповіщеннях. */
export const KYIV_TIME_ZONE = "Europe/Kyiv";

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: KYIV_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  timeZone: KYIV_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

/** Дата й час по Києву, напр. `04.10.2026, 16:48:19`. */
export function formatDateTimeKyiv(value: Date | string | number): string {
  return new Date(value).toLocaleString("uk-UA", DATE_TIME_OPTIONS);
}

/** Лише дата по Києву, напр. `04.10.2026`. */
export function formatDateKyiv(value: Date | string | number): string {
  return new Date(value).toLocaleDateString("uk-UA", DATE_OPTIONS);
}
