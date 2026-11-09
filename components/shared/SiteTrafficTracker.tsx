"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  captureUtmInSession,
  getStoredUtmAttribution,
  LANDING_UTM_STORAGE_KEY,
} from "@/lib/utmAttribution";

const VISITOR_KEY = "site_visitor_id";
const SESSION_KEY = "site_traffic_session_id";
const LANDING_REFERRER_KEY = "site_landing_referrer";
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

function getLandingData(): { referrer: string | null; utm: LandingUtm } {
  const storedReferrer = sessionStorage.getItem(LANDING_REFERRER_KEY);
  const attribution = captureUtmInSession(window.location.search);
  // Для аналітики — camelCase; у sessionStorage також snake_case через captureUtmInSession
  const utm: LandingUtm = {
    utmSource: attribution.utm_source ?? null,
    utmMedium: attribution.utm_medium ?? null,
    utmCampaign: attribution.utm_campaign ?? null,
  };

  if (storedReferrer !== null) {
    const stored = getStoredUtmAttribution();
    return {
      referrer: storedReferrer || null,
      utm: {
        utmSource: stored.utm_source ?? utm.utmSource,
        utmMedium: stored.utm_medium ?? utm.utmMedium,
        utmCampaign: stored.utm_campaign ?? utm.utmCampaign,
      },
    };
  }

  const referrer = document.referrer || null;
  sessionStorage.setItem(LANDING_REFERRER_KEY, referrer ?? "");
  // Дублюємо camelCase для сумісності зі старим форматом трекера
  try {
    sessionStorage.setItem(
      LANDING_UTM_STORAGE_KEY,
      JSON.stringify({
        ...attribution,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
      })
    );
  } catch {
    /* ignore */
  }
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
