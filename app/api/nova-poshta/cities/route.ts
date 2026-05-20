import { NextRequest, NextResponse } from "next/server";
import { searchNovaPoshtaCities } from "@/lib/novaPoshta";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  const { cities, error } = await searchNovaPoshtaCities(q);
  return NextResponse.json({ cities, error: error ?? null });
}
