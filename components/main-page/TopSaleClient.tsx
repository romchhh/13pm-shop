"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";

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
    return <div className="text-center py-10">Наразі немає топових товарів.</div>;
  }

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
        {products.map((product, index) => (
          <Link
            href={`/product/${product.id}`}
            key={product.id}
            className="flex flex-col gap-3 group w-full"
          >
            <div className="aspect-[2/3] w-full overflow-hidden relative">
              <Image
                className="object-cover group-hover:brightness-90 transition duration-300"
                src={getProductImageSrc(product.first_media, "https://placehold.co/432x613")}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                priority={index < 4} // First 4 images get priority
                loading={index < 4 ? undefined : "lazy"}
              />
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
          {products.map((product, index) => (
            <SwiperSlide key={product.id}>
              <Link
                href={`/product/${product.id}`}
                className="relative flex flex-col gap-3 group"
              >
                <div className="relative w-full h-[350px]">
                  <Image
                    className="object-cover group-hover:brightness-90 transition duration-300"
                    src={getProductImageSrc(product.first_media, "https://placehold.co/432x613")}
                    alt={product.name}
                    fill
                    sizes="90vw"
                    priority={index < 2} // First 2 images on mobile get priority
                    loading={index < 2 ? undefined : "lazy"}
                  />
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

