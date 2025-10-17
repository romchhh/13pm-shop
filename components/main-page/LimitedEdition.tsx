"use client";

import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";

// Define a fallback (template) product
const templateProduct = {
  id: -1,
  name: "Шовкова сорочка без рукавів",
  price: 1780,
  first_media: { type: "photo", url: "template-placeholder" },
  limited_edition: false,
};

export default function LimitedEdition() {
  const { products: limitedEditionProducts, loading } = useProducts({ limitedEdition: true });

  // Fill with template products if there are not enough
  const products = useMemo(() => {
    // If there are not enough products, fill with template products
    if (limitedEditionProducts.length < 8) {
      return [
        ...limitedEditionProducts,
        ...Array(8 - limitedEditionProducts.length).fill(templateProduct),
      ];
    }
    return limitedEditionProducts;
  }, [limitedEditionProducts]);

  if (loading) {
    return <div className="text-center py-10">Завантаження...</div>;
  }

  return (
    <section className="max-w-[1920px] w-full mx-auto h-[3067px] relative overflow-hidden m-10">
      <div className="flex flex-col m-10 gap-10">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row justify-between border-b-2 py-10">
          <div className="text-left justify-center text-5xl font-normal font-['Inter'] uppercase">
            Лімітована колекція від CHARS
          </div>
          <div className="justify-center opacity-70 text-xl font-normal font-['Inter'] capitalize leading-normal">
            Лімітована колекція — для тих кому важлива унікальність.
          </div>
        </div>

        {/* Mobile layout: Two stacked sliders */}
        <div className="sm:hidden">
          {/* First Slider */}
          <Swiper
            spaceBetween={12}
            slidesPerView={1.5}
            centeredSlides={true}
            grabCursor={true}
            initialSlide={0}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 8 },
              480: { slidesPerView: 1.5, spaceBetween: 12 },
            }}
          >
            {products.map((product, i) => (
              <SwiperSlide
                key={product.id !== -1 ? product.id : `template-${i}`}
              >
                <Link
                  href={`/product/${product.id}`}
                  className="w-full group space-y-5"
                >
                  <div className="relative w-full h-[500px]">
                    <Image
                      className="object-cover group-hover:brightness-90 transition duration-300"
                      src={getProductImageSrc(product.first_media, "https://placehold.co/432x682")}
                      alt={product.name}
                      fill
                      sizes="90vw"
                    />
                  </div>
                  <div>
                    <div className="text-xl font-normal font-['Inter'] capitalize leading-normal text-center">
                      {product.name}
                    </div>
                    <div className="text-xl font-normal font-['Inter'] leading-none text-center">
                      {product.price.toLocaleString()} ₴
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Second Slider */}
          <Swiper
            spaceBetween={12}
            slidesPerView={1.5}
            centeredSlides={true}
            grabCursor={true}
            initialSlide={0}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 8 },
              480: { slidesPerView: 1.5, spaceBetween: 12 },
            }}
          >
            {products.map((product, i) => (
              <SwiperSlide
                key={product.id !== -1 ? product.id : `template-${i}`}
              >
                <Link
                  href={`/product/${product.id}`}
                  className="w-full group space-y-5"
                >
                  <div className="relative w-full h-[500px]">
                    <Image
                      className="object-cover group-hover:brightness-90 transition duration-300"
                      src={getProductImageSrc(product.first_media, "https://placehold.co/432x682")}
                      alt={product.name}
                      fill
                      sizes="90vw"
                    />
                  </div>
                  <div>
                    <div className="text-xl font-normal font-['Inter'] capitalize leading-normal text-center">
                      {product.name}
                    </div>
                    <div className="text-xl font-normal font-['Inter'] leading-none text-center">
                      {product.price.toLocaleString()} ₴
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop layout: 4x2 Grid */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
          {products.map((product, i) => (
            <Link
              href={`/product/${product.id}`}
              key={product.id !== -1 ? product.id : `template-${i}`}
              className="group space-y-4 sm:space-y-5 w-full"
            >
              <div className="aspect-[2/3] w-full overflow-hidden relative">
                <Image
                  className="object-cover group-hover:brightness-90 transition duration-300"
                  src={getProductImageSrc(product.first_media, "https://placehold.co/432x682")}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>

              <div>
                <div className="text-center text-base sm:text-lg md:text-xl font-normal font-['Inter'] capitalize leading-normal">
                  {product.name}
                </div>
                <div className="text-center text-base sm:text-lg font-normal font-['Inter'] leading-none">
                  {product.price.toLocaleString()} ₴
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to action for more products */}
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="relative w-full sm:w-[600px] md:w-[700px] lg:w-[894px] h-[600px] sm:h-[800px] md:h-[1000px] lg:h-[1279px]">
            <Image
              src="https://placehold.co/894x1279"
              className="object-cover"
              alt="Product Background"
              fill
            />
            <div className="absolute bottom-1/12 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-3 bg-white flex justify-center items-center">
                <Link
                  href="/catalog"
                  className="whitespace-nowrap text-black text-base sm:text-lg md:text-xl lg:text-2xl font-normal font-['Inter'] uppercase tracking-tight"
                >
                  більше товарів
                </Link>
              </div>
            </div>
          </div>

          <div className="relative w-full sm:w-[600px] md:w-[700px] lg:w-[894px] h-[600px] sm:h-[800px] md:h-[1000px] lg:h-[1279px]">
            <Image
              src="https://placehold.co/894x1279"
              className="object-cover"
              alt="Product Background"
              fill
            />
            <div className="absolute bottom-1/12 left-1/2 transform -translate-x-1/2">
              <div className="px-6 py-3 bg-white flex justify-center items-center">
                <Link
                  href="/catalog"
                  className="whitespace-nowrap text-black text-base sm:text-lg md:text-xl lg:text-2xl font-normal font-['Inter'] uppercase tracking-tight"
                >
                  більше товарів
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
