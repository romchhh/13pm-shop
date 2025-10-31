"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";

export default function YouMightLike() {
  const { products: allProducts, loading } = useProducts();

  // Shuffle and pick 4 random products
  const products = useMemo(() => {
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }, [allProducts]);

  if (loading) return null; // or a spinner

  return (
    <section className="max-w-[1920px] w-full mx-auto px-4 md:px-0">
      <div className="flex flex-col gap-10">
        {/* Title */}
        <div
          className={`mx-0 md:mx-10 text-4xl md:text-7xl font-normal font-['Inter'] leading-tight md:leading-[84.91px] text-center md:text-left`}
        >
          Вам може сподобатися
        </div>

        {/* Products list - Mobile Optimized */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap justify-center sm:justify-around gap-4 sm:gap-8">
          {products.map((product) => {
            const isVideo = product.first_media?.type === "video";
            
            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="w-full sm:w-96 relative mx-auto"
              >
                {isVideo && product.first_media ? (
                  <video
                    src={`/api/images/${product.first_media.url}`}
                    className="w-full h-auto sm:h-[613px] object-cover"
                    loop
                    muted
                    playsInline
                    autoPlay
                    preload="metadata"
                  />
                ) : product.first_media ? (
                  <Image
                    src={getProductImageSrc(
                      product.first_media,
                      "https://placehold.co/432x613"
                    )}
                    alt={product.name}
                    width={400}
                    height={600}
                    className="w-full h-auto sm:h-[613px] object-cover"
                    sizes="(max-width: 420px) 45vw, (max-width: 640px) 45vw, (max-width: 1024px) 33vw, 400px"
                    quality={85}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    Немає зображення
                  </div>
                )}
                <div className="mt-2 text-sm sm:text-lg lg:text-xl font-normal font-['Inter'] capitalize leading-normal text-center">
                  {product.name}
                </div>
                <div className="mt-1 w-24 h-4 mx-auto text-lg sm:text-xl font-normal font-['Inter'] leading-none text-center">
                  {product.price} ₴
                </div>
              </Link>
            );
          })}
        </div>

        {/* More products button container */}
<div className="w-full max-w-full sm:max-w-[1824px] h-[300px] sm:h-[679px] bg-[url('/images/bg-def.png')] bg-cover bg-center relative overflow-hidden mx-auto">
          <Link
            href="/catalog"
            className="absolute bg-white inline-flex justify-center items-center gap-2 px-4 py-2 left-1/2 transform -translate-x-1/2 bottom-30 w-max sm:w-80 h-auto sm:h-16"
          >
            <div className="text-center justify-center text-black text-base sm:text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight">
              більше товарів
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
