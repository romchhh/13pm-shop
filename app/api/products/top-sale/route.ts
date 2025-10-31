import { sqlGetTopSaleProducts } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await sqlGetTopSaleProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch top sale products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 10 minutes (top sale changes rarely)
export const revalidate = 600;

