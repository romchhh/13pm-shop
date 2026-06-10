"use client";

import { useEffect, useState } from "react";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import {
  APPAREL_ADMIN_PRESET_SIZES,
  ONE_SIZE_LABEL,
  isOneSizeLabel,
  type ProductSizeStock,
} from "@/lib/productOptions";

type Props = {
  rows: ProductSizeStock[];
  onChange: (rows: ProductSizeStock[]) => void;
};

export default function ApparelSizeStockEditor({ rows, onChange }: Props) {
  const [oneSizeMode, setOneSizeMode] = useState(() =>
    rows.length === 1 && isOneSizeLabel(rows[0]?.label ?? "")
  );

  useEffect(() => {
    if (rows.length === 1 && isOneSizeLabel(rows[0]?.label ?? "")) {
      setOneSizeMode(true);
    } else if (rows.length > 1 || (rows.length === 1 && !isOneSizeLabel(rows[0]?.label ?? ""))) {
      setOneSizeMode(false);
    }
  }, [rows]);

  const updateRow = (index: number, patch: Partial<ProductSizeStock>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = (label = "") => {
    onChange([...rows, { label, stock: 0 }]);
  };

  const addPreset = (label: string) => {
    if (rows.some((r) => r.label.trim().toUpperCase() === label.toUpperCase())) return;
    onChange([...rows, { label, stock: 0 }]);
  };

  const toggleOneSize = (enabled: boolean) => {
    setOneSizeMode(enabled);
    if (enabled) {
      const stock = rows.length === 1 ? rows[0].stock : 0;
      onChange([{ label: ONE_SIZE_LABEL, stock }]);
    } else {
      onChange([
        { label: "S", stock: 0 },
        { label: "M", stock: 0 },
        { label: "L", stock: 0 },
        { label: "XL", stock: 0 },
      ]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Для кожного розміру вкажіть кількість на складі. На сайті покупець обирає розмір на одній
        сторінці товару.
      </p>

      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
        <input
          type="checkbox"
          checked={oneSizeMode}
          onChange={(e) => toggleOneSize(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="font-['Montserrat'] text-sm font-medium text-gray-800">One size</span>
        <span className="text-xs text-gray-500">(один універсальний розмір)</span>
      </label>

      {oneSizeMode ? (
        <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-gray-200 p-3">
          <div className="w-28">
            <Label className="text-xs">На складі</Label>
            <Input
              type="number"
              value={String(rows[0]?.stock ?? 0)}
              onChange={(e) =>
                onChange([{ label: ONE_SIZE_LABEL, stock: Math.max(0, Number(e.target.value) || 0) }])
              }
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {APPAREL_ADMIN_PRESET_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => addPreset(size)}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-gray-400"
              >
                + {size}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={`${row.label}-${index}`} className="flex flex-wrap items-end gap-2">
                <div className="min-w-[5.5rem] flex-1">
                  <Label className="text-xs">Розмір</Label>
                  <Input
                    value={row.label}
                    onChange={(e) => updateRow(index, { label: e.target.value })}
                    placeholder="L"
                  />
                </div>
                <div className="w-28">
                  <Label className="text-xs">На складі</Label>
                  <Input
                    type="number"
                    value={String(row.stock)}
                    onChange={(e) =>
                      updateRow(index, { stock: Math.max(0, Number(e.target.value) || 0) })
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="mb-0.5 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50"
                  aria-label="Видалити розмір"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addRow()}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            + Додати розмір
          </button>
        </>
      )}
    </div>
  );
}
