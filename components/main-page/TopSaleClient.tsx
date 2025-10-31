"use client";

import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";

// Video component with proper mobile autoplay
function VideoWithAutoplay({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          // Retry after delay for mobile
          setTimeout(async () => {
            try {
              await video.play();
            } catch (e) {
              console.log("Video autoplay failed:", e);
            }
          }, 200);
        }
      };
      
      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener('loadeddata', playVideo, { once: true });
        video.addEventListener('canplay', playVideo, { once: true });
        video.load();
      }
    }
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      loop
      muted
      playsInline
      autoPlay
      preload="metadata"
    />
  );
}

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
}

interface TopSaleClientProps {
  products: Product[];
}

export default function TopSaleClient({ products }: TopSaleClientProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-10">Наразі немає топових товарів.</div>
    );
  }

  const limitedProducts = products.slice(0, 4);

  return (
    <section className="max-w-[1920px] mx-auto w-full mb-35 relative overflow-hidden flex flex-col gap-10">
      <div className="border-b-2 pb-10 flex flex-col lg:flex-row justify-between mt-20 mx-10 lg:items-center">
        <div className="lg:text-center justify-center text-2xl lg:text-5xl font-normal font-['Inter'] uppercase">
          Топ продажів | CHARS
        </div>
        <div className="text-left opacity-70 text-base lg:text-xl font-normal font-['Inter'] capitalize leading-normal">
          Улюблені образи наших клієнтів.
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 px-6">
        {limitedProducts.map((product, index) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="flex flex-col gap-3 group w-full"
          >
            <div className="aspect-[2/3] w-full overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer pointer-events-none" />
              {product.first_media?.type === "video" ? (
                <VideoWithAutoplay
                  src={`/api/images/${product.first_media.url}`}
                  className="object-cover group-hover:brightness-90 transition duration-300 w-full h-full"
                />
              ) : (
                <Image
                  className="object-cover group-hover:brightness-90 transition duration-300"
                  src={getProductImageSrc(
                    product.first_media,
                    "https://placehold.co/432x613"
                  )}
                  alt={product.name}
                  fill
                  sizes="(max-width: 420px) 90vw, (max-width: 640px) 45vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  priority={index < 6}
                  quality={85}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              )}
            </div>

            <div className="text-center text-base sm:text-lg md:text-xl font-normal font-['Inter'] capitalize leading-normal">
              {product.name} <br />
              {product.price.toLocaleString()} ₴
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile swiper carousel */}
      <div className="sm:hidden">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1.5}
          centeredSlides
          grabCursor
        >
          {limitedProducts.map((product, index) => (
            <SwiperSlide key={product.id}>
              <Link
                href={`/product/${product.id}`}
                className="relative flex flex-col gap-3 group"
              >
                <div className="relative w-full h-[350px]">
                  {product.first_media?.type === "video" ? (
                    <VideoWithAutoplay
                      src={`/api/images/${product.first_media.url}`}
                      className="object-cover group-hover:brightness-90 transition duration-300 w-full h-full"
                    />
                  ) : (
                    <Image
                      className="object-cover group-hover:brightness-90 transition duration-300"
                      src={getProductImageSrc(
                        product.first_media,
                        "https://placehold.co/432x613"
                      )}
                      alt={product.name}
                      fill
                      sizes="85vw"
                      priority={index < 3}
                      quality={85}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  )}
                </div>
                <div className="justify-center text-lg font-normal font-['Inter'] capitalize leading-normal text-center">
                  {product.name} <br />
                  {product.price.toLocaleString()} ₴
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
