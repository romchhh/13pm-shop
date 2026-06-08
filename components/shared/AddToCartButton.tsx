"use client";

import Image from "next/image";
import { OUT_OF_STOCK_LABEL } from "@/lib/productAvailability";

type AddToCartButtonProps = {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  /** Товар недоступний — кнопка лишається видимою з підписом «Немає в наявності». */
  outOfStock?: boolean;
  /** sm — картки; md — компактна PDP; lg — головна CTA на сторінці товару */
  size?: "sm" | "md" | "lg";
  /** accent — оливковий; dark — чорна CTA на PDP */
  variant?: "accent" | "dark";
  className?: string;
  label?: string;
};

const SIZE_CLASSES: Record<NonNullable<AddToCartButtonProps["size"]>, string> = {
  sm: "h-9 min-h-9 gap-1.5 px-3 text-xs lg:h-10 lg:px-4 lg:text-sm",
  md: "h-12 min-h-12 gap-2 flex-1 px-5 text-sm sm:text-base",
  lg: "h-14 min-h-14 gap-2.5 flex-1 px-6 text-base font-bold tracking-wide sm:h-[3.75rem] sm:text-lg",
};

const ICON_CLASSES: Record<NonNullable<AddToCartButtonProps["size"]>, string> = {
  sm: "h-4 w-auto sm:h-[18px]",
  md: "h-5 w-auto",
  lg: "h-5 w-auto sm:h-6",
};

export default function AddToCartButton({
  onClick,
  disabled = false,
  loading = false,
  outOfStock = false,
  size = "sm",
  variant = "accent",
  className = "",
  label = "В кошик",
}: AddToCartButtonProps) {
  const unavailable = outOfStock || disabled;
  const isDisabled = unavailable || loading;
  const isDark = variant === "dark";
  const displayLabel = outOfStock
    ? OUT_OF_STOCK_LABEL
    : loading
      ? "…"
      : label;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center justify-center rounded-full font-['Montserrat'] font-semibold transition-[transform,box-shadow,background-color,opacity] ${
        SIZE_CLASSES[size]
      } ${
        outOfStock
          ? "cursor-not-allowed border border-black/15 bg-black/[0.06] text-black/55 shadow-none"
          : isDisabled
            ? "cursor-not-allowed bg-black/20 text-white opacity-60 shadow-none"
            : isDark
              ? "bg-[#1C1C1C] text-white shadow-[0_4px_20px_rgba(0,0,0,0.22)] hover:bg-black hover:shadow-[0_6px_24px_rgba(0,0,0,0.28)] active:scale-[0.99] active:shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
              : "bg-[var(--site-accent)] text-white hover:opacity-90 active:opacity-95"
      } ${className}`}
      aria-label={outOfStock ? OUT_OF_STOCK_LABEL : label}
    >
      {!outOfStock && (
        <Image
          src="/images/icons/cart.svg"
          alt=""
          width={20}
          height={18}
          className={`brightness-0 invert ${ICON_CLASSES[size]}`}
        />
      )}
      <span>{displayLabel}</span>
    </button>
  );
}
