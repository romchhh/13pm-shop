"use client";

import Input from "@/components/admin/form/input/InputField";
import { isWhiteColorOption, WHITE_COLOR_SURCHARGE_UAH } from "@/lib/colorPricing";

export type ColorRow = { hex: string; name: string };

const PRESET_SWATCHES = [
  "#1a1a1a",
  "#ffffff",
  "#8B5E3F",
  "#E8C9A0",
  "#2d2d2d",
  "#c4a574",
  "#5c4033",
  "#f5f0e8",
  "#000000",
  "#e53935",
  "#1e88e5",
  "#43a047",
];

function normalizeHexInput(raw: string): string {
  const t = raw.trim();
  if (!t) return "#888888";
  const h = t.startsWith("#") ? t : `#${t}`;
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(h)) return h;
  return h.slice(0, 7);
}

type Props = {
  rows: ColorRow[];
  onChange: (rows: ColorRow[]) => void;
};

export default function ColorPaletteEditor({ rows, onChange }: Props) {
  const updateRow = (index: number, patch: Partial<ColorRow>) => {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const addRow = (hex = "#888888") => {
    onChange([...rows, { hex, name: "" }]);
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-gray-500">
        Оберіть колір з палітри або вкажіть HEX. Назва показується на сайті. Доплата +
        {WHITE_COLOR_SURCHARGE_UAH} грн за білий — лише якщо в описі товару є рядок «Матеріал:
        …фанер…» (короткий або детальний опис) та якщо перемикач доплати увімкнено в товарі.
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESET_SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() => addRow(hex)}
            className="h-8 w-8 rounded-full border-2 border-gray-200 shadow-sm transition hover:scale-110 hover:border-[#8B5E3F]"
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/50 p-2"
          >
            <label
              className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-200 shadow-inner"
              title="Підібрати колір"
            >
              <span
                className="absolute inset-0"
                style={{ backgroundColor: normalizeHexInput(row.hex) }}
              />
              <input
                type="color"
                value={normalizeHexInput(row.hex).slice(0, 7)}
                onChange={(e) => updateRow(i, { hex: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            <Input
              className="w-24 font-mono text-xs"
              value={row.hex}
              onChange={(e) => updateRow(i, { hex: normalizeHexInput(e.target.value) })}
              placeholder="#000000"
            />
            <div className="min-w-[120px] flex-1">
              <Input
                className="w-full"
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
                placeholder="Назва кольору"
              />
              {row.name.trim() &&
                isWhiteColorOption({ hex: row.hex, name: row.name }) && (
                  <p className="mt-0.5 text-[10px] font-medium text-amber-800">
                    Може додаватися +{WHITE_COLOR_SURCHARGE_UAH} грн на сайті
                  </p>
                )}
            </div>
            <button
              type="button"
              className="rounded bg-red-100 px-2 py-1 text-sm text-red-700"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              aria-label="Видалити колір"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm font-medium text-[#3D1A00] hover:underline"
          onClick={() => addRow()}
        >
          + колір
        </button>
      </div>
    </div>
  );
}
