"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function Footer() {
  const { isDark } = useAppContext();

  return (
    <footer className="max-w-[1858px] mx-auto lg:mt-10 m-6 h-auto relative overflow-hidden flex flex-col justify-between">
      <div
        className={`${montserrat.className} w-full text-center my-10 border-b overflow-hidden whitespace-nowrap`}
      >
        <h1
          className="leading-none tracking-widest text-[13vw]"
          style={{ wordBreak: "keep-all" }}
        >
          CHARS KYIV
        </h1>
      </div>

      {/* On larger screens (PC view) */}
      <div className="hidden lg:flex justify-between">
        <div className="flex flex-col gap-6">
          <div className="flex justify-start gap-6">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                isDark ? "border-white" : "border-black"
              }`}
            >
              <Image
                src="/images/location-icon.svg"
                alt="Location"
                width={40}
                height={40}
                className={`w-8 h-8 md:w-10 md:h-10 ${isDark ? "invert" : ""}`}
              />
            </div>
            <Link
              href="https://maps.google.com/?q=Київ, вул. Костянтинівська, 21"
              target="_blank"
              className="w-48 h-8 md:w-56 md:h-11 text-sm md:text-xl flex justify-start my-3 hover:underline"
            >
              Адреса шоуруму:
              <br />
              Київ, вул. Костянтинівська, 21
            </Link>
          </div>

          <div className="flex justify-start gap-6">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                isDark ? "border-white" : "border-black"
              }`}
            >
              <Image
                src="/images/email-icon.svg"
                alt="Email"
                width={40}
                height={40}
                className={`w-8 h-8 md:w-10 md:h-10 ${isDark ? "invert" : ""}`}
              />
            </div>
            <Link
              href="mailto:Charsukrainianbrand@gmail.com"
              className="w-48 h-5 items-center md:w-56 md:h-5 text-sm md:text-xl flex justify-start my-auto hover:underline"
            >
              Charsukrainianbrand <br /> @gmail.com
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex justify-start gap-6">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                isDark ? "border-white" : "border-black"
              }`}
            >
              <Image
                src="/images/instagram-icon.svg"
                alt="Instagram"
                width={40}
                height={40}
                className={`w-8 h-8 md:w-10 md:h-10 ${isDark ? "invert" : ""}`}
              />
            </div>
            <Link
              href="https://www.instagram.com/chars_ua_brand/"
              target="_blank"
              className="w-28 h-8 md:w-32 md:h-11 text-sm md:text-xl flex justify-start my-auto hover:underline"
            >
              Instagram
            </Link>
          </div>

          <div className="flex justify-start gap-6">
            <div
              className={`w-20 h-20 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                isDark ? "border-white" : "border-black"
              }`}
            >
              <Image
                src="/images/facebook-icon.svg"
                alt="Facebook"
                width={40}
                height={40}
                className={`w-8 h-8 md:w-10 md:h-10 ${isDark ? "invert" : ""}`}
              />
            </div>
            <Link
              href="https://www.facebook.com/profile.php?id=61554965091065"
              target="_blank"
              className="w-28 h-5 md:w-32 md:h-5 text-sm md:text-xl flex justify-start my-auto hover:underline"
            >
              Facebook
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-12 md:gap-22">
          <div className="flex justify-start gap-6">
            <div className="w-48 h-8 md:w-56 md:h-11 flex flex-col justify-start my-auto">
              <span className="text-lg md:text-2xl">Графік роботи:</span>
              <span className="text-sm md:text-lg">Пн-Пт 13:00-19:00</span>
            </div>
          </div>

          <div className="flex justify-start gap-6">
            <div className="w-48 h-8 md:w-56 md:h-11 flex flex-col justify-start my-auto">
              <span className="text-lg md:text-2xl">Телефон</span>
              <span className="text-sm md:text-lg">+380 5086 730 48</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-lg md:text-2xl">Навігація</span>
          <Link
            href="/#about"
            className="text-sm md:text-lg hover:text-[#8C7461]"
          >
            Про нас
          </Link>
          <Link
            href="/#payment-and-delivery"
            className="text-sm md:text-lg hover:text-[#8C7461]"
          >
            Оплата і доставка
          </Link>
          <Link
            href="/#reviews"
            className="text-sm md:text-lg hover:text-[#8C7461]"
          >
            Відгуки
          </Link>
          <Link
            href="/#contacts"
            className="text-sm md:text-lg hover:text-[#8C7461]"
          >
            Контакти
          </Link>
        </div>

        <Link
          href="/"
          className={`w-48 h-48 md:w-60 md:h-60 rounded-full flex justify-center ${
            isDark ? "bg-stone-100" : "bg-stone-900"
          }`}
        >
          <span
            className={`my-auto text-xl md:text-2xl ${
              isDark ? "text-stone-900" : "text-stone-100"
            }`}
          >
            На головну
          </span>
        </Link>
      </div>

      {/* On smaller screens (Mobile view) */}
      <div className="lg:hidden flex flex-col gap-10 m-3">
        <div className="flex justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-5">
            <div className="flex justify-start gap-4 md:gap-6">
              <div className="w-40 h-8 md:w-56 md:h-11 flex flex-col justify-start my-auto">
                <span className="text-lg md:text-2xl">Графік роботи:</span>
                <span className="text-sm md:text-lg">Пн-Пт 13:00-19:00</span>
              </div>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div className="w-40 h-8 md:w-56 md:h-11 flex flex-col justify-start my-auto">
                <span className="text-lg md:text-2xl">Телефон</span>
                <span className="text-sm md:text-lg">+380 5086 730 48</span>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className={`w-40 h-40 md:w-60 md:h-60 rounded-full flex justify-center ${
              isDark ? "bg-stone-100" : "bg-stone-900"
            }`}
          >
            <span
              className={`my-auto text-xl md:text-2xl ${
                isDark ? "text-stone-900" : "text-stone-100"
              }`}
            >
              На головну
            </span>
          </Link>
        </div>

        <div>
          <span className="text-lg md:text-2xl">Навігація</span>
          <div className="flex justify-around gap-4 md:gap-6">
            <Link
              href="/#about"
              className="text-sm md:text-lg hover:text-[#8C7461]"
            >
              Про нас
            </Link>
            <Link
              href="/#payment-and-delivery"
              className="text-sm md:text-lg hover:text-[#8C7461]"
            >
              Оплата і доставка
            </Link>
            <Link
              href="/#reviews"
              className="text-sm md:text-lg hover:text-[#8C7461]"
            >
              Відгуки
            </Link>
            <Link
              href="/#contacts"
              className="text-sm md:text-lg hover:text-[#8C7461]"
            >
              Контакти
            </Link>
          </div>
        </div>

        <div className="flex justify-between gap-4 md:gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-start gap-4">
              <div
                className={`w-15 h-15 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white" : "border-black"
                }`}
              >
                <Image
                  src="/images/location-icon.svg"
                  alt="Location"
                  width={16}
                  height={16}
                  className={`w-3 h-3 md:w-4 md:h-4 ${isDark ? "invert" : ""}`}
                />
              </div>
              <Link
                href="https://maps.google.com/?q=Київ, вул. Костянтинівська, 21"
                target="_blank"
                className="w-48 h-8 md:w-56 md:h-11 text-sm md:text-xl flex justify-start my-3 hover:underline"
              >
                Адреса шоуруму:
                <br />
                Київ, вул. Костянтинівська, 21
              </Link>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div
                className={`w-15 h-15 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white" : "border-black"
                }`}
              >
                <Image
                  src="/images/email-icon.svg"
                  alt="Email"
                  width={16}
                  height={16}
                  className={`w-3 h-3 md:w-4 md:h-4 ${isDark ? "invert" : ""}`}
                />
              </div>
              <Link
                href="mailto:Charsukrainianbrand@gmail.com"
                className="w-48 h-5 md:w-56 md:h-5 text-sm md:text-xl flex justify-start my-auto hover:underline"
              >
                Charsukrainianbrand@gmail.com
              </Link>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div
                className={`w-15 h-15 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white" : "border-black"
                }`}
              >
                <Image
                  src="/images/instagram-icon.svg"
                  alt="Instagram"
                  width={16}
                  height={16}
                  className={`w-3 h-3 md:w-4 md:h-4 ${isDark ? "invert" : ""}`}
                />
              </div>
              <Link
                href="https://www.instagram.com/chars_ua_brand/"
                target="_blank"
                className="w-28 h-8 md:w-32 md:h-11 text-sm md:text-xl flex justify-start my-auto hover:underline"
              >
                Instagram
              </Link>
            </div>

            <div className="flex justify-start gap-4 md:gap-6">
              <div
                className={`w-15 h-15 md:w-26 md:h-26 rounded-full border flex items-center justify-center ${
                  isDark ? "border-white" : "border-black"
                }`}
              >
                <Image
                  src="/images/facebook-icon.svg"
                  alt="Facebook"
                  width={16}
                  height={16}
                  className={`w-3 h-3 md:w-4 md:h-4 ${isDark ? "invert" : ""}`}
                />
              </div>
              <Link
                href="https://www.facebook.com/profile.php?id=61554965091065"
                target="_blank"
                className="w-28 h-5 md:w-32 md:h-5 text-sm md:text-xl flex justify-start my-auto hover:underline"
              >
                Facebook
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mt-10 gap-4 md:gap-6">
        <span className="text-sm md:text-xl text-center sm:text-left">
          Chars Kyiv © 2025 All rights reserved
        </span>
        <div className="flex gap-2 md:gap-4 items-center">
          <Link
            href="/privacy-policy"
            className="text-sm md:text-xl hover:underline text-center"
          >
            Політика конфіденційності
          </Link>
          <span className="text-sm md:text-xl hidden sm:inline">|</span>
          <Link
            href="/terms-of-service"
            className="text-sm md:text-xl hover:underline text-center"
          >
            Договір оферти
          </Link>
        </div>
      </div>

      {/* Centered developer credit */}
      <div className="mt-6 mb-4 flex justify-center">
        <Link
          href="https://telebots.site/"
          target="_blank"
          className={`px-5 py-2 rounded-full border transition text-sm md:text-base tracking-wide ${
            isDark
              ? "border-white/40 text-white/90 hover:bg-white hover:text-black"
              : "border-black/40 text-black hover:bg-black hover:text-white"
          }`}
        >
          Telebots | Розробка сайтів
        </Link>
      </div>
    </footer>
  );
}
