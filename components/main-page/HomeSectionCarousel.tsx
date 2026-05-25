"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  Children,
  type ReactNode,
} from "react";
import {
  homeSectionCarouselNavClass,
  homeSectionHeaderRowClass,
  homeSectionOuterClass,
} from "@/lib/homeSectionSpacing";

interface HomeSectionCarouselProps {
  title: string;
  /** Якщо `null` — без посилання «Весь каталог» */
  catalogHref?: string | null;
  /** Not required when `loading` is true (early return). */
  children?: ReactNode;
  loading?: boolean;
  loadingMessage?: string;
}

function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.85, 280);
    el.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
  };

  return {
    scrollRef,
    scrollLeft: () => scrollByPage("left"),
    scrollRight: () => scrollByPage("right"),
  };
}

export default function HomeSectionCarousel({
  title,
  catalogHref = "/catalog",
  children,
  loading,
  loadingMessage = "Завантаження...",
}: HomeSectionCarouselProps) {
  const { scrollRef, scrollLeft, scrollRight } = useHorizontalScroll();
  const itemCount = Children.count(children ?? null);
  const [itemsPerView, setItemsPerView] = useState(2);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setItemsPerView(mq.matches ? 4 : 2);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const pageCount =
    itemCount > 0 ? Math.max(1, Math.ceil(itemCount / itemsPerView)) : 0;

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || pageCount <= 1) {
      setActiveDot(0);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setActiveDot(0);
      return;
    }
    let idx = Math.round((el.scrollLeft / maxScroll) * (pageCount - 1));
    idx = Math.max(0, Math.min(pageCount - 1, idx));
    setActiveDot(idx);
  }, [pageCount]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateActiveFromScroll();
    el.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    const ro = new ResizeObserver(() => updateActiveFromScroll());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateActiveFromScroll);
      ro.disconnect();
    };
  }, [scrollRef, updateActiveFromScroll, itemCount, itemsPerView]);

  const goToDot = (i: number) => {
    const el = scrollRef.current;
    if (!el || pageCount <= 1) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = pageCount === 1 ? 0 : (i / (pageCount - 1)) * maxScroll;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="site-section site-section--white">
        <div className={`max-w-[1920px] mx-auto px-6 lg:px-10 ${homeSectionOuterClass}`}>
          <p className="font-['Montserrat'] text-black/60">{loadingMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white">
      <div className={`max-w-[1920px] mx-auto px-6 lg:px-10 ${homeSectionOuterClass}`}>
        <div className={homeSectionHeaderRowClass}>
          <h2 className="site-heading text-2xl lg:text-3xl">
            {title}
          </h2>
          {catalogHref ? (
            <Link
              href={catalogHref}
              className="inline-flex shrink-0 items-center gap-1 font-['Montserrat'] text-sm text-black/45 hover:text-black/70 transition-colors"
            >
              Весь каталог
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <span className="hidden sm:block sm:w-24" aria-hidden />
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex w-full gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-hide lg:gap-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children ?? null}
        </div>

        <div
          className={homeSectionCarouselNavClass}
          aria-label="Навігація каруселі"
        >
          <button
            type="button"
            onClick={scrollLeft}
            className="shrink-0 rounded-full p-2 text-[var(--brand-olive)] transition-opacity hover:bg-[var(--brand-olive-soft)] hover:opacity-80"
            aria-label="Прокрутити вліво"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          {pageCount > 1 ? (
            <div className="flex items-center gap-2.5" role="tablist">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === activeDot}
                  onClick={() => goToDot(i)}
                  className={`rounded-full transition-all ${
                    i === activeDot
                      ? "h-2.5 w-2.5 bg-[var(--brand-olive)]"
                      : "h-2 w-2 border-2 border-[var(--brand-olive)] bg-transparent"
                  }`}
                  aria-label={`Показати блок ${i + 1} з ${pageCount}`}
                />
              ))}
            </div>
          ) : (
            <span className="w-8" aria-hidden />
          )}
          <button
            type="button"
            onClick={scrollRight}
            className="shrink-0 rounded-full p-2 text-[var(--brand-olive)] transition-opacity hover:bg-[var(--brand-olive-soft)] hover:opacity-80"
            aria-label="Прокрутити вправо"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export { productCarouselItemClass as homeCarouselItemClass } from "@/lib/productCardStyles";
