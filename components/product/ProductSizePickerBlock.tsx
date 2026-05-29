"use client";

import { useState } from "react";
import {
  parseSizeStock,
  parseSizeVariants,
  type ProductSizeVariant,
} from "@/lib/productOptions";
import { getProductSizeGuideImage } from "@/lib/productSizeGuide";
import SizeGuideModal from "@/components/product/SizeGuideModal";

function sizePickerButtonClass(active: boolean, disabled: boolean): string {
  const base =
    "flex min-h-[48px] min-w-[3.25rem] items-center justify-center rounded-xl border-2 px-3 text-sm font-bold transition-all sm:min-h-[52px] sm:min-w-[3.5rem] sm:text-base";
  if (disabled) {
    return `${base} cursor-not-allowed border-black/10 bg-black/[0.03] text-black/25 line-through`;
  }
  if (active) {
    return `${base} border-[#1C1C1C] bg-[#1C1C1C] text-white shadow-[0_4px_14px_rgba(0,0,0,0.18)] ring-2 ring-[#1C1C1C]/20 ring-offset-2`;
  }
  return `${base} border-black/20 bg-white text-black hover:border-black/45 hover:shadow-sm`;
}

type ProductSizePickerBlockProps = {
  productId: number;
  categoryName?: string | null;
  categorySlug?: string | null;
  subcategoryName?: string | null;
  sizeVariants: unknown;
  currentSizeLabel: string;
  selectedSizeIndex: number;
  onSelectSizeIndex: (index: number) => void;
  onLegacySizeClick: (variant: ProductSizeVariant) => void;
};

export default function ProductSizePickerBlock({
  productId,
  categoryName,
  categorySlug,
  subcategoryName,
  sizeVariants,
  currentSizeLabel,
  selectedSizeIndex,
  onSelectSizeIndex,
  onLegacySizeClick,
}: ProductSizePickerBlockProps) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const sizeStock = parseSizeStock(sizeVariants);
  const legacySizeVariants = parseSizeVariants(sizeVariants);
  const hasStockPicker = sizeStock.length > 0;
  const hasLegacyPicker = legacySizeVariants.length > 0 && !hasStockPicker;

  const sizeGuideImage = getProductSizeGuideImage(
    categoryName,
    categorySlug,
    subcategoryName
  );

  if (!hasStockPicker && !hasLegacyPicker) {
    return null;
  }

  return (
    <>
      <div className="border-t border-black/10 pt-5">
        <div className="rounded-2xl border border-black/10 bg-[#F2F2F0] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/55">
                Розмір
              </p>
              {sizeGuideImage ? (
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="mt-1 font-['Montserrat'] text-xs text-black/50 underline decoration-black/30 underline-offset-2 transition-colors hover:text-black hover:decoration-black/60"
                >
                  Підібрати розмір
                </button>
              ) : null}
            </div>
            <p className="text-lg font-bold text-black sm:text-xl">{currentSizeLabel}</p>
          </div>

          {hasStockPicker && (
            <div
              className="flex flex-wrap gap-2"
              role="listbox"
              aria-label="Оберіть розмір"
            >
              {sizeStock.map((row, index) => {
                const active = index === selectedSizeIndex;
                const disabled = row.stock <= 0;
                return (
                  <button
                    key={`${row.label}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={disabled}
                    onClick={() => onSelectSizeIndex(index)}
                    className={sizePickerButtonClass(active, disabled)}
                  >
                    {row.label}
                  </button>
                );
              })}
            </div>
          )}

          {hasLegacyPicker && (
            <div className="flex flex-wrap gap-2" role="listbox" aria-label="Оберіть розмір">
              {legacySizeVariants.map((v) => {
                const active = v.productId === productId;
                return (
                  <button
                    key={`${v.label}-${v.productId}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => onLegacySizeClick(v)}
                    className={sizePickerButtonClass(active, false)}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {sizeGuideImage ? (
        <SizeGuideModal
          open={sizeGuideOpen}
          onClose={() => setSizeGuideOpen(false)}
          imageSrc={sizeGuideImage}
        />
      ) : null}
    </>
  );
}
