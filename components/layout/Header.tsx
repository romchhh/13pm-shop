"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}

export default function Header() {
  const {
    isDark,
    setIsDark,
    isSidebarOpen,
    setIsSidebarOpen,
    isBasketOpen,
    setIsBasketOpen,
    isSearchOpen,
    setIsSearchOpen,
  } = useAppContext();

  const { items } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const toggleTheme = () => setIsDark((prev) => !prev);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null
  );
  const [catalogOpen, setCatalogOpen] = useState(false);

  const [pinnedCatalog, setPinnedCatalog] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [justUnpinned, setJustUnpinned] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pinnedCatalog &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setPinnedCatalog(false);
        setCatalogOpen(false);
        setHoveredCategoryId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pinnedCatalog]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchSubcategories(categoryId: number) {
      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${categoryId}`
        );
        const data = await res.json();
        setSubcategories(data);
      } catch (err) {
        console.error("Failed to load subcategories", err);
        setSubcategories([]);
      }
    }

    if (hoveredCategoryId !== null) {
      fetchSubcategories(hoveredCategoryId);
    }
  }, [hoveredCategoryId]);

  return (
    <>
      <header
        className={`max-w-[1920px] mx-auto fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50 ${
          isDark ? "bg-[#1e1e1e] text-white" : "bg-stone-100 text-black"
        }`}
        onMouseLeave={() => {
          if (!pinnedCatalog) {
            hoverTimeout.current = setTimeout(() => {
              setCatalogOpen(false);
              setHoveredCategoryId(null);
            }, 200); // Small delay
          }
        }}
      >
        {/* === WRAPPER: everything inside shares same bg and styles === */}
        <div className="w-full shadow-md transition-all duration-300">
          {/* Top nav */}
          <div className="hidden lg:flex justify-between items-center h-20 px-10">
            <Link href="/">
              <Image
                height="57"
                width="200"
                alt="logo"
                src={
                  isDark
                    ? "/images/dark-theme/chars-logo-header-dark.png"
                    : "/images/light-theme/chars-logo-header-light.png"
                }
              />
            </Link>

            <div className="flex items-center gap-10 text-xl font-['Inter']">
              <Link href="/#about" className="hover:text-[#8C7461]">
                Про нас
              </Link>

              <div
                onMouseEnter={() => {
                  if (justUnpinned) return;

                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                  setCatalogOpen(true);
                }}
                // onClick={() => {
                //   setPinnedCatalog((prev) => {
                //     const willBePinned = !prev;

                //     if (!willBePinned) {
                //       // Just unpinned — prevent re-opening on hover
                //       setJustUnpinned(true);
                //       setCatalogOpen(false);
                //       setHoveredCategoryId(null);

                //       // Reset after 300ms to allow hover again
                //       setTimeout(() => setJustUnpinned(false), 300);
                //     } else {
                //       setCatalogOpen(true);
                //     }

                //     return willBePinned;
                //   });
                // }}
                className="relative"
              >
                <Link
                href="/catalog"
                  className={`cursor-pointer hover:text-[#8C7461] ${
                    pinnedCatalog
                      ? "text-[#8C7461] font-semibold underline"
                      : ""
                  }`}
                >
                  Каталог
                </Link>
              </div>

              <Link
                href="/#payment-and-delivery"
                className="hover:text-[#8C7461]"
              >
                Оплата і доставка
              </Link>
              <Link href="/#reviews" className="hover:text-[#8C7461]">
                Відгуки
              </Link>
              <Link href="/#contacts" className="hover:text-[#8C7461]">
                Контакти
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-5">
              <button className="cursor-pointer" onClick={toggleTheme}>
                <Image
                  height="32"
                  width="32"
                  alt="theme switch"
                  src={
                    isDark
                      ? "/images/dark-theme/theme-switch.svg"
                      : "/images/light-theme/theme-switch.svg"
                  }
                />
              </button>
              <button onClick={() => setIsSearchOpen(true)}>
                <Image
                  className="cursor-pointer"
                  height="32"
                  width="32"
                  alt="search icon"
                  src={
                    isDark
                      ? "/images/dark-theme/search.svg"
                      : "/images/light-theme/search.svg"
                  }
                />
              </button>
              <button
                className="cursor-pointer relative"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
              >
                <Image
                  height="32"
                  width="32"
                  alt="shopping basket"
                  src={
                    isDark
                      ? "/images/dark-theme/basket.svg"
                      : "/images/light-theme/basket.svg"
                  }
                />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mega menu area — part of same wrapper! */}
          {catalogOpen && (
            <div
              ref={menuRef}
              className="flex justify-center gap-6 relative py-3"
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="relative group"
                  onMouseEnter={() => {
                    if (hoverTimeout.current)
                      clearTimeout(hoverTimeout.current);
                    setHoveredCategoryId(category.id);
                    setCatalogOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (!pinnedCatalog) {
                      hoverTimeout.current = setTimeout(() => {
                        setHoveredCategoryId(null);
                      }, 200);
                    }
                  }}
                >
                  <button
                    onClick={() =>
                      (window.location.href = `/catalog?category=${encodeURIComponent(
                        category.name
                      )}`)
                    }
                    className="cursor-pointer whitespace-nowrap hover:text-[#8C7461] text-lg"
                  >
                    {category.name}
                  </button>

                  {/* Show subcategories only for hovered category */}
                  {hoveredCategoryId === category.id &&
                    subcategories.length > 0 && (
                      <div className="absolute top-full left-0 mt-2 bg-white shadow-md rounded px-4 py-2 flex flex-col min-w-[200px] z-50">
                        {subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/catalog?subcategory=${encodeURIComponent(
                              subcat.name
                            )}`}
                            className="hover:text-[#8C7461] text-base py-1"
                          >
                            {subcat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Header (Unchanged) */}
        <div className="lg:hidden w-full h-16 relative overflow-hidden px-4 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="relative w-12 h-12 text-3xl"
            >
              ☰
            </button>
            <button className="cursor-pointer" onClick={toggleTheme}>
              <Image
                height="32"
                width="32"
                alt="theme switch"
                src={
                  isDark
                    ? "/images/dark-theme/theme-switch.svg"
                    : "/images/light-theme/theme-switch.svg"
                }
              />
            </button>
          </div>

          <Link href="/">
            <Image
              height="28"
              width="100"
              alt="logo"
              src={
                isDark
                  ? "/images/dark-theme/chars-logo-header-dark.png"
                  : "/images/light-theme/chars-logo-header-light.png"
              }
            />
          </Link>

          <div className="flex gap-4">
            <button onClick={() => setIsSearchOpen(true)}>
              <Image
                height="32"
                width="32"
                alt="search icon"
                src={
                  isDark
                    ? "/images/dark-theme/search.svg"
                    : "/images/light-theme/search.svg"
                }
              />
            </button>
            <button
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative"
            >
              <Image
                height="32"
                width="32"
                alt="shopping basket"
                src={
                  isDark
                    ? "/images/dark-theme/basket.svg"
                    : "/images/light-theme/basket.svg"
                }
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <SidebarBasket
        isDark={isDark}
        isOpen={isBasketOpen}
        setIsOpen={setIsBasketOpen}
      />
      <SidebarSearch
        isDark={isDark}
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
      />
    </>
  );
}
