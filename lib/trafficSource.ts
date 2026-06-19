export type TrafficSourceType =
  | "direct"
  | "organic"
  | "referral"
  | "social"
  | "campaign";

const ORGANIC_HOST_PARTS = [
  "google.",
  "bing.",
  "yahoo.",
  "duckduckgo.",
  "yandex.",
  "baidu.",
];

const SOCIAL_HOST_PARTS = [
  "instagram.",
  "facebook.",
  "fb.",
  "tiktok.",
  "t.me",
  "telegram.",
  "twitter.",
  "x.com",
  "youtube.",
  "linkedin.",
  "pinterest.",
  "threads.net",
];

function normalizeHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function hostMatches(hostname: string, parts: string[]): boolean {
  const host = normalizeHost(hostname);
  return parts.some((part) => host.includes(part));
}

export function classifyTrafficSource(params: {
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  siteHost?: string | null;
}): { sourceType: TrafficSourceType; referrerHost: string | null } {
  const { referrer, utmSource, utmMedium, siteHost } = params;
  const medium = utmMedium?.toLowerCase().trim();

  if (
    utmSource?.trim() ||
    medium === "cpc" ||
    medium === "ppc" ||
    medium === "paid" ||
    medium === "paid_social"
  ) {
    return {
      sourceType: "campaign",
      referrerHost: utmSource?.toLowerCase().trim() ?? null,
    };
  }

  if (!referrer?.trim()) {
    return { sourceType: "direct", referrerHost: null };
  }

  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return { sourceType: "referral", referrerHost: null };
  }

  const normalizedSiteHost = siteHost ? normalizeHost(siteHost) : null;
  if (normalizedSiteHost && normalizeHost(host) === normalizedSiteHost) {
    return { sourceType: "direct", referrerHost: null };
  }

  if (hostMatches(host, ORGANIC_HOST_PARTS)) {
    return { sourceType: "organic", referrerHost: normalizeHost(host) };
  }

  if (hostMatches(host, SOCIAL_HOST_PARTS)) {
    return { sourceType: "social", referrerHost: normalizeHost(host) };
  }

  return { sourceType: "referral", referrerHost: normalizeHost(host) };
}

export const TRAFFIC_SOURCE_LABELS: Record<TrafficSourceType, string> = {
  direct: "Прямі заходи",
  organic: "Пошук (Google тощо)",
  referral: "Посилання з сайтів",
  social: "Соцмережі",
  campaign: "Реклама / UTM",
};

export const LINK_TRAFFIC_SOURCES: TrafficSourceType[] = [
  "referral",
  "social",
  "campaign",
];
