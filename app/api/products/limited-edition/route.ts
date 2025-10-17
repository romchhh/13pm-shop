import { sqlGetLimitedEditionProducts } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await sqlGetLimitedEditionProducts();
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch limited edition products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 5 minutes
export const revalidate = 300;

