import { NextRequest, NextResponse } from "next/server";
import { sqlGetCatalogProducts } from "@/lib/sql";
import { apiLogger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/catalog — список для вітрини (без дублів груп розмірів).
 */
export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get("limit");
    const offset = request.nextUrl.searchParams.get("offset");

    let products = await sqlGetCatalogProducts();

    if (limit) {
      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset || "0", 10);
      products = products.slice(offsetNum, offsetNum + limitNum);
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=1200, stale-while-revalidate=2400",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    apiLogger.error("GET", "/api/products/catalog", error);
    return NextResponse.json({ error: "Failed to fetch catalog products" }, { status: 500 });
  }
}
