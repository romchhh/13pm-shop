"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCategories } from "@/lib/CategoriesProvider";
import { siteContact } from "@/lib/siteContact";
import { CATALOG_PROMO_HREF, getMainNavHashId, mainNavLinks } from "@/lib/siteNav";
import { categoryCanonicalPath } from "@/lib/seo";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface SidebarMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function getCategoryMenuHref(cat: { id: number; name: string; slug?: string | null }) {
  if (cat.slug?.trim()) return categoryCanonicalPath(cat.slug, cat.name);
  return `/catalog?categoryId=${cat.id}`;
}

export default function SidebarMenu({
  isOpen,
  setIsOpen,
}: SidebarMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { categories, loading, error } = useCategories();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    setIsOpen(false);
    if (pathname === "/") {
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      router.push(`/${anchor}`);
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);
    }
  };

  useBodyScrollLock(isOpen);

  return (
    <div className="relative z-[var(--z-site-overlay)]">
      {isOpen && (
        <div
          className="fixed top-[var(--site-header-offset)] left-0 right-0 bottom-0 bg-black/40 z-[var(--z-site-overlay-backdrop)]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-[var(--site-header-offset)] left-0 h-[calc(100vh-var(--site-header-offset))] w-full sm:w-4/5 sm:max-w-md bg-white shadow-md z-[var(--z-site-overlay)] transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-hidden flex flex-col`}
      >
        <div className="border-b border-[#1C1C1C]/10 bg-white">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex flex-row gap-3 px-4 py-4 min-w-max">
              {!mounted ? (
                <div className="px-4 py-2 text-sm text-[#1C1C1C]/60 font-['Montserrat']">Завантаження...</div>
              ) : loading ? (
                <div className="px-4 py-2 text-sm text-[#1C1C1C]/60 font-['Montserrat']">Завантаження...</div>
              ) : error ? (
                <div className="px-4 py-2 text-sm text-red-500 font-['Montserrat']">Помилка: {error}</div>
              ) : (
                <>
                  <Link
                    href={CATALOG_PROMO_HREF}
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-[var(--site-accent)] px-5 py-3 font-['Montserrat'] text-base font-semibold whitespace-nowrap text-white transition-opacity hover:opacity-90"
                  >
                    Акції
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={getCategoryMenuHref(cat)}
                      onClick={() => setIsOpen(false)}
                      className="rounded-full bg-[#1C1C1C]/10 px-5 py-3 font-['Montserrat'] text-base font-semibold whitespace-nowrap text-[#1C1C1C] transition-all duration-200 hover:bg-[#1C1C1C]/20"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <h3 className="mb-4 font-['Montserrat'] text-sm font-semibold uppercase tracking-wider text-[#1C1C1C]/60">
              Меню
            </h3>
            <nav className="space-y-1">
              <Link
                href="/catalog"
                className="block py-2 font-['Montserrat'] text-base font-bold text-[#1C1C1C] transition-colors hover:text-[#1C1C1C]/70"
                onClick={() => setIsOpen(false)}
              >
                Каталог товарів
              </Link>
              {mainNavLinks.map((link) => {
                const hashId = getMainNavHashId(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 font-['Montserrat'] text-base font-bold text-[#1C1C1C] transition-colors hover:text-[#1C1C1C]/70"
                    onClick={(e) => {
                      if (hashId) {
                        handleAnchorClick(e, `#${hashId}`);
                      } else {
                        setIsOpen(false);
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="border-t border-[#1C1C1C]/10 bg-white">
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1C1C]/60 mb-4 font-['Montserrat']">
              ЗВ&apos;ЯЗОК
            </h3>
            <div className="flex flex-row gap-4 flex-wrap">
              <Link
                href={siteContact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-base text-[#1C1C1C] hover:text-[#1C1C1C]/70 transition-colors font-['Montserrat']"
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
                className="flex items-center gap-2 text-base text-[#1C1C1C] hover:text-[#1C1C1C]/70 transition-colors font-['Montserrat']"
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
                className="flex items-center gap-2 text-base text-[#1C1C1C] hover:text-[#1C1C1C]/70 transition-colors font-['Montserrat']"
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
