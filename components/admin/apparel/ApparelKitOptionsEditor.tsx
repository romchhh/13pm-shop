"use client";

import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import {
  APPAREL_ADMIN_PRESET_SIZES,
  findSizeStockRow,
  normalizeApparelSizeLabel,
  sortSizeStockRows,
  type ProductSizeStock,
} from "@/lib/productOptions";
import {
  defaultKitSizeRows,
  type ProductKitOptions,
} from "@/lib/productKit";

type Props = {
  value: ProductKitOptions;
  onChange: (value: ProductKitOptions) => void;
  /** Основна ціна товару — для підказки, якщо ціни частин не задані */
  basePrice?: string;
};

function upsertSize(
  rows: ProductSizeStock[],
  label: string,
  patch: Partial<ProductSizeStock>
): ProductSizeStock[] {
  const key = normalizeApparelSizeLabel(label);
  const idx = rows.findIndex((r) => normalizeApparelSizeLabel(r.label) === key);
  if (idx < 0) {
    return sortSizeStockRows([
      ...rows,
      { label, stock: 0, price: null, ...patch },
    ]);
  }
  return sortSizeStockRows(
    rows.map((row, i) => (i === idx ? { ...row, ...patch } : row))
  );
}

function removeSize(rows: ProductSizeStock[], label: string): ProductSizeStock[] {
  const key = normalizeApparelSizeLabel(label);
  return rows.filter((r) => normalizeApparelSizeLabel(r.label) !== key);
}

function uniqueLabels(top: ProductSizeStock[], bottom: ProductSizeStock[]): string[] {
  const map = new Map<string, string>();
  for (const row of [...top, ...bottom]) {
    const key = normalizeApparelSizeLabel(row.label);
    if (!key) continue;
    if (!map.has(key)) map.set(key, row.label.trim());
  }
  return sortSizeStockRows(
    [...map.entries()].map(([, label]) => ({ label, stock: 0 }))
  ).map((r) => r.label);
}

export default function ApparelKitOptionsEditor({
  value,
  onChange,
  basePrice,
}: Props) {
  const labels = uniqueLabels(value.top, value.bottom);
  const baseNum = Number(basePrice);
  const hasPartPrices =
    value.top.some((r) => r.price != null && r.price > 0) ||
    value.bottom.some((r) => r.price != null && r.price > 0);

  const patch = (next: Partial<ProductKitOptions>) => {
    onChange({ ...value, ...next });
  };

  const addPreset = (label: string) => {
    const key = normalizeApparelSizeLabel(label);
    if (labels.some((l) => normalizeApparelSizeLabel(l) === key)) return;
    patch({
      top: upsertSize(value.top, label, { stock: 0 }),
      bottom: upsertSize(value.bottom, label, { stock: 0 }),
    });
  };

  const setStock = (part: "top" | "bottom", label: string, stock: number) => {
    patch({
      [part]: upsertSize(value[part], label, { stock: Math.max(0, stock) }),
    });
  };

  const setPrice = (part: "top" | "bottom", label: string, price: number | null) => {
    patch({
      [part]: upsertSize(value[part], label, { price }),
    });
  };

  const removeLabel = (label: string) => {
    patch({
      top: removeSize(value.top, label),
      bottom: removeSize(value.bottom, label),
    });
  };

  const copyTopStockToBottom = () => {
    const bottom = value.top.map((row) => {
      const existing = findSizeStockRow(value.bottom, row.label);
      return {
        label: row.label,
        stock: row.stock,
        price: existing?.price ?? row.price ?? null,
      };
    });
    patch({ bottom: sortSizeStockRows(bottom) });
  };

  const fillDefaultSizes = () => {
    patch({
      top: defaultKitSizeRows(),
      bottom: defaultKitSizeRows(),
    });
  };

  const clearPartPrices = () => {
    patch({
      top: value.top.map((r) => ({ label: r.label, stock: r.stock })),
      bottom: value.bottom.map((r) => ({ label: r.label, stock: r.stock })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5 text-xs text-blue-900/80">
        Покупець обирає розмір верху і низу окремо. Ціни частин — опційно: якщо заповнені для
        обох, на сайті буде їх сума; інакше — основна ціна товару
        {Number.isFinite(baseNum) && baseNum > 0 ? ` (${Math.round(baseNum)} грн)` : ""}.
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Назва верху</Label>
          <Input
            value={value.topLabel}
            onChange={(e) => patch({ topLabel: e.target.value })}
            placeholder="Куртка / Верх"
          />
        </div>
        <div>
          <Label>Назва низу</Label>
          <Input
            value={value.bottomLabel}
            onChange={(e) => patch({ bottomLabel: e.target.value })}
            placeholder="Штани / Низ"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {APPAREL_ADMIN_PRESET_SIZES.map((size) => {
          const active = labels.some(
            (l) => normalizeApparelSizeLabel(l) === normalizeApparelSizeLabel(size)
          );
          return (
            <button
              key={size}
              type="button"
              onClick={() => addPreset(size)}
              disabled={active}
              className={`rounded-full border px-3 py-1 text-xs ${
                active
                  ? "cursor-default border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}
            >
              {active ? size : `+ ${size}`}
            </button>
          );
        })}
        <button
          type="button"
          onClick={fillDefaultSizes}
          className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-600 hover:border-gray-400"
        >
          S–XL за замовчуванням
        </button>
        <button
          type="button"
          onClick={copyTopStockToBottom}
          className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-600 hover:border-gray-400"
        >
          Скопіювати склад верху → низ
        </button>
        {hasPartPrices ? (
          <button
            type="button"
            onClick={clearPartPrices}
            className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-600 hover:border-gray-400"
          >
            Очистити ціни частин
          </button>
        ) : null}
      </div>

      {labels.length === 0 ? (
        <p className="text-sm text-gray-500">
          Додайте розміри кнопками вище (напр. S, M, L, XL).
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Розмір</th>
                <th className="px-3 py-2 font-medium">
                  {value.topLabel.trim() || "Верх"} · склад
                </th>
                <th className="px-3 py-2 font-medium">
                  {value.topLabel.trim() || "Верх"} · ціна
                </th>
                <th className="px-3 py-2 font-medium">
                  {value.bottomLabel.trim() || "Низ"} · склад
                </th>
                <th className="px-3 py-2 font-medium">
                  {value.bottomLabel.trim() || "Низ"} · ціна
                </th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {labels.map((label) => {
                const top = findSizeStockRow(value.top, label);
                const bottom = findSizeStockRow(value.bottom, label);
                return (
                  <tr key={label} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-semibold text-gray-900">{label}</td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={String(top?.stock ?? 0)}
                        onChange={(e) =>
                          setStock("top", label, Math.max(0, Number(e.target.value) || 0))
                        }
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={top?.price != null ? String(top.price) : ""}
                        placeholder="—"
                        onChange={(e) => {
                          const raw = e.target.value.trim();
                          setPrice(
                            "top",
                            label,
                            raw === "" ? null : Math.max(0, Number(raw) || 0)
                          );
                        }}
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={String(bottom?.stock ?? 0)}
                        onChange={(e) =>
                          setStock(
                            "bottom",
                            label,
                            Math.max(0, Number(e.target.value) || 0)
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        value={bottom?.price != null ? String(bottom.price) : ""}
                        placeholder="—"
                        onChange={(e) => {
                          const raw = e.target.value.trim();
                          setPrice(
                            "bottom",
                            label,
                            raw === "" ? null : Math.max(0, Number(raw) || 0)
                          );
                        }}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                        aria-label={`Видалити ${label}`}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
