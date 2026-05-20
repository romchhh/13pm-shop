import type { Metadata } from "next";
import FinalCard from "@/components/final-card/FinalCard";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Оформлення замовлення",
  description: `Завершіть замовлення подарунків з фанери в ${SITE_STORE_NAME}: доставка Новою Поштою, оплата онлайн або накладений платіж.`,
  path: "/final",
  noIndex: true,
});

export default function Page() {
  return <FinalCard />;
}
