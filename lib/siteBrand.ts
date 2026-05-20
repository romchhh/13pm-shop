import type { Metadata } from "next";

/** Публічна назва магазину (для title, schema.org, юридичних сторінок). */
export const SITE_STORE_NAME = "Plywood Present";

/** Favicon, вкладка браузера, PWA та apple-touch-icon (джерело). */
export const SITE_ICON_PATH = "/images/logos/site-icon.png";

/** Узгоджені іконки для metadata Next.js (сайт + адмінка). */
export const siteMetadataIcons: NonNullable<Metadata["icons"]> = {
  icon: [
    { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: SITE_ICON_PATH, type: "image/png" },
  ],
  shortcut: SITE_ICON_PATH,
  apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
};

/** Словесний знак у хедері/футері (коротка форма). */
export const SITE_WORDMARK = "Plywood Present";

/** Бренд продукції на сайті. */
export const SITE_PRODUCT_BRAND = "Plywood Present";

/** Підзаголовок для title (Н1-стиль у meta title). */
export const siteOfficialRepLine =
  "Дерев'яний декор та іменні подарунки з фанери";

/**
 * Короткий SEO-опис для meta description (бажано до ~160 символів).
 */
export const siteMetaDescription =
  "Plywood Present — іменні подарунки та декор із фанери: рамки, метрики, ключниці, колажі. Власне виробництво в Україні. Доставка Новою Поштою, замовлення онлайн.";

/** Розширений абзац для Open Graph, ai.txt та контексту. */
export const siteFooterLead =
  "Plywood Present — інтернет-магазин дерев'яного декору та подарунків із березової фанери. Фоторамки на замовлення, сімейні метрики, ключниці та унікальні колажі: лазерне різання, гравіювання й ручна збірка. Створюємо затишні подарунки з характером по всій Україні.";

export const siteFooterLegalNote =
  "Інтернет-магазин Plywood Present. Каталог — вироби з натуральної фанери та дерева власного виробництва.";

/** Ключові фрази для meta keywords та внутрішньої узгодженості. */
export const siteSeoKeywords =
  "Plywood Present, подарунки з фанери, дерев'яний декор, іменні подарунки, фоторамки на замовлення, лазерне різання фанери, сувеніри ручної роботи, декор для дому, метрика дитяча дерев'яна, ключниця з фанери, подарунок на день народження, Україна";

/** Підпис до поля «курс» на картках і сторінці товару (якщо використовується в БД). */
export const LABEL_PRODUCT_COURSE = "Термін виготовлення";
export const LABEL_PRODUCT_PACKAGE = "Розміри / фасування";

/** Плашка у хедері про безкоштовну доставку від суми. */
export const LABEL_FREE_DELIVERY_FROM_2000 = "Безкоштовна доставка від 2 000 грн";
