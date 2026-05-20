import { NextResponse } from "next/server";
import { getActiveHeroSlides } from "@/lib/heroSlides";

export const revalidate = 60;

export async function GET() {
  try {
    const slides = await getActiveHeroSlides();
    return NextResponse.json(slides, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
