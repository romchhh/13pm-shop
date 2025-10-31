"use client";

import React from "react";
import Link from "next/link";
import { useAppContext } from "@/lib/GeneralProvider";

export default function Reviews() {
  const { isDark } = useAppContext();

  return (
    <section
      id="reviews"
      className={`scroll-mt-5 max-w-[1920px] w-full mx-auto relative ${
        isDark ? "bg-stone-900" : "bg-[#e3dfd7]"
      } px-6 py-12 md:py-20`}
    >
      {/* Content section */}
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
      </div>
    </section>
  );
}
