import {
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

      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
        <StepList steps={HOW_WE_WORK_STEPS_TOP} startIndex={1} />
        <StepList steps={HOW_WE_WORK_STEPS_BOTTOM} startIndex={4} />
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
