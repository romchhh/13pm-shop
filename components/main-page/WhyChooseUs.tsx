"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import Image from "next/image";

export default function WhyChooseUs() {
  const { isDark } = useAppContext();

  const info = [
    {
      pic: "/images/why-choose-us-0.png",
      top_text: "Власне виробництво",
      bottom_text:
        "Ми контролюємо кожен етап — від викрійки до останнього стібка.",
    },
    {
      pic: "/images/why-choose-us-1.png",
      top_text: "Пошиття під індивідуальні параметри",
      bottom_text:
        "Ми не створюємо “середньостатистичний” одяг — ми створюємо твій.",
    },
    {
      pic: "/images/why-choose-us-2.png",
      top_text: "Створення образу за 24 години",
      bottom_text:
        "У нас немає “довгого очікування” — є уважність до твого часу.",
    },
    {
      pic: "/images/why-choose-us-3.png",
      top_text: "Якість котру відчуваєш",
      bottom_text:
        "Кожен виріб проходить через руки майстра, а не лише машину.",
    },
    {
      pic: "/images/why-choose-us-4.png",
      top_text: "Локальний український бренд",
      bottom_text:
        "Ми підтримуємо локальне виробництво, чесну працю та створюємо речі, які говорять тихо, але точно.",
    },
  ];

  return (
    <section
      // h-[2659px]
      className={`max-w-[1920px] mx-auto w-full relative ${
        isDark ? "" : "bg-[#e3dfd7]"
      } overflow-hidden`}
    >
      <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center m-10">
        <div className="text-start lg:text-center justify-center text-3xl lg:text-5xl font-normal font-['Inter'] uppercase">
          Чому обирають нас
        </div>
        <div className=" justify-center opacity-70 lg:text-xl font-normal font-['Inter'] capitalize leading-normal">
          Chars — коли естетика не потребує зайвих слів.
        </div>
      </div>

      <div className="flex flex-col p-10">
        {info.map((item, i) => (
          <div key={i} className="border-y">
            <div className="flex justify-between gap-5 m-5 lg:m-15">
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-15 items-center">
                <Image
                  className="w-full md:w-[589px] md:h-80 object-cover"
                  src={item.pic}
                  alt={`image-${i}`}
                  width={589}
                  height={320}
                />
                <div className="w-full justify-center text-3xl lg:text-5xl font-normal font-['Inter'] lowercase">
                  {item.top_text} <br />
                  <span className="justify-center text-lg lg:text-xl font-normal font-['Inter'] capitalize">
                    {item.bottom_text}
                  </span>
                </div>
              </div>

              <div className="text-center justify-center text-2xl lg:text-4xl font-normal font-['Inter'] lowercase">
                {`0${i + 1}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
