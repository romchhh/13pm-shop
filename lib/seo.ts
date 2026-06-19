import type { Metadata } from "next";
import {
  SITE_STORE_NAME,
  SITE_WORDMARK,
  siteDefaultOgImageAlt,
  siteMetaDescription,
  siteMetadataIcons,
  siteRootSeoTitle,
  siteSeoKeywords,
} from "@/lib/siteBrand";

import { DEFAULT_HERO_IMAGE } from "@/lib/heroSlides.shared";

/** Шлях до OG-зображення за замовчуванням (1200×630 рекомендовано). */
export const DEFAULT_OG_IMAGE_PATH = DEFAULT_HERO_IMAGE;

const META_DESCRIPTION_MAX = 160;

export function getSiteBaseUrl(): string {
  return (
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteBaseUrl();
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Скорочує текст для meta description (~160 символів). */
export function truncateMetaDescription(
  text: string,
  maxLength = META_DESCRIPTION_MAX
): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  const slice = cleaned.slice(0, maxLength - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

/** ЧПУ для товару: slug або id. */
export function productCanonicalPath(slug: string | null | undefined, id: number): string {
  const s = slug?.trim();
  return `/product/${s || id}`;
}

/** ЧПУ для категорії каталогу. */
export function categoryCanonicalPath(slug: string | null | undefined, name: string): string {
  const s = slug?.trim();
  return `/catalog/${s || encodeURIComponent(name)}`;
}

export type PageSeoInput = {
  /** Заголовок сторінки (без суфікса магазину — додається автоматично). */
  title: string;
  description: string;
  /** Шлях від кореня, напр. `/catalog` */
  path: string;
  imagePath?: string;
  imageAlt?: string;
  keywords?: string;
  noIndex?: boolean;
};

function buildOpenGraph(
  title: string,
  description: string,
  url: string,
  imageUrl: string,
  imageAlt: string
): Metadata["openGraph"] {
  return {
    title,
    description,
    type: "website",
    locale: "uk_UA",
    url,
    siteName: SITE_STORE_NAME,
    images: [
      {
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: imageAlt,
      },
    ],
  };
}

const defaultRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

/** Уніфіковані meta title, description, Open Graph, Twitter, canonical. */
export function buildPageMetadata(input: PageSeoInput): Metadata {
  const baseUrl = getSiteBaseUrl();
  const canonical = absoluteUrl(input.path);
  const fullTitle = input.title.includes(SITE_STORE_NAME)
    ? input.title
    : `${input.title} | ${SITE_STORE_NAME}`;
  const description = truncateMetaDescription(input.description);
  const imageUrl = absoluteUrl(input.imagePath ?? DEFAULT_OG_IMAGE_PATH);
  const imageAlt = input.imageAlt ?? siteDefaultOgImageAlt;

  return {
    title: fullTitle,
    description,
    keywords: input.keywords ?? siteSeoKeywords,
    applicationName: SITE_STORE_NAME,
    authors: [{ name: SITE_STORE_NAME, url: baseUrl }],
    creator: SITE_STORE_NAME,
    publisher: SITE_STORE_NAME,
    category: "shopping",
    metadataBase: new URL(baseUrl),
    openGraph: buildOpenGraph(fullTitle, description, canonical, imageUrl, imageAlt),
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
    alternates: { canonical },
    ...(input.noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: defaultRobots }),
  };
}

/** Кореневі metadata для layout сайту. */
export function buildRootSiteMetadata(): Metadata {
  const baseUrl = getSiteBaseUrl();
  const title = `${SITE_STORE_NAME} — ${siteRootSeoTitle}`;
  const description = siteMetaDescription;
  const imageUrl = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${SITE_STORE_NAME}`,
    },
    description,
    keywords: siteSeoKeywords,
    applicationName: SITE_STORE_NAME,
    authors: [{ name: SITE_STORE_NAME, url: baseUrl }],
    creator: SITE_STORE_NAME,
    publisher: SITE_STORE_NAME,
    category: "shopping",
    openGraph: buildOpenGraph(
      title,
      description,
      baseUrl,
      imageUrl,
      siteDefaultOgImageAlt
    ),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: siteDefaultOgImageAlt }],
    },
    robots: defaultRobots,
    alternates: { canonical: baseUrl },
    icons: siteMetadataIcons,
  };
}

export type ProductSeoInput = {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  subtitle?: string | null;
  price: number;
  discount_percentage?: number | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  first_media?: { url: string; type: string } | null;
};

export function buildProductMetadata(product: ProductSeoInput): Metadata {
  const path = productCanonicalPath(product.slug, product.id);
  const categoryName = product.category_name?.trim() || "тактичний одяг";
  const subcategory = product.subcategory_name?.trim();
  const price = Math.round(Number(product.price));

  const rawDescription =
    product.description?.replace(/[#*_`[\]]/g, " ").trim() ||
    product.subtitle?.trim() ||
    `Купити «${product.name}» — ${categoryName}${subcategory ? `, ${subcategory}` : ""} від ${SITE_STORE_NAME}. Ціна ${price.toLocaleString("uk-UA")} ₴. Власне виробництво в Україні, доставка Нова Пошта.`;

  const imagePath = product.first_media?.url
    ? `/api/images/${product.first_media.url}`
    : DEFAULT_OG_IMAGE_PATH;

  const keywords = [
    product.name,
    SITE_STORE_NAME,
    categoryName,
    subcategory,
    "купити тактичний одяг",
    "тактичний одяг Україна",
    "13pm tactic",
  ]
    .filter(Boolean)
    .join(", ");

  return buildPageMetadata({
    title: `Купити ${product.name}`,
    description: rawDescription,
    path,
    imagePath,
    imageAlt: `${product.name} — тактичний одяг ${SITE_STORE_NAME}, ${categoryName}`,
    keywords,
  });
}

export type CategorySeoInput = {
  name: string;
  slug?: string | null;
  description?: string | null;
};

export function buildCategoryMetadata(category: CategorySeoInput): Metadata {
  const path = categoryCanonicalPath(category.slug, category.name);
  const rawDescription =
    category.description?.replace(/[#*_`[\]]/g, " ").trim() ||
    `Купити ${category.name.toLowerCase()} в каталозі ${SITE_STORE_NAME}. Тактичний одяг власного виробництва в Україні — лінійки ALPHA, BRAVO, DELTA. Доставка по Україні та світу.`;

  return buildPageMetadata({
    title: `${category.name} — купити тактичний одяг`,
    description: rawDescription,
    path,
    imageAlt: `${category.name} — каталог ${SITE_WORDMARK}`,
    keywords: `${category.name}, тактичний одяг, ${SITE_STORE_NAME}, купити ${category.name.toLowerCase()}, Україна`,
  });
}
