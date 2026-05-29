"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

type MediaItem = { url: string; type: string };

type ProductMediaLightboxProps = {
  media: MediaItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
  productName: string;
};

export default function ProductMediaLightbox({
  media,
  initialIndex,
  open,
  onClose,
  productName,
}: ProductMediaLightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useBodyScrollLock(open);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const el = scrollRef.current;
      if (!el || media.length === 0) return;
      const clamped = Math.max(0, Math.min(index, media.length - 1));
      const w = el.clientWidth;
      if (w <= 0) return;
      el.scrollTo({ left: clamped * w, behavior });
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
    },
    [media.length]
  );

  useLayoutEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    const idx = Math.max(0, Math.min(initialIndex, media.length - 1));
    activeIndexRef.current = idx;
    setActiveIndex(idx);
    if (!el || media.length === 0) return;
    const w = el.clientWidth;
    if (w > 0) el.scrollLeft = idx * w;
  }, [open, initialIndex, media.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        const next = Math.min(activeIndexRef.current + 1, media.length - 1);
        scrollToIndex(next);
      }
      if (e.key === "ArrowLeft") {
        const prev = Math.max(activeIndexRef.current - 1, 0);
        scrollToIndex(prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, media.length, scrollToIndex]);

  if (!open || media.length === 0) return null;

  const goPrev = () => scrollToIndex(activeIndexRef.current - 1);
  const goNext = () => scrollToIndex(activeIndexRef.current + 1);

  return (
    <div
      className="fixed inset-0 z-[var(--z-site-overlay)] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={`Фото товару: ${productName}`}
      onClick={onClose}
    >
      <div className="flex min-h-0 flex-1 flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between px-3 py-3 text-white sm:px-4">
          <span className="font-['Montserrat'] text-sm tabular-nums text-white/85">
            {activeIndex + 1} / {media.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-white/95 transition-colors hover:bg-white/10"
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          {media.length > 1 && (
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex <= 0}
              className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-opacity hover:bg-white/25 disabled:pointer-events-none disabled:opacity-25 sm:left-3 sm:h-12 sm:w-12"
              aria-label="Попереднє фото"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              const el = e.currentTarget;
              const w = el.clientWidth;
              if (w <= 0) return;
              const idx = Math.round(el.scrollLeft / w);
              const clamped = Math.max(0, Math.min(idx, media.length - 1));
              if (clamped !== activeIndexRef.current) {
                activeIndexRef.current = clamped;
                setActiveIndex(clamped);
              }
            }}
          >
            {media.map((item, i) => (
              <div
                key={`${item.url}-${i}`}
                className="flex h-full min-h-0 w-full min-w-full shrink-0 snap-center snap-always flex-col items-center justify-center px-3 pb-2 sm:px-6"
              >
                <div className="flex max-h-[min(calc(100dvh-8.5rem),calc(100vh-8.5rem))] w-full max-w-[min(96vw,1200px)] flex-1 items-center justify-center">
                  {item.type === "video" ? (
                    <video
                      className="max-h-full max-w-full bg-transparent object-contain"
                      src={`/api/images/${item.url}`}
                      controls
                      playsInline
                      autoPlay={i === activeIndex}
                      loop
                      muted
                    />
                  ) : (
                    <Image
                      src={`/api/images/${item.url}`}
                      alt={`${productName} — фото ${i + 1} з ${media.length}, 13pm tactic`}
                      width={1600}
                      height={2000}
                      className="h-auto max-h-full w-auto max-w-full bg-transparent object-contain"
                      sizes="96vw"
                      priority={i === initialIndex}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {media.length > 1 && (
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex >= media.length - 1}
              className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-opacity hover:bg-white/25 disabled:pointer-events-none disabled:opacity-25 sm:right-3 sm:h-12 sm:w-12"
              aria-label="Наступне фото"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {media.length > 1 && (
          <div className="flex shrink-0 justify-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? "w-7 bg-white" : "w-2 bg-white/35 hover:bg-white/55"
                }`}
                aria-label={`Фото ${i + 1}`}
                aria-current={i === activeIndex ? "true" : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
