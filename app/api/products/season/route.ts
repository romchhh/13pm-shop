import { sqlGetAllProducts, sqlGetProductsBySeason } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const season = url.searchParams.get("season");

  try {
    let products;

    if (season) {
      products = await sqlGetProductsBySeason(season);
    } else {
      products = await sqlGetAllProducts();
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 10 minutes
export const revalidate = 600;
