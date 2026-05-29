import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { buildPageMetadata } from "@/lib/seo";
import { seoCopy } from "@/lib/seoCopy";

/** Завжди свіжий список товарів (після seed/адмінки без очікування ISR). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: seoCopy.catalog.title,
  description: seoCopy.catalog.description,
  path: "/catalog",
  imageAlt: seoCopy.catalog.imageAlt,
});

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogGridSkeleton />}>
      <CatalogServer />
    </Suspense>
  );
}
