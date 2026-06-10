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

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64v-3.5a6.67 6.67 0 1 0 5.79 6.61V8.57a8.16 8.16 0 0 0 4.32 1.24V6.69Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  Telegram: TelegramIcon,
} as const;

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
  return (
    <div className="flex flex-wrap gap-2">
      {siteSocialLinks.map(({ href, label }) => {
        const Icon = SOCIAL_ICONS[label as keyof typeof SOCIAL_ICONS];
        return (
          <Link
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full border border-[#E0E0DE] px-3.5 py-2 font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-[#1C1C1C] transition-colors hover:border-[var(--site-accent)] hover:text-[var(--site-accent)]"
          >
            {Icon ? <Icon /> : null}
            {label}
          </Link>
        );
      })}
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
