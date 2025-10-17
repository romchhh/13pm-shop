"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import Link from "next/link";
import Image from "next/image";

export default function SocialMedia() {
  const { isDark } = useAppContext();

  return (
    // h-[977px]
    <section
      id="contacts"
      className="scroll-mt-30 max-w-[1920px] mx-auto w-full relative overflow-hidden lg:my-36"
    >
      <div className="flex flex-col-reverse lg:flex-row justify-center">
        <div className="flex justify-center gap-4 sm:gap-7 overflow-x-auto">
          <Image
            className="w-44 h-auto sm:w-80 sm:h-auto rounded-[24px] sm:rounded-[46.43px] max-w-full max-h-[calc(100vh-20px)]"
            src="/images/social-media-0.png"
            alt="image-1"
            width={320}
            height={480}
          />
          <Image
            className="w-44 h-auto sm:w-80 sm:h-auto rounded-[24px] sm:rounded-[53.20px] max-w-full max-h-[calc(100vh-20px)]"
            src="/images/social-media-1.png"
            alt="image-2"
            width={320}
            height={480}
          />
        </div>

        <div className="flex flex-col gap-10 m-8 lg:ml-25 lg:m-18">
          <div className="flex flex-col">
            <span className="text-stone-500 text-5xl lg:text-8xl font-normal font-['Inter']">
              Ми ближче,{" "}
            </span>
            <span className="text-5xl lg:text-8xl font-normal font-['Inter']">
              ніж здається!
            </span>
          </div>

          <div className="border-b lg:border-0 lg:w-[465px] justify-center text-lg lg:text-3xl font-normal font-['Inter'] capitalize leading-9">
            Лімітована колекція — для тих кому важлива унікальність.
          </div>

          <div className="flex justify-start gap-10 lg:justify-between items-center w-full lg:w-115">
            <Link
              href="https://www.tiktok.com/"
              className={`w-60 h-12 md:w-80 md:h-16 text-center flex items-center ${
                isDark ? "bg-stone-100 text-black" : "bg-stone-900 text-white"
              } justify-center text-base md:text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight`}
            >
              МИ В TIKTOK
            </Link>
            <Image
              width={39}
              height={39}
              className="w-11 h-11 md:w-13 md:h-13"
              src={`/images/${
                isDark ? "dark-theme/tiktok.svg" : "light-theme/tiktok.svg"
              }`}
              alt={"tiktok icon"}
            />
          </div>

          <div className="flex justify-start gap-10 lg:justify-between items-center w-full lg:w-115 mt-4 md:mt-0">
            <Link
              href="https://www.instagram.com/chars_ua_brand/"
              className={`w-60 h-12 md:w-80 md:h-16 text-center flex items-center ${
                isDark ? "bg-stone-100 text-black" : "bg-stone-900 text-white"
              } justify-center text-base md:text-2xl font-normal font-['Inter'] uppercase leading-none tracking-tight`}
            >
              МИ В ІНСТАГРАМ
            </Link>
            <Image
              width={39}
              height={39}
              className="w-8 h-8 md:w-10 md:h-10"
              src={`/images/${
                isDark
                  ? "dark-theme/instagram.svg"
                  : "light-theme/instagram.svg"
              }`}
              alt={"instagram icon"}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
