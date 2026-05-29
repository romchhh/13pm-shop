import type { ReactNode } from "react";
import Link from "next/link";

export function HomePillArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HomePillLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** CTA-пілюля головної (як «Всі товари» / «Весь каталог»). */
export default function HomePillLink({ href, children, className = "" }: HomePillLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex min-h-[48px] w-full max-w-sm items-center justify-between gap-3 rounded-full bg-[#1C1C1C] py-2 pl-7 pr-2 font-['Montserrat'] text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#2a2a2a] sm:max-w-md lg:min-w-[300px] lg:w-auto lg:pl-8 ${className}`}
    >
      <span className="flex-1 text-center">{children}</span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1C1C1C] transition-colors group-hover:bg-[var(--site-accent)] group-hover:text-white">
        <HomePillArrow />
      </span>
    </Link>
  );
}
