import type { Metadata } from "next";
import FavoritesPageClient from "@/components/favorites/FavoritesPageClient";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Вішлист",
  description: `Вішлист у ${SITE_STORE_NAME}: збережені подарунки з фанери для швидкого перегляду та замовлення.`,
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
