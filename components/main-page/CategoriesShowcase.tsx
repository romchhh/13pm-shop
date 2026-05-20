"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/lib/CategoriesProvider";
import HomeSectionCarousel, { homeCarouselItemClass } from "./HomeSectionCarousel";

function CategoriesLoadingPlaceholder() {
  return (
    <HomeSectionCarousel title="Популярні категорії" loading loadingMessage="Завантаження категорій..." />
  );
}

export default function CategoriesShowcase() {
  const { categories, loading } = useCategories();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return <CategoriesLoadingPlaceholder />;
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <HomeSectionCarousel title="Популярні категорії" catalogHref="/catalog">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/catalog?categoryId=${category.id}`}
          className={`${homeCarouselItemClass} group`}
          aria-label={`Категорія ${category.name}`}
        >
          <div className="relative mb-2 aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-100 lg:mb-3 lg:aspect-[3/4] lg:rounded-xl">
            {category.mediaUrl && category.mediaType ? (
              category.mediaType === "video" ? (
                <video
                  src={`/api/images/${category.mediaUrl}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={`/api/images/${category.mediaUrl}`}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 1023px) 42vw, 22vw"
                />
              )
            ) : (
              <div className="absolute inset-0 bg-gray-200" aria-hidden />
            )}
          </div>
          <p className="text-center font-['Montserrat'] text-xs font-medium text-black lg:text-base">
            {category.name}
          </p>
        </Link>
      ))}
    </HomeSectionCarousel>
  );
}
