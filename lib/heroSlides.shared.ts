/** Клієнт-безпечні типи та хелпери для hero-слайдів (без Prisma/pg). */

export type HeroSlideData = {
  id: number;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
};

export const DEFAULT_HERO_MOBILE_IMAGE = "/IMG_5273.PNG";
export const DEFAULT_HERO_DESKTOP_IMAGE = "/IMG_5342.PNG";

export const DEFAULT_HERO_SLIDES: HeroSlideData[] = [
  {
    id: 0,
    title: "МАГАЗИН\nТАКТИЧНОГО\nОДЯГУ",
    subtitle: "Куртки, штани, футболки та худі власного виробництва.",
    desktopImage: DEFAULT_HERO_DESKTOP_IMAGE,
    mobileImage: DEFAULT_HERO_MOBILE_IMAGE,
  },
];

export function resolveHeroImageSrc(url: string): string {
  if (!url) return DEFAULT_HERO_DESKTOP_IMAGE;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/api/images/${url}`;
}
