/** Клієнт-безпечні типи та хелпери для hero-слайдів (без Prisma/pg). */

export type HeroSlideData = {
  id: number;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
};

export const DEFAULT_HERO_SLIDES: HeroSlideData[] = [
  {
    id: 0,
    title: "Подарунки з дерева, створені спеціально для Вас",
    subtitle:
      "Іменні вироби, сімейний декор, фоторамки та унікальні подарунки ручної роботи.",
    desktopImage: "/images/pages/hero-desktop.jpg",
    mobileImage: "/images/pages/hero-mobile.jpg",
  },
];

export function resolveHeroImageSrc(url: string): string {
  if (!url) return "/images/pages/hero-desktop.jpg";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/api/images/${url}`;
}
