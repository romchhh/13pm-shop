"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useFavorites } from "@/lib/FavoritesProvider";
import { useCategories } from "@/lib/CategoriesProvider";
import SidebarSearch from "./SidebarSearch";
import SidebarMenu from "./SidebarMenu";
import { siteContact } from "@/lib/siteContact";
import { LABEL_FREE_DELIVERY_FROM_2000 } from "@/lib/siteBrand";
import { getMainNavHashId, mainNavLinks } from "@/lib/siteNav";

interface Subcategory {
  id: number;
  name: string;
}

const NAV_MENU_LEAVE_DELAY_MS = 200;
const ICON_CART = "/images/icons/cart.svg";
const ICON_LIKE = "/images/icons/like.svg";
const ICON_SEARCH = "/images/icons/search.svg";

function PhoneLink({
  phone,
  className = "",
  iconSize = 16,
}: {
  phone: (typeof siteContact.phones)[number];
  className?: string;
  iconSize?: number;
}) {
  return (
    <a
      href={`tel:${phone.tel}`}
      className={`inline-flex shrink-0 items-center gap-1.5 font-['Montserrat'] font-medium hover:opacity-80 transition-opacity whitespace-nowrap ${className}`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        className="shrink-0"
      >
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
      <span>{phone.display}</span>
    </a>
  );
}

function TopContactBar({ className = "" }: { className?: string }) {
  const primaryPhone = siteContact.phones[0];

  return (
    <div
      className={`shrink-0 text-white ${className}`}
      style={{
        background: "linear-gradient(90deg, var(--brand-olive-elite) 0%, var(--brand-olive) 50%, var(--brand-olive-muted) 100%)",
      }}
    >
      <div className="max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-12 min-h-10 lg:min-h-11 py-1.5 flex flex-nowrap items-center justify-between gap-2 lg:gap-6">
        <p className="min-w-0 font-['Montserrat'] text-[10px] leading-tight sm:text-xs font-medium lg:text-sm truncate">
          {LABEL_FREE_DELIVERY_FROM_2000}
        </p>

        <PhoneLink
          phone={primaryPhone}
          className="text-[10px] sm:text-xs lg:hidden"
          iconSize={14}
        />

        <div className="hidden lg:flex items-center gap-8 shrink-0">
          {siteContact.phones.map((phone) => (
            <PhoneLink key={phone.tel} phone={phone} className="text-sm" />
          ))}
          <a
            href={siteContact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-['Montserrat'] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Instagram</span>
          </a>
          <a
            href={siteContact.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-['Montserrat'] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64v-3.5a6.67 6.67 0 1 0 5.79 6.61V8.57a8.16 8.16 0 0 0 4.32 1.24V6.69Z" />
            </svg>
            <span>TikTok</span>
          </a>
          <a
            href={siteContact.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-['Montserrat'] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z" />
            </svg>
            <span>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    setIsSearchOpen,
  } = useAppContext();

  const pathname = usePathname();
  const { items } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const { count: favoritesCount } = useFavorites();
  const { categories } = useCategories();

  const [catalogOpen, setCatalogOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const catalogTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catalogRef = useRef<HTMLDivElement | null>(null);

  const handleHomeAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchorId: string
  ) => {
    if (pathname !== "/") return;
    e.preventDefault();
    document.getElementById(anchorId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scheduleCatalogClose = () => {
    if (catalogTimeout.current) clearTimeout(catalogTimeout.current);
    catalogTimeout.current = setTimeout(() => {
      setCatalogOpen(false);
      setHoveredCategoryId(null);
    }, NAV_MENU_LEAVE_DELAY_MS);
  };

  const cancelCatalogClose = () => {
    if (catalogTimeout.current) {
      clearTimeout(catalogTimeout.current);
      catalogTimeout.current = null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catalogRef.current && !catalogRef.current.contains(e.target as Node)) {
        setCatalogOpen(false);
        setHoveredCategoryId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (hoveredCategoryId === null) {
      setSubcategories([]);
      return;
    }
    const categoryId = hoveredCategoryId;
    setSubcategoriesLoading(true);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/subcategories?parent_category_id=${categoryId}`);
        const data = await res.json();
        if (!cancelled) setSubcategories(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setSubcategories([]);
      } finally {
        if (!cancelled) setSubcategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hoveredCategoryId]);

  const [isScrolled, setIsScrolled] = useState(false);
  const isHeroMode = pathname === "/" && !isScrolled;
  const headerTransparent = isHeroMode && !isSidebarOpen;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") setIsScrolled(false);
  }, [pathname]);

  const shellClass = headerTransparent
    ? "bg-transparent border-transparent shadow-none"
    : "bg-white/92 border-[var(--color-border)] shadow-[var(--shadow-soft)] backdrop-blur-md";

  return (
    <>
      {/* Коричнева смуга — завжди зверху, не перекриває hero */}
      <div className="fixed top-0 left-0 right-0 z-[var(--z-site-contact-bar)]">
        <TopContactBar />
      </div>

      {/* Навігація — під смугою, на головній прозора над hero */}
      <header
        className={`fixed left-0 right-0 z-[var(--z-site-header)] transition-all duration-300 top-[var(--site-contact-bar-height)]`}
      >
        {/* Десктоп */}
        <div className={`hidden lg:block border-b transition-all duration-300 ${shellClass}`}>
          <div className="max-w-[1920px] mx-auto px-8 xl:px-12 min-h-[88px] py-2 flex items-center gap-6 xl:gap-10">
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="/images/logos/logo_brown.svg"
                alt="Plywood Present"
                width={104}
                height={90}
                priority
                className="h-20 w-auto"
              />
            </Link>

            <nav className="flex items-center justify-center gap-6 xl:gap-8 flex-1 min-w-0 font-['Montserrat'] text-[15px] text-[var(--brand-olive-dark)]">
              <div
                ref={catalogRef}
                className="relative"
                onMouseEnter={() => {
                  cancelCatalogClose();
                  setCatalogOpen(true);
                }}
                onMouseLeave={scheduleCatalogClose}
              >
                <button
                  type="button"
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap hover:text-[var(--brand-olive)] transition-colors ${
                    catalogOpen ? "text-[var(--brand-olive)]" : ""
                  }`}
                  onClick={() => setCatalogOpen((v) => !v)}
                  aria-expanded={catalogOpen}
                >
                  Каталог товарів
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden className={`transition-transform ${catalogOpen ? "rotate-180" : ""}`}>
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>

                {catalogOpen && (
                  <div
                    className="absolute top-full left-0 mt-3 min-w-[300px] bg-white/98 rounded-2xl shadow-[var(--shadow-card)] border border-[var(--color-border)] py-3 z-50 backdrop-blur-md"
                    onMouseEnter={cancelCatalogClose}
                    onMouseLeave={scheduleCatalogClose}
                  >
                    <div className="flex">
                      <div className="w-44 border-r border-[var(--color-border)] py-1">
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/catalog?categoryId=${cat.id}`}
                            onMouseEnter={() => setHoveredCategoryId(cat.id)}
                            className={`block rounded-xl mx-1 px-3 py-2 text-sm transition-colors hover:bg-[var(--brand-olive-soft)] ${
                              hoveredCategoryId === cat.id ? "bg-[var(--brand-olive-soft)] text-[var(--brand-olive)] font-medium" : ""
                            }`}
                            onClick={() => setCatalogOpen(false)}
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                      <div className="flex-1 py-1 px-2 min-w-[160px]">
                        {subcategoriesLoading ? (
                          <p className="px-3 py-2 text-sm text-gray-500">Завантаження…</p>
                        ) : subcategories.length > 0 ? (
                          subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/catalog?subcategory=${encodeURIComponent(sub.name)}`}
                              className="block rounded-xl mx-1 px-3 py-2 text-sm transition-colors hover:bg-[var(--brand-olive-soft)]"
                              onClick={() => setCatalogOpen(false)}
                            >
                              {sub.name}
                            </Link>
                          ))
                        ) : hoveredCategoryId ? (
                          <Link
                            href={`/catalog?categoryId=${hoveredCategoryId}`}
                            className="block rounded-xl mx-1 px-3 py-2 text-sm text-[var(--brand-olive)] underline"
                            onClick={() => setCatalogOpen(false)}
                          >
                            Переглянути всі
                          </Link>
                        ) : (
                          <p className="px-3 py-2 text-sm text-gray-400">Оберіть категорію</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/catalog"
                      className="block mx-3 mt-2 pt-2 border-t border-[var(--color-border)] text-sm font-medium text-[var(--brand-olive)] hover:underline"
                      onClick={() => setCatalogOpen(false)}
                    >
                      Весь каталог
                    </Link>
                  </div>
                )}
              </div>

              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    const hashId = getMainNavHashId(link.href);
                    if (hashId) handleHomeAnchorClick(e, hashId);
                  }}
                  className="whitespace-nowrap hover:text-[var(--brand-olive)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center gap-2 h-10 px-4 rounded-full text-[var(--brand-olive-dark)]/60 transition-colors min-w-[180px] xl:min-w-[220px] max-w-[280px] shrink-0 ${
                headerTransparent
                  ? "bg-white/75 hover:bg-white/90 backdrop-blur-sm"
                  : "bg-[var(--brand-olive-soft)] hover:bg-[var(--brand-olive-light)]"
              }`}
              aria-label="Пошук"
            >
              <Image src={ICON_SEARCH} alt="" width={18} height={18} className="h-[18px] w-[18px] shrink-0 opacity-60" />
              <span className="font-['Montserrat'] text-sm">Пошук</span>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/cart"
                className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  headerTransparent ? "hover:bg-white/30" : "hover:bg-[var(--brand-olive-soft)]"
                }`}
                aria-label="Кошик"
              >
                <Image src={ICON_CART} alt="" width={23} height={21} className="h-5 w-auto" />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[var(--brand-olive)] rounded-full">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>
              <Link
                href="/favorites"
                className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  headerTransparent ? "hover:bg-white/30" : "hover:bg-[var(--brand-olive-soft)]"
                }`}
                aria-label="Вішлист"
              >
                <Image src={ICON_LIKE} alt="" width={20} height={19} className="h-5 w-auto" />
                {favoritesCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[var(--brand-olive)] rounded-full">
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Мобільний */}
        <div className={`lg:hidden border-b transition-all duration-300 ${shellClass}`}>
          <div className="min-h-[64px] py-1 px-4 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--brand-olive-dark)]"
                aria-label="Меню"
              >
                {isSidebarOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>

              <Link
                href="/"
                className="flex min-w-0 shrink items-center"
                onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
              >
                <Image
                  src="/images/logos/logo_brown.svg"
                  alt="Plywood Present"
                  width={80}
                  height={70}
                  className="h-16 w-auto max-w-[calc(100vw-11rem)] object-left object-contain"
                />
              </Link>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className={`flex h-10 items-center gap-1.5 px-3 rounded-full text-[var(--brand-olive-dark)]/70 transition-colors ${
                  headerTransparent
                    ? "bg-white/75 hover:bg-white/90 backdrop-blur-sm"
                    : "bg-[var(--brand-olive-soft)]"
                }`}
                aria-label="Пошук"
              >
                <Image src={ICON_SEARCH} alt="" width={16} height={16} className="h-4 w-4 shrink-0 opacity-70" />
                <span className="text-xs font-['Montserrat'] hidden xs:inline">Пошук</span>
              </button>
              <Link
                href="/favorites"
                className="relative flex h-10 w-10 items-center justify-center"
                aria-label="Вішлист"
              >
                <Image src={ICON_LIKE} alt="" width={20} height={19} className="h-[18px] w-auto" />
                {favoritesCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-4 px-0.5 flex items-center justify-center text-[9px] font-bold text-white bg-[var(--brand-olive)] rounded-full">
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </span>
                )}
              </Link>
              <Link
                href="/cart"
                className="relative flex h-10 w-10 items-center justify-center"
                aria-label="Кошик"
              >
                <Image src={ICON_CART} alt="" width={23} height={21} className="h-[18px] w-auto" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-4 px-0.5 flex items-center justify-center text-[9px] font-bold text-white bg-[var(--brand-olive)] rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SidebarMenu isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <SidebarSearch isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
    </>
  );
}
