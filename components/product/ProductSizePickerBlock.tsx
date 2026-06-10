"use client";

import { useState } from "react";
import {
  expandSizeStockForDisplay,
  normalizeApparelSizeLabel,
  parseSizeStock,
  parseSizeVariants,
  type ProductSizeVariant,
} from "@/lib/productOptions";
import { getProductSizeGuideImage } from "@/lib/productSizeGuide";
import SizeGuideModal from "@/components/product/SizeGuideModal";
import SizeRecommendationModal from "@/components/product/SizeRecommendationModal";

function sizePickerButtonClass(active: boolean, unavailable: boolean): string {
  const base =
    "flex h-11 w-full items-center justify-center rounded-2xl border text-sm font-semibold transition-all sm:h-12 sm:text-[15px]";
  if (unavailable) {
    return `${base} cursor-not-allowed border-transparent bg-black/[0.04] text-black/28 line-through decoration-black/35`;
  }
  if (active) {
    return `${base} border-black bg-black text-white`;
  }
  return `${base} border-black/10 bg-white text-black hover:border-black/25 hover:bg-black/[0.02]`;
}

const sizeHelperLinkClass =
  "font-['Montserrat'] text-sm font-medium text-[var(--site-accent)] underline decoration-[var(--site-accent)]/50 underline-offset-[3px] transition-colors hover:text-black hover:decoration-black/55";

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
  selectedSizeIndex,
  onSelectSizeIndex,
  onLegacySizeClick,
}: ProductSizePickerBlockProps) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [sizeRecommendOpen, setSizeRecommendOpen] = useState(false);

  const sizeStock = expandSizeStockForDisplay(parseSizeStock(sizeVariants));
  const legacySizeVariants = parseSizeVariants(sizeVariants);
  const hasStockPicker = sizeStock.length > 0;
  const hasLegacyPicker = legacySizeVariants.length > 0 && !hasStockPicker;

  const sizeGuideImage = getProductSizeGuideImage(
    categoryName,
    categorySlug,
    subcategoryName
  );

  const selectedAvailable =
    hasStockPicker &&
    sizeStock[selectedSizeIndex] &&
    sizeStock[selectedSizeIndex].stock > 0;

  if (!hasStockPicker && !hasLegacyPicker) {
    return null;
  }

  return (
    <>
      <div className="border-t border-black/10 pt-5">
        <div className="mb-3">
          <p className="text-sm text-black/45">Розмір</p>
          {!selectedAvailable ? (
            <p className="mt-0.5 font-['Montserrat'] text-xs text-black/40">
              Оберіть розмір із наявних
            </p>
          ) : null}
        </div>

        {hasStockPicker && (
          <div
            className="grid grid-cols-4 gap-2 sm:grid-cols-7"
            role="listbox"
            aria-label="Оберіть розмір"
          >
            {sizeStock.map((row, index) => {
              const unavailable = row.stock <= 0;
              const active = !unavailable && index === selectedSizeIndex;
              return (
                <button
                  key={`${row.label}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-disabled={unavailable}
                  disabled={unavailable}
                  title={unavailable ? "Немає в наявності" : undefined}
                  onClick={() => {
                    if (!unavailable) onSelectSizeIndex(index);
                  }}
                  className={sizePickerButtonClass(active, unavailable)}
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
                  className={`${sizePickerButtonClass(active, false)} min-w-[3.25rem] flex-none sm:w-auto`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-8 sm:gap-y-2">
          <p className="font-['Montserrat'] text-sm leading-snug">
            <button
              type="button"
              onClick={() => setSizeRecommendOpen(true)}
              className={sizeHelperLinkClass}
            >
              Підібрати розмір
            </button>
            <span className="mt-0.5 block text-xs text-black/45 sm:mt-0 sm:inline sm:ml-1.5">
              За зростом і вагою
            </span>
          </p>

          {sizeGuideImage ? (
            <p className="font-['Montserrat'] text-sm leading-snug">
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className={sizeHelperLinkClass}
              >
                Розмірна сітка
              </button>
              <span className="mt-0.5 block text-xs text-black/45 sm:mt-0 sm:inline sm:ml-1.5">
                Таблиця мірок
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <SizeRecommendationModal
        open={sizeRecommendOpen}
        onClose={() => setSizeRecommendOpen(false)}
        availableSizeLabels={
          hasStockPicker
            ? sizeStock.filter((row) => row.stock > 0).map((row) => row.label)
            : legacySizeVariants.map((v) => v.label)
        }
        onApplySize={(sizeLabel) => {
          if (!hasStockPicker) return;
          const index = sizeStock.findIndex(
            (row) =>
              normalizeApparelSizeLabel(row.label) === normalizeApparelSizeLabel(sizeLabel)
          );
          if (index >= 0 && sizeStock[index].stock > 0) {
            onSelectSizeIndex(index);
          }
        }}
      />

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
