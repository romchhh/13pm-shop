"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const VISITOR_KEY = "site_visitor_id";
const SESSION_KEY = "site_traffic_session_id";
const LANDING_REFERRER_KEY = "site_landing_referrer";
const LANDING_UTM_KEY = "site_landing_utm";
const HEARTBEAT_MS = 45_000;

type LandingUtm = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function getOrCreateStorageId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const id = randomId();
  storage.setItem(key, id);
  return id;
}

function readUtmFromUrl(): LandingUtm {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
  };
}

function getLandingData(): { referrer: string | null; utm: LandingUtm } {
  const storedReferrer = sessionStorage.getItem(LANDING_REFERRER_KEY);
  const storedUtmRaw = sessionStorage.getItem(LANDING_UTM_KEY);

  if (storedReferrer !== null || storedUtmRaw) {
    let utm: LandingUtm = {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    };
    if (storedUtmRaw) {
      try {
        utm = JSON.parse(storedUtmRaw) as LandingUtm;
      } catch {
        // ignore invalid JSON
      }
    }
    return { referrer: storedReferrer, utm };
  }

  const referrer = document.referrer || null;
  const utm = readUtmFromUrl();
  sessionStorage.setItem(LANDING_REFERRER_KEY, referrer ?? "");
  sessionStorage.setItem(LANDING_UTM_KEY, JSON.stringify(utm));
  return { referrer, utm };
}

async function sendTrack(payload: {
  sessionId: string;
  visitorId: string;
  path: string;
  heartbeat: boolean;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Non-critical analytics — ignore network errors.
  }
}

export function SiteTrafficTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSent = useRef(false);
  const idsRef = useRef<{ sessionId: string; visitorId: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visitorId = getOrCreateStorageId(localStorage, VISITOR_KEY);
    const sessionId = getOrCreateStorageId(sessionStorage, SESSION_KEY);
    idsRef.current = { sessionId, visitorId };

    const path =
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    const { referrer, utm } = getLandingData();

    void sendTrack({
      sessionId,
      visitorId,
      path,
      heartbeat: initialSent.current,
      referrer: initialSent.current ? undefined : referrer,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
    });

    initialSent.current = true;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tick = () => {
      const ids = idsRef.current;
      if (!ids || document.visibilityState === "hidden") return;

      const path = window.location.pathname + window.location.search;
      void sendTrack({
        sessionId: ids.sessionId,
        visitorId: ids.visitorId,
        path,
        heartbeat: true,
      });
    };

    const intervalId = window.setInterval(tick, HEARTBEAT_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
