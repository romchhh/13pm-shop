import { prisma } from "@/lib/prisma";
import {
  classifyTrafficSource,
  LINK_TRAFFIC_SOURCES,
  type TrafficSourceType,
} from "@/lib/trafficSource";

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export type TrackPayload = {
  sessionId: string;
  visitorId: string;
  path: string;
  heartbeat?: boolean;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

export type TrafficSourceStat = {
  type: TrafficSourceType;
  count: number;
};

export type ReferrerStat = {
  host: string;
  count: number;
};

export type AdminTrafficStats = {
  onlineCount: number;
  totalSessions: number;
  linkTrafficCount: number;
  bySource: TrafficSourceStat[];
  topReferrers: ReferrerStat[];
  periodDays: number;
};

function getSiteHost(): string | null {
  const raw =
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
  "";
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export async function trackSiteVisit(payload: TrackPayload): Promise<void> {
  const now = new Date();
  const {
    sessionId,
    visitorId,
    path,
    heartbeat,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
  } = payload;

  const existing = await prisma.siteTrafficSession.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });

  if (existing) {
    await prisma.siteTrafficSession.update({
      where: { id: sessionId },
      data: { lastSeenAt: now, lastPath: path },
    });
    return;
  }

  const siteHost = getSiteHost();
  const { sourceType, referrerHost } = classifyTrafficSource({
    referrer: heartbeat ? null : referrer,
    utmSource,
    utmMedium,
    siteHost,
  });

  await prisma.siteTrafficSession.create({
    data: {
      id: sessionId,
      visitorId,
      lastPath: path,
      landingPath: path,
      sourceType,
      referrerHost,
      referrer: heartbeat ? null : (referrer ?? null),
      utmSource: utmSource ?? null,
      utmMedium: utmMedium ?? null,
      utmCampaign: utmCampaign ?? null,
    },
  });
}

export async function getAdminTrafficStats(
  periodDays: number
): Promise<AdminTrafficStats> {
  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MS);

  const [onlineCount, sessions] = await Promise.all([
    prisma.siteTrafficSession.count({
      where: { lastSeenAt: { gte: onlineSince } },
    }),
    prisma.siteTrafficSession.findMany({
      where: { firstSeenAt: { gte: since } },
      select: {
        sourceType: true,
        referrerHost: true,
        utmSource: true,
      },
    }),
  ]);

  const bySourceMap = new Map<TrafficSourceType, number>();
  const referrerMap = new Map<string, number>();
  let linkTrafficCount = 0;

  for (const session of sessions) {
    const type = session.sourceType as TrafficSourceType;
    bySourceMap.set(type, (bySourceMap.get(type) ?? 0) + 1);

    if (LINK_TRAFFIC_SOURCES.includes(type)) {
      linkTrafficCount += 1;
      const key =
        session.referrerHost ||
        session.utmSource?.toLowerCase().trim() ||
        "невідомо";
      referrerMap.set(key, (referrerMap.get(key) ?? 0) + 1);
    }
  }

  const bySource: TrafficSourceStat[] = (
    ["direct", "organic", "referral", "social", "campaign"] as TrafficSourceType[]
  )
    .map((type) => ({ type, count: bySourceMap.get(type) ?? 0 }))
    .filter((row) => row.count > 0);

  const topReferrers: ReferrerStat[] = [...referrerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([host, count]) => ({ host, count }));

  return {
    onlineCount,
    totalSessions: sessions.length,
    linkTrafficCount,
    bySource,
    topReferrers,
    periodDays,
  };
}
