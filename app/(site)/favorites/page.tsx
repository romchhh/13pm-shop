import type { Metadata } from "next";
import FavoritesPageClient from "@/components/favorites/FavoritesPageClient";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.favorites.title,
  description: seoCopy.favorites.description,
  path: "/favorites",
  noIndex: true,
});

export default function FavoritesPage() {
  return <FavoritesPageClient />;
}
