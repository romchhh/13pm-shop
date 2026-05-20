import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HERO_SLIDES,
  type HeroSlideData,
} from "@/lib/heroSlides.shared";

export type { HeroSlideData } from "@/lib/heroSlides.shared";
export { DEFAULT_HERO_SLIDES, resolveHeroImageSrc } from "@/lib/heroSlides.shared";

function mapRow(row: {
  id: number;
  title: string;
  subtitle: string | null;
  desktopImageUrl: string;
  mobileImageUrl: string;
}): HeroSlideData {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    desktopImage: row.desktopImageUrl,
    mobileImage: row.mobileImageUrl,
  };
}

export async function getActiveHeroSlides(): Promise<HeroSlideData[]> {
  try {
    const rows = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    if (rows.length === 0) return DEFAULT_HERO_SLIDES;
    return rows.map(mapRow);
  } catch {
    return DEFAULT_HERO_SLIDES;
  }
}

export async function getAllHeroSlides() {
  return prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}
