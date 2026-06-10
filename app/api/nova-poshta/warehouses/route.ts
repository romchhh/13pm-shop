import { NextRequest, NextResponse } from "next/server";
import { searchNovaPoshtaWarehouses } from "@/lib/nova-poshta";

export async function GET(req: NextRequest) {
  const cityRef = req.nextUrl.searchParams.get("cityRef")?.trim() ?? "";
  const cityName = req.nextUrl.searchParams.get("cityName")?.trim() ?? "";
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!cityRef && !cityName) {
    return NextResponse.json({ warehouses: [], error: "Оберіть місто" });
  }

  const { warehouses, error } = await searchNovaPoshtaWarehouses({
    cityRef: cityRef || undefined,
    cityName: cityName || undefined,
    findByString: q || undefined,
    limit: 50,
  });

  return NextResponse.json({ warehouses, error: error ?? null });
}
