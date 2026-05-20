"use client";

import { useState } from "react";
import { HOME_FAQ_ITEMS } from "@/lib/homeFaq";
import { homeSectionOuterClass } from "@/lib/homeSectionSpacing";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="scroll-mt-[var(--site-header-offset)] w-full bg-white"
      aria-labelledby="faq-heading"
    >
      <div className={`max-w-[1920px] mx-auto px-6 lg:px-10 ${homeSectionOuterClass}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10 xl:gap-14">
          {/* Заголовок — на мобільному зверху, на десктопі справа */}
          <div className="order-1 lg:order-2 lg:pt-2">
            <h2
              id="faq-heading"
              className="font-['Montserrat'] text-4xl font-bold tracking-tight text-black sm:text-5xl lg:text-6xl"
            >
              FAQ
            </h2>
            <p className="mt-4 max-w-md font-['Montserrat'] text-sm leading-relaxed text-black/60 lg:text-base">
              Відповіді на популярні запитання про продукцію та замовлення
            </p>
          </div>

          {/* Список питань — на мобільному під заголовком, на десктопі зліва */}
          <div className="order-2 lg:order-1">
            <ul className="divide-y divide-black/10">
              {HOME_FAQ_ITEMS.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <li key={item.number}>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left lg:py-6"
                      aria-expanded={isOpen}
                    >
                      <span className="font-['Montserrat'] text-base font-medium text-black lg:text-lg">
                        <span className="text-black/50">{item.number}</span>{" "}
                        {item.question}
                      </span>
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/20 text-lg leading-none text-black/70 transition-transform duration-200"
                        aria-hidden
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        isOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <p className="pb-5 font-['Montserrat'] text-sm leading-relaxed text-black/75 lg:pb-6 lg:text-base">
                        {item.answer}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
