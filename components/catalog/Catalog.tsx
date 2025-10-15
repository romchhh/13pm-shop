"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation"; // Next.js 13+ client hook for reading query params
import SidebarFilter from "../layout/SidebarFilter";
import { useAppContext } from "@/lib/GeneralProvider";
import SidebarMenu from "../layout/SidebarMenu";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  media: { url: string; type: string }[];
  sizes: { size: string; stock: string }[]; // updated
  color: string;
}

export default function Catalog() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes?.some((s) => selectedSizes.includes(s.size));

      const matchesColor =
        selectedColors.length === 0 || selectedColors.includes(product.color);

      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

      return matchesSize && matchesMinPrice && matchesMaxPrice && matchesColor;
    });
  }, [products, selectedSizes, minPrice, maxPrice, selectedColors]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );
  }, [filteredProducts, sortOrder]);

  // Read filters from URL params
  const category = searchParams.get("category");
  const season = searchParams.get("season");
  const subcategory = searchParams.get("subcategory");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        let url = "/api/products";

        if (subcategory) {
          url = `/api/products/subcategory?subcategory=${encodeURIComponent(
            subcategory
          )}`;
        } else if (category) {
          url = `/api/products/category?category=${encodeURIComponent(
            category
          )}`;
        } else if (season) {
          url = `/api/products/season?season=${encodeURIComponent(season)}`;
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    // Fetch colors
    async function fetchColors() {
      try {
        const res = await fetch("/api/colors");
        if (!res.ok) throw new Error("Failed to fetch colors");
        const data = await res.json();
        const colorNames = data.map((item: { color: string }) => item.color);
        setColors(colorNames);
      } catch (err: unknown) {
        console.error("Error fetching colors:", err);
        setError("Failed to fetch colors");
      }
    }

    fetchProducts();
    fetchColors();
  }, [category, season]); // refetch if URL params change

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="flex flex-col gap-4 group"
            >
              {/* Image */}
              <div className="relative w-full aspect-[2/3] bg-gray-200 group-hover:filter group-hover:brightness-90 transition duration-300">
                {(() => {
                  const firstPhoto = product.media.find(
                    (m) => m.type === "photo"
                  );
                  const imageUrl = firstPhoto?.url || product.media[0]?.url;
                  return imageUrl ? (
                    <img
                      src={`/api/images/${imageUrl}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-90"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://placehold.co/400x600/cccccc/666666?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <img
                        src="https://placehold.co/400x600/cccccc/666666?text=No+Image"
                        alt="No Image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })()}
              </div>

              {/* Product Title + Price */}
              <span className="text-base sm:text-lg">
                {product.name}
                <br /> {product.price}₴
              </span>
            </Link>
          ))}
        </div>
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
