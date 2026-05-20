import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { SITE_WORDMARK } from "@/lib/siteBrand";
import { buildPageMetadata } from "@/lib/seo";

/** Завжди свіжий список товарів (після seed/адмінки без очікування ISR). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: `Каталог дерев'яного декору та подарунків`,
  description: `Каталог ${SITE_WORDMARK}: фоторамки, метрики, ключниці та декор з фанери власного виробництва. Іменні подарунки з лазерним гравіюванням — доставка по Україні.`,
  path: "/catalog",
  imageAlt: `${SITE_WORDMARK} — каталог подарунків і декору з фанери`,
});

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogGridSkeleton />}>
      <CatalogServer />
    </Suspense>
  );
}
