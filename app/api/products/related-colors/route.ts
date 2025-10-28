import { NextResponse } from "next/server";
import { sqlGetRelatedColorsByName } from "@/lib/sql"; // adjust import to match your folder structure

// =========================
// GET /api/products/related-colors?name=SomeName
// =========================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { error: "Missing 'name' query parameter" },
        { status: 400 }
      );
    }

    const related = await sqlGetRelatedColorsByName(name);

    return NextResponse.json(related, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[GET /products/related-colors]", error);
    return NextResponse.json(
      { error: "Failed to fetch related color variants" },
      { status: 500 }
    );
  }
}
