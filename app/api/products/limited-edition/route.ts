import { sqlGetLimitedEditionProducts } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await sqlGetLimitedEditionProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch limited edition products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 15 minutes (limited edition is very stable)
export const revalidate = 900;

