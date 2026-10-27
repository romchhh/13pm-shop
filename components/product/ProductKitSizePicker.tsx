"use client";

import {
  effectiveSizeStockForDisplay,
  sortSizeStockRows,
  type ProductSizeStock,
} from "@/lib/productOptions";
import {
  kitPartPrice,
  type ProductKitOptions,
} from "@/lib/productKit";

function sizePickerButtonClass(active: boolean, unavailable: boolean): string {
  const base =
    "flex h-11 w-full min-w-[2.75rem] items-center justify-center rounded-2xl border text-sm font-semibold transition-all sm:h-12 sm:text-[15px]";
  if (unavailable) {
    return `${base} cursor-not-allowed border-transparent bg-black/[0.04] text-black/28 line-through decoration-black/35`;
  }
  if (active) {
    return `${base} border-black bg-black text-white`;
  }
  return `${base} border-black/10 bg-white text-black hover:border-black/25 hover:bg-black/[0.02]`;
}

type Props = {
  kit: ProductKitOptions;
  productInStock?: boolean | null;
  selectedTopIndex: number;
  selectedBottomIndex: number;
  onSelectTopIndex: (index: number) => void;
  onSelectBottomIndex: (index: number) => void;
  /** Поточна ціна комплекту (вже порахована) */
  unitPrice?: number;
};

function PartPicker({
  title,
  rows,
  selectedIndex,
  onSelect,
}: {
  title: string;
  rows: ProductSizeStock[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const selected = rows[selectedIndex];
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-black/45">{title}</p>
        {selected && selected.stock > 0 ? (
          <p className="font-['Montserrat'] text-xs font-medium text-black/55">
            {selected.label}
            {kitPartPrice(selected) != null ? ` · ${kitPartPrice(selected)} грн` : ""}
          </p>
        ) : (
          <p className="font-['Montserrat'] text-xs text-black/35">Оберіть розмір</p>
        )}
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="listbox"
        aria-label={title}
      >
        {rows.map((row, index) => {
          const unavailable = row.stock <= 0;
          const active = !unavailable && index === selectedIndex;
          return (
            <button
              key={`${title}-${row.label}-${index}`}
              type="button"
              role="option"
              aria-selected={active}
              aria-disabled={unavailable}
              disabled={unavailable}
              title={unavailable ? "Немає в наявності" : undefined}
              onClick={() => {
                if (!unavailable) onSelect(index);
              }}
              className={`${sizePickerButtonClass(active, unavailable)} w-auto px-3 sm:min-w-[3.25rem]`}
            >
              {row.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Лише розміри з адмінки (без штучного розширення до XS–4XL). */
export function getKitDisplayRows(
  kit: ProductKitOptions,
  productInStock?: boolean | null
) {
  return {
    top: effectiveSizeStockForDisplay(
      sortSizeStockRows(kit.top.filter((r) => r.label.trim())),
      productInStock
    ),
    bottom: effectiveSizeStockForDisplay(
      sortSizeStockRows(kit.bottom.filter((r) => r.label.trim())),
      productInStock
    ),
  };
}

export default function ProductKitSizePicker({
  kit,
  productInStock,
  selectedTopIndex,
  selectedBottomIndex,
  onSelectTopIndex,
  onSelectBottomIndex,
  unitPrice,
}: Props) {
  const { top: topRows, bottom: bottomRows } = getKitDisplayRows(kit, productInStock);
  const top = topRows[selectedTopIndex];
  const bottom = bottomRows[selectedBottomIndex];
  const topP = kitPartPrice(top);
  const bottomP = kitPartPrice(bottom);
  const showBreakdown = topP != null && bottomP != null;
  const bothSelected = Boolean(top && top.stock > 0 && bottom && bottom.stock > 0);

  return (
    <div className="space-y-5 border-t border-black/10 pt-5">
      <div>
        <p className="text-sm text-black/45">Розміри комплекту</p>
        <p className="mt-0.5 font-['Montserrat'] text-xs text-black/40">
          Оберіть розмір для кожної частини
        </p>
      </div>

      <PartPicker
        title={kit.topLabel || "Верх"}
        rows={topRows}
        selectedIndex={selectedTopIndex}
        onSelect={onSelectTopIndex}
      />
      <PartPicker
        title={kit.bottomLabel || "Низ"}
        rows={bottomRows}
        selectedIndex={selectedBottomIndex}
        onSelect={onSelectBottomIndex}
      />

      {bothSelected ? (
        <div className="rounded-2xl border border-black/[0.08] bg-black/[0.02] px-4 py-3">
          <p className="font-['Montserrat'] text-sm text-black/70">
            <span className="font-medium text-black">
              {(kit.topLabel || "Верх").trim()} {top!.label}
            </span>
            <span className="mx-1.5 text-black/30">·</span>
            <span className="font-medium text-black">
              {(kit.bottomLabel || "Низ").trim()} {bottom!.label}
            </span>
          </p>
          {showBreakdown ? (
            <p className="mt-1 font-['Montserrat'] text-xs text-black/45">
              {topP} грн + {bottomP} грн
              {unitPrice != null ? ` = ${unitPrice.toLocaleString("uk-UA")} грн` : ""}
            </p>
          ) : unitPrice != null ? (
            <p className="mt-1 font-['Montserrat'] text-xs text-black/45">
              {unitPrice.toLocaleString("uk-UA")} грн за комплект
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
