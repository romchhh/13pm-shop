import { sqlGetLimitedEditionProducts } from "@/lib/sql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await sqlGetLimitedEditionProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch limited edition products" },
      { status: 500 }
    );
  }
}

