import { NextResponse } from "next/server";
import { getAdminTrafficStats } from "@/lib/siteTraffic";

/**
 * GET /api/admin/traffic?days=7
 * Статистика відвідувачів для адмін-панелі.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawDays = Number(searchParams.get("days") ?? "7");
    const periodDays = Number.isFinite(rawDays)
      ? Math.min(90, Math.max(1, Math.round(rawDays)))
      : 7;

    const data = await getAdminTrafficStats(periodDays);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[admin/traffic]", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити статистику трафіку" },
      { status: 500 }
    );
  }
}
