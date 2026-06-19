import { NextResponse } from "next/server";
import { trackSiteVisit } from "@/lib/siteTraffic";

type TrackBody = {
  sessionId?: string;
  visitorId?: string;
  path?: string;
  heartbeat?: boolean;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview/i.test(userAgent);
}

/**
 * POST /api/analytics/track
 * Публічний endpoint: перший візит сесії + heartbeat для «зараз онлайн».
 */
export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get("user-agent");
    if (isBot(userAgent)) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    const body = (await request.json()) as TrackBody;
    const sessionId = body.sessionId?.trim();
    const visitorId = body.visitorId?.trim();
    const path = body.path?.trim() || "/";

    if (!sessionId || !visitorId || sessionId.length > 64 || visitorId.length > 64) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await trackSiteVisit({
      sessionId,
      visitorId,
      path: path.slice(0, 500),
      heartbeat: Boolean(body.heartbeat),
      referrer: body.referrer?.slice(0, 2000) ?? null,
      utmSource: body.utmSource?.slice(0, 200) ?? null,
      utmMedium: body.utmMedium?.slice(0, 200) ?? null,
      utmCampaign: body.utmCampaign?.slice(0, 200) ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics/track]", error);
    return NextResponse.json({ error: "Track failed" }, { status: 500 });
  }
}
