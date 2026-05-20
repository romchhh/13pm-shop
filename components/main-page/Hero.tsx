"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import type { HeroSlideData } from "@/lib/heroSlides.shared";
import { resolveHeroImageSrc } from "@/lib/heroSlides.shared";

const AUTOPLAY_MS = 5000;

const heroTextShadow =
  "0 1px 2px rgba(255,255,255,0.95), 0 0 24px rgba(255,255,255,0.65)";

const heroTitleStyleDesktop: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(40px, 5.2vw, 72px)",
  lineHeight: "1.2",
  letterSpacing: "-0.04em",
  textShadow: heroTextShadow,
};

const heroTitleStyleMobile: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(26px, 7.5vw, 36px)",
  lineHeight: "1.2",
  letterSpacing: "-0.04em",
  textShadow: heroTextShadow,
};

const heroSubtitleStyle: React.CSSProperties = {
  fontFamily: "Montserrat, sans-serif",
  fontWeight: 500,
  fontSize: "clamp(18px, 2.4vw, 38px)",
  lineHeight: "1.35",
  letterSpacing: "-0.03em",
  textShadow: heroTextShadow,
};

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

  const pagination = hasMultiple ? (
    <div className="flex items-center gap-2.5">
      {slides.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setActiveSlide(i)}
          className={`rounded-full transition-all ${
            i === activeSlide
              ? "h-2.5 w-2.5 bg-[#8B5E3F] lg:bg-white"
              : "h-2 w-2 border-2 border-[#8B5E3F] bg-transparent lg:border-white/90"
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
      className="relative mt-[var(--site-contact-bar-height)] flex h-[calc(100svh-var(--site-contact-bar-height))] min-h-[calc(100svh-var(--site-contact-bar-height))] w-full flex-col overflow-hidden lg:block"
    >
      <div className="relative z-0 flex min-h-0 flex-1 flex-col lg:absolute lg:inset-0 lg:min-h-0 lg:flex-none">
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
                alt=""
                fill
                priority={i === 0}
                className="scale-[1.02] object-cover object-top blur-[1px] lg:hidden"
                sizes="100vw"
              />
              <Image
                src={resolveHeroImageSrc(s.desktopImage)}
                alt=""
                fill
                priority={i === 0}
                className="hidden scale-[1.02] object-cover object-[65%_top] blur-[1px] lg:block"
                sizes="100vw"
              />
            </div>
          ))}
          <div
            className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#E8E4DC]/92 via-[#E8E4DC]/55 to-transparent lg:block lg:max-w-[62%] lg:from-[#E8E4DC]/88 lg:via-[#E8E4DC]/35"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(45%,220px)] bg-gradient-to-t from-black/30 via-black/12 to-transparent lg:h-[min(38%,280px)] lg:from-black/25"
            aria-hidden
          />
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-10 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-white/80 transition-colors hover:text-white lg:flex"
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
              className="absolute right-10 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center text-white/80 transition-colors hover:text-white lg:flex"
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

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-6 pb-8 pt-[calc(var(--site-nav-height)+0.75rem)] lg:hidden">
          <div className="max-w-[340px] space-y-3">
            <h1 className="text-left text-black" style={heroTitleStyleMobile}>
              {slide.title}
            </h1>
            <p className="text-left text-black/90" style={heroSubtitleStyle}>
              {slide.subtitle}
            </p>
          </div>

          <div className="min-h-[1rem] flex-1" aria-hidden />

          <Link
            href="/catalog"
            className="flex w-full items-center justify-center rounded-full bg-white py-4 font-['Montserrat'] text-base font-medium text-black shadow-sm transition-colors hover:bg-[#FFF9F0]"
            style={{ letterSpacing: "-0.02em" }}
          >
            Переглянути каталог
          </Link>
        </div>

        <div className="relative z-10 mx-auto hidden h-full min-h-full w-full max-w-[1920px] items-center px-14 pb-20 pt-[calc(var(--site-nav-height)+0.5rem)] xl:px-20 lg:flex">
          <div className="flex w-full max-w-[600px] flex-col items-start gap-8 xl:max-w-[720px]">
            <div className="space-y-5 xl:space-y-6">
              <h1 className="text-left text-black" style={heroTitleStyleDesktop}>
                {slide.title}
              </h1>
              <p className="max-w-xl text-left text-black/90" style={heroSubtitleStyle}>
                {slide.subtitle}
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex min-h-[60px] items-center justify-center rounded-full bg-white px-16 py-5 font-['Montserrat'] text-2xl font-medium text-black shadow-md transition-colors hover:bg-[#FFF9F0] xl:min-h-[64px] xl:px-[4.5rem] xl:py-5 xl:text-[26px]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Переглянути каталог
            </Link>
          </div>
        </div>

        {pagination && (
          <div className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 lg:flex">
            {pagination}
          </div>
        )}
      </div>

      {pagination && (
        <div className="relative z-20 flex shrink-0 items-center justify-center bg-white py-3.5 lg:hidden">
          {pagination}
        </div>
      )}
    </section>
  );
}
