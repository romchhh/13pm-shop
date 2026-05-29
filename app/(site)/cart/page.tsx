import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.cart.title,
  description: seoCopy.cart.description,
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageClient />;
}
