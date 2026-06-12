"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import type { HeroSlideData } from "@/lib/heroSlides.shared";
import { resolveHeroImageSrc } from "@/lib/heroSlides.shared";
import { SITE_STORE_NAME } from "@/lib/siteBrand";

function heroSlideImageAlt(slide: HeroSlideData): string {
  const headline = slide.title.replace(/\n+/g, " ").trim();
  return `${headline} — ${SITE_STORE_NAME}, тактичний одяг в Україні`;
}

const AUTOPLAY_MS = 5000;

const heroTextShadow = "0 2px 28px rgba(0,0,0,0.5)";
const heroSubtitleShadow = "0 1px 14px rgba(0,0,0,0.45)";

const HERO_FEATURES = [
  { label: "-10% для ЗСУ, ДСНС, Поліції" },
  { label: "-15% знижка, якщо замовлення на суму від 5000 грн" },
  { label: "1–3 дні доставка" },
] as const;

function CatalogArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeroTitle({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;

  return (
    <h1
      className="text-left text-white font-['Montserrat'] font-bold leading-[1.02] tracking-[-0.04em] text-[clamp(2.75rem,11vw,3.25rem)] sm:text-[clamp(3rem,10vw,3.75rem)] lg:text-[clamp(3.25rem,5.5vw,5.5rem)] xl:text-[clamp(3.75rem,5vw,6.25rem)]"
      style={{ textShadow: heroTextShadow }}
    >
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </h1>
  );
}

function HeroFeaturesBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-1 divide-y divide-white/25 border-t border-white/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0 ${className}`}
    >
      {HERO_FEATURES.map((item) => (
        <p
          key={item.label}
          className="flex items-center justify-center px-2 py-3.5 text-center font-['Montserrat'] text-[11px] font-bold uppercase leading-snug tracking-[0.08em] text-white/95 sm:px-3 sm:py-4 sm:text-xs sm:tracking-[0.1em] lg:py-5 lg:text-sm lg:tracking-[0.12em]"
        >
          {item.label}
        </p>
      ))}
    </div>
  );
}

function HeroCatalogCard({
  className = "",
  variant = "desktop",
}: {
  className?: string;
  variant?: "desktop" | "bar";
}) {
  const isBar = variant === "bar";

  if (isBar) {
    return (
      <Link
        href="/catalog"
        className={`group flex flex-row items-center justify-between gap-3 rounded-[1.5rem] bg-white p-4 text-[#1C1C1C] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-transform hover:scale-[1.01] sm:p-4 ${className}`}
      >
        <div className="min-w-0 flex-1">
          <p className="font-['Montserrat'] text-sm font-semibold leading-tight text-black/55 sm:text-base">
            Тактичний одяг
          </p>
          <p className="mt-1 font-['Montserrat'] text-xl font-bold leading-tight tracking-tight transition-colors group-hover:text-black sm:text-2xl">
            Перейти до каталогу
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C1C1C] text-white transition-colors group-hover:bg-[var(--site-accent)] sm:h-11 sm:w-11">
          <CatalogArrowIcon />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/catalog"
      className={`group flex w-full max-w-[20rem] flex-col justify-between rounded-[1.5rem] bg-white p-4 text-[#1C1C1C] shadow-[0_20px_50px_rgba(0,0,0,0.38)] transition-transform hover:scale-[1.02] xl:max-w-[21rem] xl:p-4 ${className}`}
    >
      <div>
        <p className="font-['Montserrat'] text-sm font-semibold leading-tight text-black/55 sm:text-base">
          Тактичний одяг
        </p>
        <p className="mt-1.5 font-['Montserrat'] text-[clamp(1.375rem,2.4vw,1.875rem)] font-bold leading-[1.08] tracking-tight transition-colors group-hover:text-black">
          Перейти до каталогу
        </p>
      </div>
      <span className="mt-3 flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full bg-[#1C1C1C] text-white transition-colors group-hover:bg-[var(--site-accent)]">
        <CatalogArrowIcon className="scale-90" />
      </span>
    </Link>
  );
}

function HeroScrollHint({ className = "" }: { className?: string }) {
  return (
    <a
      href="#categories"
      className={`inline-flex flex-col items-center gap-1.5 font-['Montserrat'] text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80 transition-colors hover:text-white sm:text-xs ${className}`}
    >
      
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5v14M6 13l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}

type HeroProps = {
  slides: HeroSlideData[];
};

export default function Hero({ slides }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideCount = slides.length;
  const slide = slides[activeSlide] ?? slides[0];
  const hasMultiple = slideCount > 1;

  const goPrev = useCallback(() => {
    setActiveSlide((i) => (i <= 0 ? slideCount - 1 : i - 1));
  }, [slideCount]);

  const goNext = useCallback(() => {
    setActiveSlide((i) => (i >= slideCount - 1 ? 0 : i + 1));
  }, [slideCount]);

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = setInterval(() => {
      setActiveSlide((i) => (i >= slideCount - 1 ? 0 : i + 1));
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [hasMultiple, slideCount]);

  const titleLines = slide.title.split("\n").filter(Boolean);

  const pagination = hasMultiple ? (
    <div className="flex items-center gap-2.5">
      {slides.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setActiveSlide(i)}
          className={`rounded-full transition-all ${
            i === activeSlide
              ? "h-2.5 w-2.5 bg-white"
              : "h-2 w-2 border-2 border-white/80 bg-transparent"
          } cursor-pointer`}
          aria-label={i === activeSlide ? `Слайд ${i + 1}` : `Перейти до слайду ${i + 1}`}
          aria-current={i === activeSlide ? "true" : undefined}
        />
      ))}
    </div>
  ) : null;

  return (
    <section
      id="hero"
      className="relative mt-[var(--site-contact-bar-height)] flex h-[calc(100svh-var(--site-contact-bar-height))] min-h-[calc(100svh-var(--site-contact-bar-height))] w-full flex-col overflow-hidden"
    >
      <div className="relative z-0 flex min-h-0 flex-1 flex-col">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {slides.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === activeSlide ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={i !== activeSlide}
            >
              <Image
                src={resolveHeroImageSrc(s.mobileImage)}
                alt={heroSlideImageAlt(s)}
                fill
                priority={i === 0}
                className="object-cover object-center lg:hidden"
                sizes="100vw"
              />
              <Image
                src={resolveHeroImageSrc(s.desktopImage)}
                alt={heroSlideImageAlt(s)}
                fill
                priority={i === 0}
                className="hidden object-cover object-center lg:block"
                sizes="100vw"
              />
            </div>
          ))}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/15"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(62%,380px)] bg-gradient-to-t from-black/85 via-black/45 to-transparent lg:from-black/75"
            aria-hidden
          />
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-white/80 transition-colors hover:text-white lg:flex xl:left-10"
              aria-label="Попередній слайд"
            >
              <svg width="24" height="40" viewBox="0 0 24 40" fill="none" aria-hidden>
                <path
                  d="M20 2L4 20L20 38"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-white/80 transition-colors hover:text-white lg:flex xl:right-10"
              aria-label="Наступний слайд"
            >
              <svg width="24" height="40" viewBox="0 0 24 40" fill="none" aria-hidden>
                <path
                  d="M4 2L20 20L4 38"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}

        {/* Контент: на моб. — по центру висоти; на десктопі — зліва + каталог справа */}
        <div className="absolute inset-x-0 top-[var(--site-nav-height)] bottom-[min(44vh,330px)] z-10 mx-auto flex w-full max-w-[1920px] flex-col justify-center px-6 sm:bottom-[min(42vh,310px)] lg:relative lg:inset-auto lg:flex lg:h-full lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:pb-[7.5rem] lg:px-14 lg:pt-[calc(var(--site-nav-height)+1.25rem)] xl:gap-16 xl:px-20">
          <div className="max-w-2xl space-y-5 mt-14 sm:mt-16 lg:mt-0 lg:max-w-[min(52rem,52%)] lg:space-y-7">
            <HeroTitle lines={titleLines} />
            <p
              className="max-w-lg text-left font-['Montserrat'] font-normal leading-[1.5] tracking-[-0.01em] text-white/90 text-[clamp(1.125rem,4.5vw,1.3125rem)] sm:text-lg lg:max-w-md lg:text-[clamp(1.0625rem,1.6vw,1.25rem)] lg:leading-[1.55]"
              style={{ textShadow: heroSubtitleShadow }}
            >
              {slide.subtitle}
            </p>
          </div>

          <HeroCatalogCard
            variant="desktop"
            className="hidden lg:flex lg:shrink-0 lg:justify-self-end"
          />
        </div>

        {/* Нижня зона: моб. каталог → переваги → «Гортай вниз» (однаково на всіх екранах) */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-[1920px]">
            <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-8 pb-3 sm:px-6 lg:hidden">
              <HeroCatalogCard variant="bar" className="w-full" />
            </div>

            <div className="relative">
              {pagination && (
                <div className="absolute -top-10 right-4 hidden lg:block xl:right-20">
                  {pagination}
                </div>
              )}
              <HeroFeaturesBar />
            </div>

            <div className="flex justify-center bg-gradient-to-t from-black/70 to-transparent py-3 sm:py-4">
              <HeroScrollHint />
            </div>

            {pagination && (
              <div className="flex justify-center bg-[var(--site-bar-dark)] py-3 lg:hidden">
                {pagination}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
