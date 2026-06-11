import { HOW_WE_WORK_STEPS } from "@/lib/howWeWorkSteps";
import { homeSectionOuterClass } from "@/lib/homeSectionSpacing";

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

      <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5 xl:gap-6">
        {HOW_WE_WORK_STEPS.map((step, index) => (
          <li key={step.title} className="min-w-0">
            <h3 className="font-['Montserrat'] text-[1.35rem] font-semibold leading-snug text-black sm:text-[1.5rem] lg:text-[1rem] lg:leading-tight xl:text-[1.15rem]">
              {index + 1}. {step.title}
            </h3>
            <p className="mt-3 font-['Montserrat'] text-[1.05rem] leading-relaxed text-black/80 sm:text-[1.15rem] lg:mt-2.5 lg:text-[0.8125rem] lg:leading-snug xl:mt-3 xl:text-sm xl:leading-relaxed">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
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
