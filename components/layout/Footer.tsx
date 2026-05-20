"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { siteContact } from "@/lib/siteContact";
import { SITE_WORDMARK } from "@/lib/siteBrand";
import { useCategories } from "@/lib/CategoriesProvider";

const FOOTER_BG = "#d1d1a6";

const PAYMENT_LOGOS = [
  { src: "/images/icons/Badge.svg", alt: "Visa" },
  { src: "/images/icons/Badge-1.svg", alt: "Mastercard" },
  { src: "/images/icons/Badge-2.svg", alt: "Apple Pay" },
  { src: "/images/icons/Badge-3.svg", alt: "Google Pay" },
] as const;

const footerLinkClass =
  "font-['Montserrat'] text-sm text-black/90 hover:opacity-70 transition-opacity";

const footerHeadingClass =
  "font-['Montserrat'] text-xs font-bold uppercase tracking-[0.14em] text-black text-center lg:text-left";

const socialLinkClass =
  "inline-flex items-center gap-3 font-['Montserrat'] text-sm font-medium text-black/90 hover:opacity-70 transition-opacity";

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64v-3.5a6.67 6.67 0 1 0 5.79 6.61V8.57a8.16 8.16 0 0 0 4.32 1.24V6.69Z" />
    </svg>
  );
}

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const { categories, loading: categoriesLoading } = useCategories();

  const scrollToAnchor = (anchor: string) => {
    const id = anchor.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleInPageAnchor = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (pathname === "/") {
      e.preventDefault();
      scrollToAnchor(anchor);
    } else {
      e.preventDefault();
      router.push("/" + anchor);
      setTimeout(() => scrollToAnchor(anchor), 200);
    }
  };

  const navLinks = (
    <>
      <Link href="/" className={footerLinkClass}>
        Головна
      </Link>
      <Link href="/catalog" className={footerLinkClass}>
        Каталог товарів
      </Link>
      <Link href="/catalog?new=1" className={footerLinkClass}>
        Новинки
      </Link>
      <Link href="/catalog?hits=1" className={footerLinkClass}>
        Хіти
      </Link>
      <Link
        href="/#about"
        className={footerLinkClass}
        onClick={(e) => handleInPageAnchor(e, "#about")}
      >
        Про нас
      </Link>
      <Link href="/#faq" className={footerLinkClass} onClick={(e) => handleInPageAnchor(e, "#faq")}>
        FAQ
      </Link>
      <Link
        href="/#reviews"
        className={footerLinkClass}
        onClick={(e) => handleInPageAnchor(e, "#reviews")}
      >
        Відгуки
      </Link>
      <Link href="/contacts" className={footerLinkClass}>
        Контакти
      </Link>
      <Link href="/delivery-and-payment" className={`${footerLinkClass} hidden lg:inline`}>
        Умови доставки
      </Link>
      <Link href="/returns-and-exchange" className={`${footerLinkClass} hidden lg:inline`}>
        Умови повернення
      </Link>
    </>
  );

  return (
    <footer
      className="relative z-0 w-full text-[#1a1a1a] border-t border-[#3D1A00]/15"
      style={{ backgroundColor: FOOTER_BG }}
    >
      <div className="max-w-[1920px] mx-auto px-6 pt-20 pb-10 sm:pt-24 sm:pb-12 lg:px-12 lg:pt-28 lg:pb-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-10 xl:gap-16">
          {/* Бренд */}
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:gap-5 lg:text-left max-w-md lg:max-w-none mx-auto lg:mx-0">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logos/logo_black.svg"
                alt={SITE_WORDMARK}
                width={200}
                height={56}
                className="h-14 w-auto sm:h-16 lg:h-12 mx-auto lg:mx-0"
              />
            </Link>
            <p className="font-['Montserrat'] text-sm leading-relaxed text-black/85 max-w-sm">
              Власне виробництво дерев&apos;яного декору та подарунків.
            </p>
            <p className="font-['Montserrat'] text-sm leading-relaxed text-black/85 max-w-sm">
              Іменні вироби, фоторамки, сімейні композиції та унікальні подарунки ручної роботи.
            </p>
          </div>

          {/* Навігація */}
          <div className="flex flex-col items-center gap-4 lg:items-start lg:gap-5">
            <h3 className={footerHeadingClass}>Навігація</h3>
            <nav className="flex flex-wrap justify-center gap-x-3 gap-y-2 max-w-md lg:max-w-none lg:flex-col lg:items-start lg:gap-3 lg:justify-start">
              {navLinks}
            </nav>
          </div>

          {/* Категорії */}
          <div className="flex flex-col items-center gap-4 lg:items-start lg:gap-5">
            <h3 className={footerHeadingClass}>Категорії</h3>
            <nav className="flex flex-wrap justify-center gap-x-3 gap-y-2 max-w-md lg:max-w-none lg:flex-col lg:items-start lg:gap-3 lg:justify-start">
              {categoriesLoading && categories.length === 0 ? (
                <span className="text-black/50 text-sm font-['Montserrat']">Завантаження…</span>
              ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalog?categoryId=${cat.id}`}
                    className={footerLinkClass}
                  >
                    {cat.name}
                  </Link>
                ))
              )}
            </nav>
          </div>

          {/* Соцмережі + оплата */}
          <div className="flex flex-col items-center gap-6 lg:items-start">
            <div className="flex flex-col items-center gap-4 w-full lg:items-start">
              <h3 className={footerHeadingClass}>Соц-мережі</h3>
              <nav
                className="flex flex-col items-center gap-3 lg:items-start"
                aria-label="Соціальні мережі"
              >
                <Link
                  href={siteContact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialLinkClass}
                  aria-label={`Instagram ${siteContact.instagramHandle}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 text-black">
                    <InstagramIcon />
                  </span>
                  <span>
                    Instagram <span className="text-black/75">{siteContact.instagramHandle}</span>
                  </span>
                </Link>
                <Link
                  href={siteContact.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={socialLinkClass}
                  aria-label={`TikTok ${siteContact.tiktokHandle}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 text-black">
                    <TikTokIcon />
                  </span>
                  <span>
                    TikTok <span className="text-black/75">{siteContact.tiktokHandle}</span>
                  </span>
                </Link>
              </nav>
            </div>
            <ul
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
              aria-label="Способи оплати"
            >
              {PAYMENT_LOGOS.map(({ src, alt }) => (
                <li key={src}>
                  <Image
                    src={src}
                    alt={alt}
                    width={65}
                    height={49}
                    className="h-9 w-auto object-contain sm:h-10"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-black/25">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-5">
          <p className="text-center font-['Montserrat'] text-xs text-black/60">
            <Link
              href="https://new.telebots.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              created by telebots
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
