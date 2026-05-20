import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Кошик",
  description: `Кошик у ${SITE_STORE_NAME}: перевірте подарунки з фанери та перейдіть до оформлення замовлення з доставкою по Україні.`,
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
