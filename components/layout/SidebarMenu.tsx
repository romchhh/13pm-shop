"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCategories } from "@/lib/CategoriesProvider";
import { siteSocialLinks } from "@/lib/siteContact";
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

function ChevronRight() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-[#1C1C1C]/25"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function MenuCloseButton({ onClose, className = "" }: { onClose: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#E0E0DE] bg-white text-[#1C1C1C] transition-colors hover:border-[#1C1C1C]/20 hover:bg-[#F7F7F5] ${className}`}
      aria-label="Закрити меню"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 font-['Montserrat'] text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1C1C]/40">
      {children}
    </p>
  );
}

function MenuListItem({
  href,
  children,
  onClick,
  highlight = false,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  highlight?: boolean;
}) {
  return (
    <li className="border-b border-[#E8E8E6] last:border-b-0">
      <Link
        href={href}
        onClick={() => onClick?.()}
        className={`group flex items-center justify-between gap-3 py-3.5 font-['Montserrat'] transition-colors ${
          highlight
            ? "text-[var(--site-accent)] font-semibold"
            : "text-[#1C1C1C] font-medium hover:text-[var(--site-accent)]"
        }`}
      >
        <span className="text-[15px] leading-snug lg:text-base">{children}</span>
        <ChevronRight />
      </Link>
    </li>
  );
}

function CategorySection({
  onClose,
  twoColumns = false,
}: {
  onClose: () => void;
  twoColumns?: boolean;
}) {
  const { categories, loading, error } = useCategories();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const listClass = twoColumns
    ? "grid grid-cols-1 gap-x-6 sm:grid-cols-2"
    : "flex flex-col";

  return (
    <section>
      <SectionLabel>Каталог</SectionLabel>
      <ul className={listClass}>
        <li className={`border-b border-[#E8E8E6] ${twoColumns ? "sm:col-span-2" : ""}`}>
          <Link
            href="/catalog"
            onClick={onClose}
            className="group flex items-center justify-between gap-3 py-3.5 font-['Montserrat'] text-[15px] font-bold text-[#1C1C1C] transition-colors hover:text-[var(--site-accent)] lg:text-base"
          >
            <span>Весь каталог</span>
            <ChevronRight />
          </Link>
        </li>
        <li className={`border-b border-[#E8E8E6] ${twoColumns ? "sm:col-span-2" : ""}`}>
          <Link
            href={CATALOG_PROMO_HREF}
            onClick={onClose}
            className="flex items-center justify-between gap-3 rounded-lg bg-[var(--site-accent)]/10 py-3.5 pl-3 pr-1 font-['Montserrat'] text-[15px] font-semibold text-[var(--site-accent)] transition-colors hover:bg-[var(--site-accent)]/15 lg:text-base"
          >
            <span>Акції</span>
            <ChevronRight />
          </Link>
        </li>
        {!mounted || loading ? (
          <li className={`py-4 font-['Montserrat'] text-sm text-[#1C1C1C]/50 ${twoColumns ? "sm:col-span-2" : ""}`}>
            Завантаження категорій…
          </li>
        ) : error ? (
          <li className={`py-4 font-['Montserrat'] text-sm text-red-600 ${twoColumns ? "sm:col-span-2" : ""}`}>
            Не вдалося завантажити категорії
          </li>
        ) : (
          categories.map((cat) => (
            <MenuListItem
              key={cat.id}
              href={getCategoryMenuHref(cat)}
              onClick={onClose}
            >
              {cat.name}
            </MenuListItem>
          ))
        )}
      </ul>
    </section>
  );
}

function PagesNav({
  onClose,
  onAnchorClick,
}: {
  onClose: () => void;
  onAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => void;
}) {
  return (
    <section>
      <SectionLabel>Сайт</SectionLabel>
      <ul>
        {mainNavLinks.map((link) => {
          const hashId = getMainNavHashId(link.href);
          return (
            <li key={link.href} className="border-b border-[#E8E8E6] last:border-b-0">
              <Link
                href={link.href}
                className={`group flex items-center justify-between gap-3 py-3.5 font-['Montserrat'] transition-colors ${
                  link.label === "BESTSELLERS"
                    ? "font-semibold text-[var(--site-accent)]"
                    : "font-medium text-[#1C1C1C] hover:text-[var(--site-accent)]"
                }`}
                onClick={(e) => {
                  if (hashId) onAnchorClick(e, `#${hashId}`);
                  else onClose();
                }}
              >
                <span className="text-[15px] leading-snug lg:text-base">{link.label}</span>
                <ChevronRight />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SocialBar({ onClose }: { onClose: () => void }) {
  const links = siteSocialLinks.map(({ href, label }) => ({ href, label }));

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="rounded-full border border-[#E0E0DE] px-4 py-2 font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-[#1C1C1C] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

function MenuPanelBody({
  onClose,
  onAnchorClick,
  categoryTwoColumns = false,
}: {
  onClose: () => void;
  onAnchorClick: (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => void;
  categoryTwoColumns?: boolean;
}) {
  return (
    <div className="space-y-8">
      <CategorySection onClose={onClose} twoColumns={categoryTwoColumns} />
      <div className="h-px bg-[#E0E0DE]" aria-hidden />
      <PagesNav onClose={onClose} onAnchorClick={onAnchorClick} />
    </div>
  );
}

export default function SidebarMenu({
  isOpen,
  setIsOpen,
}: SidebarMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const onClose = () => setIsOpen(false);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    onClose();
    if (pathname === "/") {
      setTimeout(() => {
        document.getElementById(anchor.replace("#", ""))?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      router.push(`/${anchor}`);
      setTimeout(() => {
        document.getElementById(anchor.replace("#", ""))?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    }
  };

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative z-[var(--z-site-overlay)]">
      {isOpen && (
        <div
          className="fixed inset-0 z-[var(--z-site-overlay-backdrop)] bg-[#1C1C1C]/50 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Мобільний: заокруглений sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        className={`fixed inset-x-0 bottom-0 top-[var(--site-header-offset)] z-[var(--z-site-overlay)] flex flex-col overflow-hidden rounded-t-[1.75rem] border-t border-[#E0E0DE]/90 bg-[#FAFAF9] shadow-[0_-8px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E0E0DE] bg-white px-5 py-4">
          <div>
            <p className="font-['Montserrat'] text-lg font-bold tracking-tight text-[#1C1C1C]">Меню</p>
            <p className="mt-0.5 font-['Montserrat'] text-xs text-[#1C1C1C]/50">13pm tactic</p>
          </div>
          <MenuCloseButton onClose={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          <MenuPanelBody onClose={onClose} onAnchorClick={handleAnchorClick} />
        </div>

        <div className="shrink-0 border-t border-[#E0E0DE] bg-white px-5 py-4">
          <SectionLabel>Ми в соцмережах</SectionLabel>
          <SocialBar onClose={onClose} />
        </div>
      </div>

      {/* Десктоп: панель зліва */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        className={`fixed inset-y-0 left-0 z-[var(--z-site-overlay)] hidden h-dvh w-[min(28rem,92vw)] flex-col border-r border-[#E0E0DE] bg-[#FAFAF9] shadow-[12px_0_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out lg:flex ${
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E0E0DE] bg-white px-6 py-5">
          <div>
            <p className="font-['Montserrat'] text-xl font-bold tracking-tight text-[#1C1C1C]">Меню</p>
            <p className="mt-1 font-['Montserrat'] text-sm text-[#1C1C1C]/50">
              Каталог та розділи сайту
            </p>
          </div>
          <MenuCloseButton onClose={onClose} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          <MenuPanelBody
            onClose={onClose}
            onAnchorClick={handleAnchorClick}
            categoryTwoColumns
          />
        </div>

        <div className="shrink-0 border-t border-[#E0E0DE] bg-white px-6 py-4">
          <SectionLabel>Ми в соцмережах</SectionLabel>
          <SocialBar onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
