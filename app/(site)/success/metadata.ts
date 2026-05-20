import type { Metadata } from "next";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Успішна оплата замовлення",
  description: `Ваше замовлення в інтернет-магазині ${SITE_STORE_NAME} успішно оформлене. Перевірте деталі та очікуйте на доставку.`,
  path: "/success",
  noIndex: true,
});
