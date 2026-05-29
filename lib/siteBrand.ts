import type { Metadata } from "next";

/** Публічна назва магазину (для title, schema.org, юридичних сторінок). */
export const SITE_STORE_NAME = "13pm tactic";

/** Favicon, вкладка браузера, PWA (джерело). */
export const SITE_ICON_PATH = "/13pm.svg";

/** Узгоджені іконки для metadata Next.js (сайт + адмінка). */
export const siteMetadataIcons: NonNullable<Metadata["icons"]> = {
  icon: [{ url: SITE_ICON_PATH, type: "image/svg+xml" }],
  shortcut: SITE_ICON_PATH,
  apple: [{ url: SITE_ICON_PATH, type: "image/svg+xml" }],
};

/** Словесний знак у хедері/футері (коротка форма). */
export const SITE_WORDMARK = "13pm tactic";

/** Бренд продукції на сайті. */
export const SITE_PRODUCT_BRAND = "13pm tactic";

/** Instagram / TikTok handle */
export const SITE_SOCIAL_HANDLE = "@13pm.tactic";

/** Маркетинговий слоган (UI, не завжди в title). */
export const siteOfficialRepLine = "твій тактичний одяг";

/**
 * Головний SEO title (корінь сайту, ~60 символів).
 */
export const siteRootSeoTitle = "Тактичний одяг в Україні — власне виробництво";

/**
 * Meta description для головної та за замовчуванням (~155 символів).
 */
export const siteMetaDescription =
  "13pm tactic — тактичний одяг власного виробництва в Україні. Лінійки ALPHA, BRAVO та DELTA: куртки, штани, фліс, поло. Доставка Нова Пошта 1–3 дні, −10% для силових структур.";

/** Розширений абзац для Open Graph, schema.org та ai.txt. */
export const siteFooterLead =
  "13pm tactic — тактичний одяг, розроблений для дії та створений для тебе. Власне виробництво в Україні: куртки, штани, флісові кофти, поло та аксесуари для щоденного носіння та професійного використання.";

export const siteFooterLegalNote =
  "Офіційний інтернет-магазин 13pm tactic. Каталог тактичного одягу та аксесуарів власного виробництва в Україні.";

/** Alt для дефолтного OG / hero зображення. */
export const siteDefaultOgImageAlt =
  "13pm tactic — тактичний одяг власного виробництва, колекція ALPHA BRAVO DELTA";

/**
 * Ключові фрази (meta keywords; Google ігнорує, але корисно для внутрішньої узгодженості та деяких систем).
 */
export const siteSeoKeywords = [
  "13pm tactic",
  "13pm.tactic",
  "тактичний одяг",
  "тактичний одяг Україна",
  "tactical clothing Ukraine",
  "тактичні куртки",
  "тактичні штани cargo",
  "тактичне поло",
  "флісова кофта тактична",
  "одяг для ЗСУ",
  "одяг для силових структур",
  "власне виробництво одяг",
  "ALPHA BRAVO DELTA",
  "купити тактичний одяг онлайн",
].join(", ");

/** Підпис до поля «курс» на картках і сторінці товару (якщо використовується в БД). */
export const LABEL_PRODUCT_COURSE = "Термін виготовлення";
export const LABEL_PRODUCT_PACKAGE = "Розміри / фасування";

/** Плашка у хедері про переваги бренду. */
export const LABEL_FREE_DELIVERY_FROM_2000 = "-10% для силових структур · доставка 1–3 дні";

/** Підпис для Telegram-сповіщень */
export const TELEGRAM_BRAND_FOOTER =
  "🏷 <b>13pm tactic</b> | @13pm.tactic\n▪️ розроблено для дії, створено для тебе\n▪️ власне виробництво · доставка по всьому світу";
