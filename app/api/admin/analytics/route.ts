import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/adminAnalytics";

/**
 * GET /api/admin/analytics
 * Агрегована аналітика для головного дашборду.
 */
export async function GET() {
  try {
    const data = await getAdminAnalytics();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[admin/analytics]", error);
    return NextResponse.json(
      { error: "Не вдалося завантажити аналітику" },
      { status: 500 }
    );
  }
}
