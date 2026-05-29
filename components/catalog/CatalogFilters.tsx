"use client";

import { useCallback, useMemo, useState } from "react";
import type { CatalogColorFilterOption } from "@/lib/catalogFilterOptions";
import { isLightSwatch } from "@/lib/catalogFilterOptions";

const ACCENT = "var(--site-accent)";

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

interface CatalogFiltersProps {
  variant: "sidebar" | "mobile";
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategories: number[];
  selectedSubcategories: number[];
  toggleCategory: (id: number) => void;
  toggleSubcategory: (id: number) => void;
  priceRange: { min: number; max: number };
  minPriceInput: string;
  maxPriceInput: string;
  setMinPriceInput: (v: string) => void;
  setMaxPriceInput: (v: string) => void;
  promoOnly: boolean;
  setPromoOnly: (v: boolean | ((b: boolean) => boolean)) => void;
  hasPromoProducts: boolean;
  colorOptions: CatalogColorFilterOption[];
  selectedColorInput: string | null;
  setSelectedColorInput: (id: string | null) => void;
  sizeOptions: string[];
  selectedSizesInput: string[];
  toggleSizeInput: (size: string) => void;
  onClear: () => void;
  onSave: () => void;
  onClose?: () => void;
}

function FilterIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path strokeLinecap="round" d="M4 6h16M8 12h8M10 18h4" />
      <circle cx="6" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SwatchCheckIcon({ light }: { light: boolean }) {
  return (
    <svg className={`h-4 w-4 ${light ? "text-black" : "text-white"}`} viewBox="0 0 12 10" fill="none" aria-hidden>
      <path d="M1 5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const filterCheckboxClass =
  "h-4 w-4 shrink-0 rounded border-black/30 text-[var(--site-accent)] focus:ring-[var(--site-accent)] focus:ring-offset-0";

function FilterCheckRow({
  checked,
  onChange,
  label,
  className = "",
  labelClassName = "text-sm",
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 py-3.5 text-left font-['Montserrat'] hover:text-black ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={filterCheckboxClass}
        aria-label={label}
      />
      <span
        className={`${labelClassName} ${checked ? "font-semibold text-[#1a1a1a]" : "text-black/80"}`}
      >
        {label}
      </span>
    </label>
  );
}

export default function CatalogFilters({
  variant,
  categories,
  subcategories,
  selectedCategories,
  selectedSubcategories,
  toggleCategory,
  toggleSubcategory,
  priceRange,
  minPriceInput,
  maxPriceInput,
  setMinPriceInput,
  setMaxPriceInput,
  promoOnly,
  setPromoOnly,
  hasPromoProducts,
  colorOptions,
  selectedColorInput,
  setSelectedColorInput,
  sizeOptions,
  selectedSizesInput,
  toggleSizeInput,
  onClear,
  onSave,
  onClose,
}: CatalogFiltersProps) {
  const [openPrice, setOpenPrice] = useState(true);
  const [openColors, setOpenColors] = useState(true);
  const [openSizes, setOpenSizes] = useState(true);

  const sliderMinBound = priceRange.min;
  const sliderMaxBound = priceRange.max;

  const parsedMin = minPriceInput === "" ? sliderMinBound : Math.max(sliderMinBound, Number(minPriceInput) || sliderMinBound);
  const parsedMax = maxPriceInput === "" ? sliderMaxBound : Math.min(sliderMaxBound, Number(maxPriceInput) || sliderMaxBound);

  const rangeMin = Math.min(parsedMin, parsedMax);
  const rangeMax = Math.max(parsedMin, parsedMax);

  const setRangeFromSlider = useCallback(
    (lo: number, hi: number) => {
      const a = Math.max(sliderMinBound, Math.min(lo, hi));
      const b = Math.min(sliderMaxBound, Math.max(lo, hi));
      setMinPriceInput(String(Math.round(a)));
      setMaxPriceInput(String(Math.round(b)));
    },
    [sliderMinBound, sliderMaxBound, setMinPriceInput, setMaxPriceInput]
  );

  const pct = useMemo(
    () => ({
      lo: sliderMaxBound === sliderMinBound ? 0 : ((rangeMin - sliderMinBound) / (sliderMaxBound - sliderMinBound)) * 100,
      hi: sliderMaxBound === sliderMinBound ? 100 : ((rangeMax - sliderMinBound) / (sliderMaxBound - sliderMinBound)) * 100,
    }),
    [rangeMin, rangeMax, sliderMinBound, sliderMaxBound]
  );

  const SectionHeader = ({
    title,
    open,
    onToggle,
  }: {
    title: string;
    open: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between py-3 text-left font-['Montserrat'] text-sm font-semibold text-[#1a1a1a] border-b border-black/10"
    >
      <span>{title}</span>
      <svg
        className={`h-4 w-4 shrink-0 transition-transform ${open ? "" : "rotate-180"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );

  const CategoryRows = (
    <div className="border-b border-black/10">
      {categories.map((cat) => {
        const active = selectedCategories.includes(cat.id);
        const subs = subcategories.filter((sc) => sc.category_id === cat.id);
        return (
          <div key={cat.id} className="border-b border-black/5 last:border-0">
            <FilterCheckRow
              checked={active}
              onChange={() => toggleCategory(cat.id)}
              label={cat.name}
              className="py-3"
            />
            {active && subs.length > 0 && (
              <ul className="mb-2 space-y-0.5 border-l-2 border-[var(--site-accent)]/25 pb-3 pl-3 ml-2">
                {subs.map((sc) => {
                  const scOn = selectedSubcategories.includes(sc.id);
                  return (
                    <li key={sc.id}>
                      <FilterCheckRow
                        checked={scOn}
                        onChange={() => toggleSubcategory(sc.id)}
                        label={sc.name}
                        className="py-2"
                        labelClassName="text-xs"
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );

  const PriceBlock = (
    <div className={`space-y-4 pb-3 ${openPrice ? "block" : "hidden"}`}>
      <div className="catalog-price-range relative mx-1 h-8">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-black/10" />
        <div
          className="pointer-events-none absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
          style={{
            left: `${pct.lo}%`,
            width: `${Math.max(0, pct.hi - pct.lo)}%`,
            backgroundColor: ACCENT,
          }}
        />
        <input
          type="range"
          min={sliderMinBound}
          max={sliderMaxBound}
          step={10}
          value={rangeMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            const nextMin = Math.min(v, rangeMax - 10);
            setRangeFromSlider(nextMin, rangeMax);
          }}
          className="catalog-price-range-input absolute inset-0 z-[1] h-8 w-full cursor-pointer"
          aria-label="Мінімальна ціна"
        />
        <input
          type="range"
          min={sliderMinBound}
          max={sliderMaxBound}
          step={10}
          value={rangeMax}
          onChange={(e) => {
            const v = Number(e.target.value);
            const nextMax = Math.max(v, rangeMin + 10);
            setRangeFromSlider(rangeMin, nextMax);
          }}
          className="catalog-price-range-input absolute inset-0 z-[2] h-8 w-full cursor-pointer"
          aria-label="Максимальна ціна"
        />
      </div>
      <div className="flex justify-between font-['Montserrat'] text-sm" style={{ color: ACCENT }}>
        <span>{rangeMin} грн</span>
        <span>{rangeMax} грн</span>
      </div>
    </div>
  );

  const ColorsBlock = (
    <div className={`pb-3 ${openColors ? "block" : "hidden"}`}>
      {colorOptions.length === 0 ? (
        <p className="pt-2 font-['Montserrat'] text-xs text-black/45">Кольори з&apos;являться після додавання товарів</p>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 pt-2 scrollbar-hide">
          <div className="flex min-w-min gap-3">
            {colorOptions.map((color) => {
              const selected = selectedColorInput === color.key;
              const light = isLightSwatch(color.hex);
              return (
                <button
                  key={color.key}
                  type="button"
                  onClick={() => setSelectedColorInput(selected ? null : color.key)}
                  className="group flex w-[4.5rem] shrink-0 flex-col items-center gap-2"
                  aria-label={color.name}
                  aria-pressed={selected}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-inner ring-2 ring-offset-2 transition-transform group-hover:scale-105 ${
                      light ? "border border-black/15" : ""
                    } ${selected ? "ring-[var(--site-accent)]" : "ring-transparent"}`}
                    style={{ background: color.hex }}
                  >
                    {selected ? <SwatchCheckIcon light={light} /> : null}
                  </span>
                  <span
                    className={`max-w-full truncate text-center font-['Montserrat'] text-[10px] leading-tight ${
                      selected ? "font-semibold text-[#1a1a1a]" : "text-black/55"
                    }`}
                  >
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const SizesBlock = (
    <div className={`pb-2 pt-2 ${openSizes ? "block" : "hidden"}`}>
      {sizeOptions.length === 0 ? (
        <p className="font-['Montserrat'] text-xs text-black/45">Розміри з&apos;являться після додавання товарів</p>
      ) : (
        <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <div className="flex min-w-min flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const active = selectedSizesInput.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSizeInput(size)}
                  className={`shrink-0 rounded-full px-4 py-2 font-['Montserrat'] text-xs font-medium transition-colors ${
                    active ? "text-white" : "bg-black/[0.06] text-black/60"
                  }`}
                  style={active ? { backgroundColor: ACCENT } : undefined}
                  aria-pressed={active}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const PromoBlock =
    hasPromoProducts ? (
      <div className="border-b border-black/10 pb-3">
        <label className="flex cursor-pointer items-start gap-3 pt-2">
          <input
            type="checkbox"
            checked={promoOnly}
            onChange={() => setPromoOnly((v) => !v)}
            className={`mt-0.5 ${filterCheckboxClass}`}
          />
          <span className="font-['Montserrat'] text-sm text-black/75">Лише акційні товари</span>
        </label>
      </div>
    ) : null;

  const SaveButton = (
    <button
      type="button"
      onClick={() => {
        onSave();
        onClose?.();
      }}
      className="w-full rounded-full py-3.5 font-['Montserrat'] text-sm font-semibold text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: ACCENT }}
    >
      Зберегти фільтри
    </button>
  );

  const inner = (
    <>
      {variant === "sidebar" && (
        <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4">
          <span className="font-['Montserrat'] text-base font-semibold text-[#1a1a1a]">Фільтр</span>
          <div className="flex items-center gap-2 text-black/50">
            <button
              type="button"
              onClick={onClear}
              className="font-['Montserrat'] text-xs text-black/50 underline hover:text-black"
            >
              Скинути
            </button>
            <FilterIcon className="h-5 w-5 shrink-0 text-black/55" />
          </div>
        </div>
      )}

      {CategoryRows}

      <div className="mt-1">
        <SectionHeader title="Ціна" open={openPrice} onToggle={() => setOpenPrice((v) => !v)} />
        {PriceBlock}
      </div>

      {colorOptions.length > 0 && (
        <div>
          <SectionHeader title="Колір" open={openColors} onToggle={() => setOpenColors((v) => !v)} />
          {ColorsBlock}
        </div>
      )}

      {sizeOptions.length > 0 && (
        <div>
          <SectionHeader title="Розмір" open={openSizes} onToggle={() => setOpenSizes((v) => !v)} />
          {SizesBlock}
        </div>
      )}

      {PromoBlock}

      {variant === "sidebar" && <div className="mt-6">{SaveButton}</div>}
    </>
  );

  if (variant === "mobile") {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <span className="font-['Montserrat'] text-base font-semibold text-[#1a1a1a]">Фільтр</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClear}
              className="font-['Montserrat'] text-xs text-black/50 underline"
            >
              Скинути
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-2xl leading-none text-black/60 hover:bg-black/5"
              aria-label="Закрити"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-2">{inner}</div>
        <div className="border-t border-black/10 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          {SaveButton}
        </div>
      </div>
    );
  }

  return <div className="font-['Montserrat']">{inner}</div>;
}
