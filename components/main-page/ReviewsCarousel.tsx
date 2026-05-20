"use client";

import { useRef } from "react";
import type { ReviewMediaItem } from "@/lib/getReviewMedia";
import {
  homeSectionHeaderRowClass,
  homeSectionOuterClass,
} from "@/lib/homeSectionSpacing";

interface ReviewsCarouselProps {
  media: ReviewMediaItem[];
}

export default function ReviewsCarousel({ media }: ReviewsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.75, 300);
    el.scrollBy({ left: direction === "left" ? -step : step, behavior: "smooth" });
  };

  if (media.length === 0) {
    return null;
  }

  return (
    <section
      id="reviews"
      className="scroll-mt-[var(--site-header-offset)] w-full bg-white"
      aria-labelledby="reviews-heading"
    >
      <div className={`max-w-[1920px] mx-auto px-6 lg:px-10 ${homeSectionOuterClass}`}>
        <div className={homeSectionHeaderRowClass}>
          <h2
            id="reviews-heading"
            className="font-['Montserrat'] text-2xl font-semibold tracking-tight text-black lg:text-3xl"
          >
            Відгуки
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="p-2 text-[#8B5E3F] hover:opacity-70 transition-opacity"
              aria-label="Попередній відгук"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="p-2 text-[#8B5E3F] hover:opacity-70 transition-opacity"
              aria-label="Наступний відгук"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth pb-2 sm:gap-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {media.map((item) => (
            <article
              key={item.src}
              className="flex-shrink-0 w-[min(85vw,320px)] sm:w-[340px] lg:w-[380px]"
            >
              <div className="overflow-hidden rounded-2xl">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    controls
                    playsInline
                    preload="metadata"
                    className="block h-auto w-full max-h-[min(85vh,560px)] object-contain"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt="Відгук клієнта"
                    className="block h-auto w-full"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
