"use client";

import { useCallback, useMemo, useState } from "react";

const ACCENT = "#8B5E3F";

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
  selectedColorInput: string | null;
  setSelectedColorInput: (id: string | null) => void;
  onClear: () => void;
  onSave: () => void;
  onClose?: () => void;
}

const COLOR_SWATCHES = [
  { id: "black", className: "bg-black" },
  { id: "white", className: "bg-white border-2 border-black/20" },
  { id: "brown", className: "bg-[#5C4033]" },
  { id: "orange", className: "bg-[#E8A87C]" },
] as const;

const MATERIALS = [
  { id: "wood", label: "Деревина" },
  { id: "mdf", label: "МДФ" },
  { id: "hdf", label: "ХДФ" },
] as const;

function FilterIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        d="M4 6h16M8 12h8M10 18h4"
      />
      <circle cx="6" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="18" r="1.8" fill="currentColor" stroke="none" />
    </svg>
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
  selectedColorInput,
  setSelectedColorInput,
  onClear,
  onSave,
  onClose,
}: CatalogFiltersProps) {
  const [openPrice, setOpenPrice] = useState(true);
  const [openColors, setOpenColors] = useState(true);
  const [openMaterial, setOpenMaterial] = useState(true);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set(["wood"]));

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

  const toggleMaterial = (id: string) => {
    setSelectedMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) next.add(id);
      return next;
    });
  };

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
            <button
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className="flex w-full items-center justify-between gap-2 py-3.5 text-left font-['Montserrat'] text-sm text-black/80 hover:text-black"
            >
              <span className={active ? "font-semibold text-[#1a1a1a]" : ""}>{cat.name}</span>
              <svg className="h-4 w-4 shrink-0 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {active && subs.length > 0 && (
              <ul className="mb-2 space-y-1 pb-3 pl-2">
                {subs.map((sc) => {
                  const scOn = selectedSubcategories.includes(sc.id);
                  return (
                    <li key={sc.id}>
                      <button
                        type="button"
                        onClick={() => toggleSubcategory(sc.id)}
                        className={`font-['Montserrat'] text-xs ${scOn ? "font-semibold text-[#8B5E3F]" : "text-black/65"}`}
                      >
                        {sc.name}
                      </button>
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
      <div className="flex flex-wrap gap-3 pt-2">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() =>
              setSelectedColorInput(selectedColorInput === c.id ? null : c.id)
            }
            className={`flex h-10 w-10 items-center justify-center rounded-full ${c.className} shadow-inner ring-2 ring-offset-2 ${
              selectedColorInput === c.id ? "ring-[#8B5E3F]" : "ring-transparent"
            }`}
            aria-label={c.id}
          >
            {selectedColorInput === c.id && c.id !== "white" && (
              <svg className="h-5 w-5 text-white" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {selectedColorInput === c.id && c.id === "white" && (
              <svg className="h-5 w-5 text-black" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const MaterialBlock = (
    <div className={`flex flex-wrap gap-2 pb-2 pt-2 ${openMaterial ? "flex" : "hidden"}`}>
      {MATERIALS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => toggleMaterial(m.id)}
          className={`rounded-full px-4 py-2 font-['Montserrat'] text-xs font-medium transition-colors ${
            selectedMaterials.has(m.id)
              ? "text-white"
              : "bg-black/[0.06] text-black/60"
          }`}
          style={selectedMaterials.has(m.id) ? { backgroundColor: ACCENT } : undefined}
        >
          {m.label}
        </button>
      ))}
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
            className="mt-0.5 h-4 w-4 rounded border-black/30 text-[#8B5E3F] focus:ring-[#8B5E3F]"
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

      <div>
        <SectionHeader title="Кольори" open={openColors} onToggle={() => setOpenColors((v) => !v)} />
        {ColorsBlock}
      </div>

      <div>
        <SectionHeader title="Матеріал" open={openMaterial} onToggle={() => setOpenMaterial((v) => !v)} />
        {MaterialBlock}
      </div>

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
