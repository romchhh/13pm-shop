"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCategories } from "@/lib/CategoriesProvider";
import { siteContact } from "@/lib/siteContact";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface SidebarMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarMenu({
  isOpen,
  setIsOpen,
}: SidebarMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  // Use categories from context instead of fetching
  const { categories, subcategories: subcategoriesMap, loading, error, fetchSubcategoriesForCategory } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  // Avoid hydration mismatch: server and initial client render show placeholder; real content after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    setIsOpen(false);
    if (pathname === "/") {
      // Якщо вже на головній сторінці, просто прокручуємо до якоря
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // Якщо на іншій сторінці, переходимо на головну з якорем
      router.push(`/${anchor}`);
      // Після переходу прокручуємо до якоря
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  };

  // Convert Map to array for selected category
  const selectedSubcategories = selectedCategoryId 
    ? subcategoriesMap.get(selectedCategoryId) || [] 
    : [];

  // Load subcategories when category is selected
  const handleCategorySelect = async (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    
    // If subcategories not loaded yet, fetch them
    if (!subcategoriesMap.has(categoryId)) {
      setLoadingSubcategories(true);
      await fetchSubcategoriesForCategory(categoryId);
      setLoadingSubcategories(false);
    }
  };

  // Select first category by default when categories load
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === null) {
      handleCategorySelect(categories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when categories/selectedCategoryId change
  }, [categories, selectedCategoryId]);

  useBodyScrollLock(isOpen);

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <div className="relative z-[var(--z-site-overlay)]">
      {/* Overlay - only below header */}
      {isOpen && (
        <div
          className="fixed top-[var(--site-header-offset)] left-0 right-0 bottom-0 bg-black/40 z-[var(--z-site-overlay-backdrop)]"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}

      {/* Sidebar — одразу під фіксованим хедером (висота = --site-header-offset) */}
      <div
        className={`fixed top-[var(--site-header-offset)] left-0 h-[calc(100vh-var(--site-header-offset))] w-full sm:w-4/5 sm:max-w-md bg-white shadow-md z-[var(--z-site-overlay)] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-hidden flex flex-col`}
      >
        {/* Categories Scroll - Top */}
        <div className="border-b border-[#3D1A00]/10 bg-white">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex flex-row gap-3 px-4 py-4 min-w-max">
              {!mounted ? (
                <div className="px-4 py-2 text-sm text-[#3D1A00]/60 font-['Montserrat']">Завантаження...</div>
              ) : loading ? (
                <div className="px-4 py-2 text-sm text-[#3D1A00]/60 font-['Montserrat']">Завантаження...</div>
              ) : error ? (
                <div className="px-4 py-2 text-sm text-red-500 font-['Montserrat']">Помилка: {error}</div>
              ) : (
                <>
                  {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-5 py-3 rounded-full text-base font-semibold whitespace-nowrap transition-all duration-200 font-['Montserrat'] ${
                      selectedCategoryId === cat.id
                        ? "bg-[#3D1A00] text-white"
                        : "bg-[#3D1A00]/10 text-[#3D1A00] hover:bg-[#3D1A00]/20"
                    }`}
                  >
                    {cat.name}
                  </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Subcategories */}
          {selectedCategory && (
            <div className="px-6 pt-6 pb-2">
              {loadingSubcategories ? (
                <div className="py-4 text-center text-sm text-[#3D1A00]/60 font-['Montserrat']">
                  Завантаження...
                </div>
              ) : selectedSubcategories.length > 0 ? (
                <>
                  <div className="space-y-1">
                    {selectedSubcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/catalog?subcategory=${encodeURIComponent(sub.name)}`}
                        className="block py-3 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors border-b border-[#3D1A00]/5 font-['Montserrat']"
                        onClick={() => setIsOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                  <div className="pt-4 pb-0 mt-2 border-t border-[#3D1A00]/10">
                    <Link
                      href="/catalog"
                      className="text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-medium font-['Montserrat']"
                      onClick={() => setIsOpen(false)}
                    >
                      Подивитися все
                    </Link>
                  </div>
                </>
              ) : (
                <div className="pt-2 pb-2">
                  <Link
                    href="/catalog"
                    className="text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-medium font-['Montserrat']"
                    onClick={() => setIsOpen(false)}
                  >
                    Подивитися все
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {selectedCategory && (
            <div className="px-6 py-4">
              <div className="border-t border-[#3D1A00]/10"></div>
            </div>
          )}

          {/* Information Section */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3D1A00]/60 mb-4 font-['Montserrat']">
              ІНФОРМАЦІЯ
            </h3>
            <nav className="space-y-1">
              <Link
                href="/#about"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                ПРО БРЕНД
              </Link>
              <Link
                href="/#reviews"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                ВІДГУКИ
              </Link>
              <Link
                href="/delivery-and-payment"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                ДОСТАВКА ТА ОПЛАТА
              </Link>
              <Link
                href="/returns-and-exchange"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                ПОВЕРНЕННЯ ТА ОБМІН
              </Link>
              <Link
                href="/#faq"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contacts"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                Контакти
              </Link>
              <Link
                href="/catalog?promo=1"
                className="block py-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
                onClick={() => setIsOpen(false)}
              >
                АКЦІЇ
              </Link>
            </nav>
          </div>

        </div>

        {/* Social Media Section - Fixed at bottom */}
        <div className="border-t border-[#3D1A00]/10 bg-white">
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#3D1A00]/60 mb-4 font-['Montserrat']">
              ЗВ&apos;ЯЗОК
            </h3>
            <div className="flex flex-row gap-4 flex-wrap">
              <Link
                href={siteContact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Instagram</span>
              </Link>
              <Link
                href={siteContact.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64v-3.5a6.67 6.67 0 1 0 5.79 6.61V8.57a8.16 8.16 0 0 0 4.32 1.24V6.69Z" />
                </svg>
                <span>TikTok</span>
              </Link>
              <Link
                href={siteContact.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-[#3D1A00] hover:text-[#3D1A00]/70 transition-colors font-['Montserrat']"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Telegram"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                </svg>
                <span>Telegram</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
