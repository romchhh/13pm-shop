import { sqlGetTopSaleProducts } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await sqlGetTopSaleProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch top sale products" },
      { status: 500 }
    );
  }
}

