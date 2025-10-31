import { sqlGetAllProducts, sqlGetProductsByCategory } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  try {
    let products;
    if (category) {
      products = await sqlGetProductsByCategory(category);
    } else {
      products = await sqlGetAllProducts();
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 5 minutes
export const revalidate = 300;
