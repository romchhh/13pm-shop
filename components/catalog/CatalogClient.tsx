"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import SidebarFilter from "../layout/SidebarFilter";
import { useAppContext } from "@/lib/GeneralProvider";
import SidebarMenu from "../layout/SidebarMenu";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc, getFirstMedia } from "@/lib/getFirstProductImage";

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
  discount_percentage?: number;
}

interface CatalogClientProps {
  initialProducts: Product[];
  colors: string[];
}

export default function CatalogClient({
  initialProducts,
  colors,
}: CatalogClientProps) {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes?.some((s) => selectedSizes.includes(s.size));

      const matchesColor =
        selectedColors.length === 0 ||
        (product.color && selectedColors.includes(product.color));

      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

      return matchesSize && matchesMinPrice && matchesMaxPrice && matchesColor;
    });
  }, [initialProducts, selectedSizes, minPrice, maxPrice, selectedColors]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );
  }, [filteredProducts, sortOrder]);

  const category = searchParams.get("category");
  const season = searchParams.get("season");
  const subcategory = searchParams.get("subcategory");

  const [visibleCount, setVisibleCount] = useState(12);

  const visibleProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleCount);
  }, [sortedProducts, visibleCount]);

  return (
    <>
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 mt-10 mb-20">
        {/* Top Controls */}
        <div className="flex justify-between items-center text-xl sm:text-2xl md:text-3xl mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer text-2xl sm:text-3xl"
            >
              {"<"}
            </button>
            <span>
              {subcategory
                ? `Підкатегорія ${subcategory}${
                    category ? ` (Категорія ${category})` : ""
                  }`
                : category
                ? `Категорія ${category}`
                : season
                ? `Сезон ${season}`
                : "Усі товари"}
            </span>
          </div>

          <button
            className="cursor-pointer text-base sm:text-lg"
            onClick={() => setIsFilterOpen(true)}
          >
            Фільтри
          </button>
        </div>

        {/* Product Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {visibleProducts.map((product, index) => {
            // Debug logging
            if (product.first_media) {
              console.log(`[CatalogClient] Product ${product.id} - first_media:`, product.first_media);
            }
            
            return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="flex flex-col gap-2 sm:gap-4 group"
            >
              {/* Image or Video */}
              <div className="relative w-full aspect-[2/3] bg-gray-200 group-hover:filter group-hover:brightness-90 transition duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer pointer-events-none" />
                {product.first_media?.type === "video" ? (
                  <video
                    src={`/api/images/${product.first_media.url}`}
                    className="object-cover transition-all duration-300 group-hover:brightness-90 w-full h-full"
                    loop
                    muted
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={getProductImageSrc(product.first_media)}
                    alt={product.name}
                    className="object-cover transition-all duration-300 group-hover:brightness-90"
                    fill
                    sizes="(max-width: 420px) 45vw, (max-width: 640px) 45vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    priority={index < 8}
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                )}
              </div>

              {/* Product Title + Price */}
              <span className="text-sm sm:text-base lg:text-lg leading-tight">
                {product.name}
                <br />
                {product.discount_percentage ? (
                  <div className="flex items-center gap-2">
                    {/* Discounted price */}
                    <span className="font-medium text-red-600">
                      {(
                        product.price *
                        (1 - product.discount_percentage / 100)
                      ).toFixed(2)}
                      ₴
                    </span>

                    {/* Original (crossed-out) price */}
                    <span className="text-gray-500 line-through">
                      {product.price}₴
                    </span>

                    {/* Optional: show discount percentage */}
                    <span className="text-green-600 text-sm">
                      -{product.discount_percentage}%
                    </span>
                  </div>
                ) : (
                  <span className="font-medium">{product.price}₴</span>
                )}
              </span>
              </Link>
            );
          })}
        </div>
        {visibleCount < sortedProducts.length && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className={`cursor-pointer px-6 py-3 ${
                isDark
                  ? "bg-stone-100 text-stone-900"
                  : "bg-stone-900 text-stone-100"
              }`}
            >
              Показати ще
            </button>
          </div>
        )}
      </section>

      <SidebarFilter
        isDark={isDark}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        openAccordion={openAccordion}
        setOpenAccordion={setOpenAccordion}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        colors={colors}
      />

      {/* Menu Sidebar */}
      <SidebarMenu
        isDark={isDark}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </>
  );
}
