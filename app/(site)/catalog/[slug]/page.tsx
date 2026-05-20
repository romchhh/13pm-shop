import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import { CatalogGridSkeleton } from "@/components/shared/SkeletonLoader";
import { sqlGetAllCategories, sqlGetCategoryBySlug } from "@/lib/sql";
import { notFound } from "next/navigation";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { buildCategoryMetadata } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  try {
    const categories = await sqlGetAllCategories();
    return categories
      .filter((c) => c.slug != null)
      .map((c) => ({ slug: c.slug! }));
  } catch (error) {
    console.error("Error generating static params for categories:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await sqlGetCategoryBySlug(slug);
  if (!category) return { title: `Категорія не знайдена | ${SITE_STORE_NAME}` };

  return buildCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: category.description,
  });
}

export default async function CatalogSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await sqlGetCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <Suspense
      fallback={
        <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-10 mb-20">
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-gray-900">
              Завантаження...
            </h1>
          </div>
          <CatalogGridSkeleton count={12} />
        </section>
      }
    >
      <CatalogServer
        category={category.name}
        subcategory={null}
        categoryId={category.id}
        categoryDescription={(category as any).description ?? null}
      />
    </Suspense>
  );
}
