"use client";

import { useFavorites } from "@/lib/FavoritesProvider";
import type { FavoriteProductSnapshot } from "@/lib/favoritesStorage";

/** Один контур серця — без «дірки», щоб stroke не малював два шари. */
const HEART_PATH =
  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z";

type FavoriteButtonProps = {
  product: FavoriteProductSnapshot;
  /** compact — на картці каталогу; product — на сторінці товару */
  variant?: "card" | "product";
  className?: string;
};

function HeartIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
    >
      <path
        d={HEART_PATH}
        fill={filled ? "white" : "none"}
        stroke="white"
        strokeWidth={filled ? 0 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FavoriteButton({
  product,
  variant = "card",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(product.id);

  const iconSize = variant === "product" ? 26 : 22;
  const hitArea =
    variant === "product"
      ? "min-h-11 min-w-11 sm:min-h-12 sm:min-w-12"
      : "min-h-9 min-w-9 sm:min-h-10 sm:min-w-10";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product);
      }}
      className={`inline-flex shrink-0 items-center justify-center bg-transparent p-0 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${hitArea} ${className}`}
      aria-label={active ? "Прибрати з вішлиста" : "Додати у вішлист"}
      aria-pressed={active}
    >
      <HeartIcon filled={active} size={iconSize} />
    </button>
  );
}
