import Link from "next/link";
import HowWeWork from "@/components/main-page/HowWeWork";
import { siteFooterLead } from "@/lib/siteBrand";
import { homeSectionOuterClass } from "@/lib/homeSectionSpacing";

const ABOUT_BULLETS = [
  "розроблено для дії, створено для тебе",
  "власне виробництво",
  "доставка по всьому світу",
  "-10% для силових структур",
] as const;

type AboutUsSectionProps = {
  showBackLink?: boolean;
};

export default function AboutUsSection({ showBackLink = false }: AboutUsSectionProps) {
  return (
    <section
      id="about"
      className="scroll-mt-[var(--site-header-offset)] w-full bg-white"
      aria-labelledby="about-heading"
    >
      <div className={`mx-auto max-w-[1920px] px-6 lg:px-10 ${homeSectionOuterClass}`}>
        {showBackLink && (
          <Link
            href="/#about"
            className="mb-6 inline-block font-['Montserrat'] text-sm font-semibold text-black/50 transition-colors hover:text-black"
          >
            ← На головну
          </Link>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start lg:gap-12 xl:gap-16">
          <div>
  
            <h2
              id="about-heading"
              className="mt-1 font-['Montserrat'] text-2xl font-semibold tracking-tight text-black lg:text-3xl"
            >
              Про нас
            </h2>
            <p className="mt-4 max-w-xl font-['Montserrat'] text-base leading-relaxed text-black/75 lg:text-lg lg:leading-relaxed">
              {siteFooterLead}
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
            {ABOUT_BULLETS.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-black/[0.06] bg-[#faf9f7] px-4 py-4 font-['Montserrat'] text-sm font-medium leading-snug text-black/85 shadow-[0_4px_20px_rgba(0,0,0,0.04)] lg:text-[15px]"
              >
                <span className="mr-2 text-[var(--site-accent)]" aria-hidden>
                  ▪
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-black/[0.06]">
        <HowWeWork embedded />
      </div>
    </section>
  );
}
