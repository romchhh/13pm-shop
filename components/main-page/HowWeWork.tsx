import {
  HOW_WE_WORK_IMAGE_BOTTOM,
  HOW_WE_WORK_IMAGE_TOP,
  HOW_WE_WORK_STEPS_TOP,
  HOW_WE_WORK_STEPS_BOTTOM,
  type HowWeWorkStep,
} from "@/lib/howWeWorkSteps";
import { homeSectionOuterClass } from "@/lib/homeSectionSpacing";

function StepList({
  steps,
  startIndex,
}: {
  steps: readonly HowWeWorkStep[];
  startIndex: number;
}) {
  return (
    <ol className="flex flex-col gap-10 lg:gap-12">
      {steps.map((step, i) => (
        <li key={step.title}>
          <h3 className="font-['Montserrat'] text-[1.5rem] font-semibold leading-snug text-black lg:text-[1.8rem]">
            {startIndex + i}. {step.title}
          </h3>
          <p className="mt-3 font-['Montserrat'] text-[1.2rem] leading-relaxed text-black/80 lg:text-[1.35rem]">
            {step.text}
          </p>
        </li>
      ))}
    </ol>
  );
}

function GalleryImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="w-full">
      {/* img = нативне співвідношення сторін колажу без crop */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="block h-auto w-full"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}

type HowWeWorkProps = {
  /** Вбудовано в секцію «Про нас» на головній (без окремого <section>) */
  embedded?: boolean;
};

export default function HowWeWork({ embedded = false }: HowWeWorkProps) {
  const inner = (
    <>
      <h2
        id="how-we-work-heading"
        className="mb-6 font-['Montserrat'] text-2xl font-bold tracking-tight text-black lg:mb-8 lg:text-3xl"
      >
        Як ми працюємо?
      </h2>

      {/* Кроки 1–3: фото зліва, текст справа */}
      <div className="mb-8 grid grid-cols-1 items-start gap-8 lg:mb-10 lg:grid-cols-2 lg:gap-10 xl:gap-12">
        <GalleryImage
          src={HOW_WE_WORK_IMAGE_TOP}
          alt="13pm tactic — як ми працюємо: від вибору моделі до доставки"
          priority={embedded}
        />
        <div className="lg:py-4">
          <StepList steps={HOW_WE_WORK_STEPS_TOP} startIndex={1} />
        </div>
      </div>

      {/* Кроки 4–5: текст зліва, фото справа */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
        <div className="order-2 lg:order-1 lg:py-4">
          <StepList steps={HOW_WE_WORK_STEPS_BOTTOM} startIndex={4} />
        </div>
        <div className="order-1 lg:order-2">
          <GalleryImage
            src={HOW_WE_WORK_IMAGE_BOTTOM}
            alt="13pm tactic — доставка та підтримка після покупки"
          />
        </div>
      </div>
    </>
  );

  const containerClass = `mx-auto max-w-[1920px] px-6 lg:px-10 ${homeSectionOuterClass}`;

  if (embedded) {
    return (
      <div className={containerClass} aria-labelledby="how-we-work-heading">
        {inner}
      </div>
    );
  }

  return (
    <section className="w-full bg-white" aria-labelledby="how-we-work-heading">
      <div className={containerClass}>{inner}</div>
    </section>
  );
}
