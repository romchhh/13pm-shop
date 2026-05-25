"use client";

import Image from "next/image";

import { SITE_ACCENT, SITE_ACCENT_DARK } from "@/lib/siteColors";

type AddToCartButtonProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  /** sm — картки каталогу / карусель; md — сторінка товару */
  size?: "sm" | "md";
  className?: string;
  label?: string;
};

export default function AddToCartButton({
  onClick,
  disabled = false,
  loading = false,
  size = "sm",
  className = "",
  label = "В кошик",
}: AddToCartButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-['Montserrat'] font-semibold text-white transition-opacity ${
        size === "sm" ? "h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm" : "h-12 flex-1 px-5 text-sm sm:text-base"
      } ${isDisabled ? "cursor-not-allowed opacity-45" : "hover:opacity-90 active:opacity-95"} ${className}`}
      style={{ background: `linear-gradient(135deg, ${SITE_ACCENT} 0%, ${SITE_ACCENT_DARK} 100%)` }}
      aria-label={isDisabled ? "Немає в наявності" : label}
    >
      <Image
        src="/images/icons/cart.svg"
        alt=""
        width={20}
        height={18}
        className={`brightness-0 invert ${size === "sm" ? "h-4 w-auto sm:h-[18px]" : "h-5 w-auto"}`}
      />
      <span>{loading ? "…" : label}</span>
    </button>
  );
}
