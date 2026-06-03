import { SITE_STORE_NAME, SITE_WORDMARK } from "@/lib/siteBrand";

/** Централізовані SEO-описи сторінок (українською). */
export const seoCopy = {
  catalog: {
    title: "Каталог тактичного одягу",
    description: `Купити тактичний одяг ${SITE_WORDMARK}: куртки, штани, флісові кофти, поло, комплекти. Лінійки ALPHA, BRAVO, DELTA. Власне виробництво в Україні, доставка Нова Пошта.`,
    imageAlt: `${SITE_WORDMARK} — каталог тактичного одягу в Україні`,
  },
  about: {
    title: "Про нас — виробник тактичного одягу",
    description: `${SITE_STORE_NAME}: власне виробництво тактичного одягу в Україні, лінійки ALPHA, BRAVO, DELTA. Доставка по світу, знижка −10% для силових структур.`,
    imageAlt: `${SITE_STORE_NAME} — про бренд та виробництво`,
  },
  cooperation: {
    title: "Співпраця — опт, пошиття, контакти",
    description: `Оптові закупівлі та співпраця з ${SITE_STORE_NAME}: гурт від 5 од., знижка до 30%, пошиття, дропшипінг. Телефон, форма зворотного звʼязку, Viber, Telegram.`,
    imageAlt: `Співпраця та контакти — ${SITE_STORE_NAME}`,
  },
  delivery: {
    title: "Доставка та оплата",
    description: `Доставка та оплата в ${SITE_STORE_NAME}: Нова Пошта по Україні та світу, накладений платіж, картка, Apple Pay, Google Pay. Терміни, тарифи, безкоштовна доставка від 2000 ₴.`,
    imageAlt: `Доставка та оплата — ${SITE_STORE_NAME}`,
  },
  returns: {
    title: "Повернення та обмін",
    description: `Повернення та обмін тактичного одягу ${SITE_STORE_NAME}: 14 днів, умови, накладений платіж, права споживача згідно із законодавством України.`,
    imageAlt: `Повернення та обмін — ${SITE_STORE_NAME}`,
  },
  cart: {
    title: "Кошик",
    description: `Ваш кошик у ${SITE_STORE_NAME}. Перегляньте обраний тактичний одяг та перейдіть до оформлення замовлення.`,
  },
  favorites: {
    title: "Обране",
    description: `Обрані товари ${SITE_STORE_NAME}. Збережені позиції тактичного одягу для швидкого замовлення.`,
  },
  checkout: {
    title: "Оформлення замовлення",
    description: `Оформлення замовлення тактичного одягу ${SITE_STORE_NAME}: доставка Нова Пошта, оплата онлайн або накладений платіж.`,
  },
  privacy: {
    title: "Політика конфіденційності",
    description: `Політика конфіденційності ${SITE_STORE_NAME}: обробка персональних даних, cookies, права користувачів інтернет-магазину.`,
  },
  terms: {
    title: "Публічна оферта",
    description: `Договір публічної оферти ${SITE_STORE_NAME}: умови купівлі тактичного одягу онлайн, оплата, доставка, повернення та відповідальність сторін.`,
  },
  success: {
    title: "Замовлення прийнято",
    description: `Дякуємо за замовлення в ${SITE_STORE_NAME}. Підтвердження надіслано — очікуйте дзвінка менеджера або статус доставки.`,
  },
  notFound: {
    title: "Сторінку не знайдено",
    description: `Сторінку не знайдено. Поверніться в каталог тактичного одягу ${SITE_STORE_NAME} або на головну.`,
  },
} as const;

/** Alt для зображення товару в каталозі та картках. */
export function productCardImageAlt(productName: string): string {
  return `${productName} — тактичний одяг ${SITE_STORE_NAME}, фото товару`;
}

/** Alt для галереї на сторінці товару. */
export function productGalleryImageAlt(productName: string, index: number, total: number): string {
  return `${productName} — фото ${index + 1} з ${total}, ${SITE_STORE_NAME}`;
}

/** Alt для категорії на головній. */
export function categoryShowcaseImageAlt(categoryName: string): string {
  return `Категорія «${categoryName}» — тактичний одяг ${SITE_STORE_NAME}`;
}
