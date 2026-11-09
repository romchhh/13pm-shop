/** Ключ sessionStorage для UTM (узгоджено з SiteTrafficTracker). */
export const LANDING_UTM_STORAGE_KEY = "site_landing_utm";

export type UtmAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
};

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

function clean(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v ? v.slice(0, 200) : undefined;
}

/** Зчитує UTM з URL (browser). */
export function readUtmFromSearch(search: string): UtmAttribution {
  const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
  const out: UtmAttribution = {};
  for (const key of UTM_KEYS) {
    const v = clean(params.get(key));
    if (v) out[key] = v;
  }
  return out;
}

/** Зберігає / мерджить UTM у sessionStorage (перший візит сесії виграє порожні поля). */
export function captureUtmInSession(search = typeof window !== "undefined" ? window.location.search : ""): UtmAttribution {
  if (typeof window === "undefined") return {};
  const fromUrl = readUtmFromSearch(search);
  let stored: UtmAttribution = {};
  try {
    const raw = sessionStorage.getItem(LANDING_UTM_STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as UtmAttribution;
  } catch {
    stored = {};
  }

  const merged: UtmAttribution = { ...stored };
  for (const key of UTM_KEYS) {
    if (!merged[key] && fromUrl[key]) merged[key] = fromUrl[key];
  }

  try {
    sessionStorage.setItem(LANDING_UTM_STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  return merged;
}

/** Читає збережені UTM для відправки з замовленням. */
export function getStoredUtmAttribution(): UtmAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(LANDING_UTM_STORAGE_KEY);
    if (!raw) return captureUtmInSession();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: UtmAttribution = {};
    for (const key of UTM_KEYS) {
      const v = clean(typeof parsed[key] === "string" ? parsed[key] : undefined);
      // підтримка старого формату camelCase з SiteTrafficTracker
      const camel =
        key === "utm_source"
          ? "utmSource"
          : key === "utm_medium"
            ? "utmMedium"
            : key === "utm_campaign"
              ? "utmCampaign"
              : key === "utm_term"
                ? "utmTerm"
                : "utmContent";
      const fromCamel = clean(
        typeof parsed[camel] === "string" ? (parsed[camel] as string) : undefined
      );
      if (v) out[key] = v;
      else if (fromCamel) out[key] = fromCamel;
    }
    return out;
  } catch {
    return {};
  }
}

/** Нормалізація UTM з тіла API (сервер). */
export function normalizeUtmFromBody(body: unknown): UtmAttribution {
  if (!body || typeof body !== "object") return {};
  const src = body as Record<string, unknown>;
  const out: UtmAttribution = {};
  for (const key of UTM_KEYS) {
    const v = clean(typeof src[key] === "string" ? src[key] : undefined);
    if (v) out[key] = v;
  }
  return out;
}
