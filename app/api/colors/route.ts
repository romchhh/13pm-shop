import { sqlGetAllColors } from "@/lib/sql";
import { NextResponse } from "next/server";

// GET /api/colors
export async function GET() {
  try {
    const colors = await sqlGetAllColors();
    return NextResponse.json(colors, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("[GET /colors]", error);
    return NextResponse.json(
      { error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 10 minutes (colors change rarely)
export const revalidate = 600;
