"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";
import Image from "next/image";

import "swiper/css";
import "swiper/css/navigation";
import { useAppContext } from "@/lib/GeneralProvider";

export default function Reviews() {
  const { isDark } = useAppContext();

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <section
      id="reviews"
      className={`scroll-mt-5 max-w-[1920px] w-full mx-auto relative ${
        isDark ? "bg-stone-900" : "bg-[#e3dfd7]"
      } px-6 py-12 md:py-20`}
    >
      {/* Top section */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8">
        <div className="text-4xl lg:text-7xl font-medium font-['Montserrat'] lg:leading-[74.69px]">
          Враження
          <br />
          наших клієнтів
        </div>

        <div className="text-base lg:text-2xl font-normal font-['Arial'] leading-relaxed">
          Більше відгуків дивіться у<br />
          нашому{" "}
          <Link
            href="https://www.instagram.com/chars_ua_brand/"
            className="underline italic hover:text-blue-600 transition-colors"
          >
            Instagram
          </Link>{" "}
          профілі
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          <button
            ref={prevRef}
            className="text-4xl lg:text-5xl font-bold cursor-pointer"
          >
            <Image
              src={
                isDark
                  ? "/images/dark-theme/slider-button-left.svg"
                  : "/images/light-theme/slider-button-left.svg"
              }
              alt="Previous"
              width={48}
              height={48}
            />
          </button>
          <button
            ref={prevRef}
            className="text-4xl lg:text-5xl font-bold cursor-pointer"
          >
            <Image
              src={
                isDark
                  ? "/images/dark-theme/slider-button-right.svg"
                  : "/images/light-theme/slider-button-right.svg"
              }
              alt="Next"
              width={48}
              height={48}
            />
          </button>
        </div>
      </div>

      {/* Swiper Carousel */}
      <div className="mt-12 w-full">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1.2}
          loop={true}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onInit={(swiper) => {
            if (
              typeof swiper.params.navigation !== "boolean" &&
              swiper.params.navigation
            ) {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          breakpoints={{
            0: {
              slidesPerView: 1.2,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 1.5,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 2.5,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3.5,
              spaceBetween: 24,
            },
            1440: {
              slidesPerView: 4.5,
              spaceBetween: 32,
            },
            1920: {
              slidesPerView: 5,
              spaceBetween: 32,
            },
          }}
        >
          {[
            {
              title: "Відгук 1",
              text: "Сервіс на найвищому рівні. Рекомендую всім!",
            },
            {
              title: "Відгук 2",
              text: "Дуже задоволена досвідом! Обов’язково повернусь.",
            },
            {
              title: "Відгук 3",
              text: "Прекрасна атмосфера та професійний підхід.",
            },
            {
              title: "Відгук 4",
              text: "Все було чудово! Персонал дуже уважний.",
            },
            {
              title: "Відгук 5",
              text: "Комфортно і затишно. Буду радити друзям!",
            },
            { title: "Відгук 6", text: "Це місце — справжня знахідка!" },
          ].map((review, i) => (
            <SwiperSlide key={i}>
              <div className="aspect-[3/4] bg-neutral-500 p-6 text-white flex flex-col justify-center items-center rounded-xl">
                <h3 className="text-xl md:text-2xl font-bold mb-4">
                  {review.title}
                </h3>
                <p className="text-base md:text-lg text-center max-w-[90%]">
                  {review.text}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
