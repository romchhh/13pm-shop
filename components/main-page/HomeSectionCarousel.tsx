"use client";

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
import HomeCarouselNavButton from "@/components/shared/HomeCarouselNavButton";
import HomePillLink from "@/components/shared/HomePillLink";

interface HomeSectionCarouselProps {
  title: string;
  /** Якщо `null` — без кнопки «Весь каталог» */
  catalogHref?: string | null;
  /** Текст CTA-пілюлі (за замовчуванням «Весь каталог») */
  catalogLabel?: string;
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
  catalogLabel = "Весь каталог",
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
      <section className="w-full bg-white">
        <div className={`max-w-[1920px] mx-auto px-6 lg:px-10 ${homeSectionOuterClass}`}>
          <div className={homeSectionHeaderRowClass}>
            <h2 className="font-['Montserrat'] text-2xl font-semibold tracking-tight text-black lg:text-3xl">
              {title}
            </h2>
          </div>
          <p className="font-['Montserrat'] text-black/60">{loadingMessage}</p>
          <div className={`${homeSectionCarouselNavClass} mt-6 gap-5`} aria-hidden>
            <div className="h-10 w-10 rounded-full bg-black/10 lg:h-11 lg:w-11" />
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-black/15" />
              <div className="h-2.5 w-2.5 rounded-full bg-black/25" />
              <div className="h-2 w-2 rounded-full bg-black/15" />
            </div>
            <div className="h-10 w-10 rounded-full bg-black/10 lg:h-11 lg:w-11" />
          </div>
          {catalogHref ? (
            <div className="mt-6 flex justify-center lg:mt-8">
              <div className="h-12 w-full max-w-sm animate-pulse rounded-full bg-black/10 sm:max-w-md lg:min-w-[300px]" />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white">
      <div className={`max-w-[1920px] mx-auto px-6 lg:px-10 ${homeSectionOuterClass}`}>
        <div className={homeSectionHeaderRowClass}>
          <h2 className="font-['Montserrat'] text-2xl font-semibold tracking-tight text-black lg:text-3xl">
            {title}
          </h2>
        </div>

        <div
          ref={scrollRef}
          className="flex w-full gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-hide lg:gap-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {children ?? null}
        </div>

        <div
          className={`${homeSectionCarouselNavClass} gap-5`}
          aria-label="Навігація каруселі"
        >
          <HomeCarouselNavButton
            direction="left"
            onClick={scrollLeft}
            disabled={pageCount <= 1 || activeDot === 0}
            label="Прокрутити вліво"
          />
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
                      ? "h-2.5 w-2.5 bg-[#1C1C1C]"
                      : "h-2 w-2 border-2 border-[#1C1C1C]/35 bg-transparent hover:border-[#1C1C1C]/60"
                  }`}
                  aria-label={`Показати блок ${i + 1} з ${pageCount}`}
                />
              ))}
            </div>
          ) : (
            <span className="w-8" aria-hidden />
          )}
          <HomeCarouselNavButton
            direction="right"
            onClick={scrollRight}
            disabled={pageCount > 1 && activeDot >= pageCount - 1}
            label="Прокрутити вправо"
          />
        </div>

        {catalogHref ? (
          <div className="mt-6 flex justify-center lg:mt-8">
            <HomePillLink href={catalogHref}>{catalogLabel}</HomePillLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { productCarouselItemClass as homeCarouselItemClass } from "@/lib/productCardStyles";
