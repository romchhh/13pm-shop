import { sqlGetProductsBySubcategoryName } from "@/lib/sql"; // You'll create this
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subcategory = url.searchParams.get("subcategory");

  try {
    if (!subcategory) {
      return NextResponse.json(
        { error: "Missing subcategory parameter" },
        { status: 400 }
      );
    }

    const products = await sqlGetProductsBySubcategoryName(subcategory);
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products by subcategory" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 5 minutes
export const revalidate = 300;
