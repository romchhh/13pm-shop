"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import { getBasketUnitPrice, getItemSubtotal } from "@/lib/pricing";

export function getCartImageSrc(imageUrl: string): string {
  if (!imageUrl) return "https://placehold.co/100x150/cccccc/666666?text=No+Image";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("/")) return imageUrl;
  return `/api/images/${imageUrl}`;
}

function TrashIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CartLineItemsProps = {
  showClearButton?: boolean;
  onClear?: () => void;
  onGlobalError?: (message: string | null) => void;
};

export default function CartLineItems({
  showClearButton = false,
  onClear,
  onGlobalError,
}: CartLineItemsProps) {
  const { items, removeItem, updateQuantity } = useBasket();
  const [quantityError, setQuantityError] = useState<Record<string, string>>({});

  if (items.length === 0) return null;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        {items.map((item, itemIndex) => {
          const key = `${item.id}-${item.size}-${item.color ?? ""}`;
          const unit = getBasketUnitPrice(
            item.price,
            item.discount_percentage,
            item.color_surcharge_uah
          );
          const lineTotal = getItemSubtotal(
            item.price,
            item.quantity,
            item.discount_percentage,
            item.color_surcharge_uah
          );
          const sizeLabel =
            item.size && item.size !== "—" && item.size.trim() ? item.size : null;
          const colorLabel = item.color?.trim() || null;

          return (
            <div
              key={key}
              className={`p-4 sm:p-5 ${itemIndex > 0 ? "border-t border-black/[0.06]" : ""}`}
            >
              <div className="flex flex-row gap-4 sm:gap-5">
                <Link
                  href={`/product/${item.id}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f5f5f4] sm:h-28 sm:w-28"
                >
                  <Image
                    src={getCartImageSrc(item.imageUrl)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1 pr-2">
                      <Link href={`/product/${item.id}`}>
                        <h2 className="font-['Montserrat'] text-base font-semibold text-black line-clamp-2 sm:text-lg">
                          {item.name}
                        </h2>
                      </Link>
                      {sizeLabel && (
                        <p className="mt-1 font-['Montserrat'] text-sm text-black/50">
                          Розмір: {sizeLabel}
                        </p>
                      )}
                      {colorLabel && (
                        <p className="font-['Montserrat'] text-sm text-black/50">
                          Колір: {colorLabel}
                          {item.color_surcharge_uah
                            ? ` (+${item.color_surcharge_uah.toLocaleString("uk-UA")} грн)`
                            : ""}
                        </p>
                      )}
                      {quantityError[key] && (
                        <p className="mt-1 text-xs text-red-600">{quantityError[key]}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.size)}
                      className="shrink-0 text-red-500 hover:text-red-600"
                      aria-label={`Видалити ${item.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="font-['Montserrat'] text-base font-semibold text-black">
                        {Math.round(lineTotal).toLocaleString("uk-UA")} грн
                      </p>
                      {item.quantity > 1 && (
                        <p className="font-['Montserrat'] text-xs text-black/45">
                          {Math.round(unit).toLocaleString("uk-UA")} грн × {item.quantity}
                        </p>
                      )}
                    </div>

                    <div
                      className="inline-flex items-center rounded-full px-1"
                      style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
                    >
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-black hover:bg-black/5"
                        disabled={item.quantity <= 1}
                        onClick={async () => {
                          try {
                            await updateQuantity(item.id, item.size, item.quantity - 1);
                            setQuantityError((prev) => {
                              const n = { ...prev };
                              delete n[key];
                              return n;
                            });
                          } catch {
                            /* ignore */
                          }
                        }}
                        aria-label="Зменшити"
                      >
                        −
                      </button>
                      <span className="min-w-[2rem] text-center font-['Montserrat'] text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-black hover:bg-black/5"
                        onClick={async () => {
                          try {
                            await updateQuantity(item.id, item.size, item.quantity + 1);
                            setQuantityError((prev) => {
                              const n = { ...prev };
                              delete n[key];
                              return n;
                            });
                          } catch (err) {
                            const msg =
                              err instanceof Error ? err.message : "Недостатньо товару";
                            setQuantityError((prev) => ({ ...prev, [key]: msg }));
                            onGlobalError?.(msg);
                            setTimeout(() => {
                              setQuantityError((prev) => {
                                const n = { ...prev };
                                delete n[key];
                                return n;
                              });
                              onGlobalError?.(null);
                            }, 5000);
                          }
                        }}
                        aria-label="Збільшити"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showClearButton && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 font-['Montserrat'] text-sm text-black/45 underline-offset-2 hover:text-black hover:underline"
        >
          Очистити кошик
        </button>
      )}
    </div>
  );
}
