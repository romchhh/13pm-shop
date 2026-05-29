"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/lib/CategoriesProvider";
import HomePillLink, { HomePillArrow } from "@/components/shared/HomePillLink";
import { homeSectionOuterClass } from "@/lib/homeSectionSpacing";

const MAX_HOME_CATEGORIES = 8;

function CategoriesLoadingPlaceholder() {
  return (
    <section id="categories" className={`w-full bg-white ${homeSectionOuterClass}`}>
      <div className="mx-auto max-w-[1920px] px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {Array.from({ length: MAX_HOME_CATEGORIES }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-black/10 lg:rounded-3xl"
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
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

  const displayCategories = categories.slice(0, MAX_HOME_CATEGORIES);

  return (
    <section id="categories" className={`w-full bg-white ${homeSectionOuterClass}`}>
      <div className="mx-auto max-w-[1920px] px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/catalog?categoryId=${category.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#1C1C1C] lg:rounded-3xl"
              aria-label={`Категорія ${category.name}`}
            >
              {category.mediaUrl && category.mediaType ? (
                category.mediaType === "video" ? (
                  <video
                    src={`/api/images/${category.mediaUrl}`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={`/api/images/${category.mediaUrl}`}
                    alt={`Категорія «${category.name}» — тактичний одяг 13pm tactic`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1023px) 45vw, 22vw"
                  />
                )
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#3a3a3a] to-[#1C1C1C]" aria-hidden />
              )}

              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                aria-hidden
              />

              <div className="absolute inset-x-0 bottom-0 z-10 p-3.5 lg:p-5">
                <p className="font-['Montserrat'] text-sm font-semibold leading-snug text-white lg:text-base xl:text-lg">
                  {category.name}
                </p>
                <span className="mt-2.5 flex w-full items-center justify-between gap-2 rounded-full border border-white/25 bg-white/10 py-1 pr-1 pl-2.5 font-['Montserrat'] text-[10px] font-semibold leading-none text-white backdrop-blur-sm transition-colors group-hover:border-white/40 group-hover:bg-white/15 sm:text-[11px] lg:mt-3 lg:py-1.5 lg:pl-3 lg:text-xs">
                  <span className="min-w-0 flex-1 text-left">Переглянути товари</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[#1C1C1C] transition-colors group-hover:bg-[var(--site-accent)] group-hover:text-white sm:h-8 sm:w-8 lg:h-9 lg:w-9">
                    <HomePillArrow className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex justify-center lg:mt-8">
          <HomePillLink href="/catalog">Всі товари</HomePillLink>
        </div>
      </div>
    </section>
  );
}
