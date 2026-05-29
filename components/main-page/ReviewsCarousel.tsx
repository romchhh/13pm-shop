"use client";

import Image from "next/image";
import { useRef } from "react";
import type { ReviewMediaItem } from "@/lib/getReviewMedia";
import HomeCarouselNavButton from "@/components/shared/HomeCarouselNavButton";
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
      <div className={`mx-auto max-w-[1920px] px-6 lg:px-10 ${homeSectionOuterClass}`}>
        <div className={homeSectionHeaderRowClass}>
          <div>
            <h2
              id="reviews-heading"
              className="mt-1 font-['Montserrat'] text-2xl font-semibold tracking-tight text-black lg:text-3xl"
            >
              Відгуки
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <HomeCarouselNavButton
              direction="left"
              onClick={() => scroll("left")}
              label="Попередній відгук"
            />
            <HomeCarouselNavButton
              direction="right"
              onClick={() => scroll("right")}
              label="Наступний відгук"
            />
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide sm:gap-5"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {media.map((item, index) => (
            <article
              key={item.filename}
              className="w-[min(78vw,300px)] shrink-0 sm:w-[320px] lg:w-[360px]"
            >
              <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-[#F2F2F0] shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    controls
                    playsInline
                    preload="metadata"
                    className="block max-h-[min(85vh,520px)] w-full object-contain"
                  >
                    <track kind="captions" />
                  </video>
                ) : (
                  <div className="relative aspect-[3/4] w-full bg-[#E8E8E6]">
                    <Image
                      src={item.src}
                      alt={`Відгук клієнта 13pm tactic — фото ${index + 1}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 78vw, 360px"
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
