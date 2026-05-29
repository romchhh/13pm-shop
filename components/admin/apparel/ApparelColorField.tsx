"use client";

import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import type { ProductColorOption } from "@/lib/productOptions";

type Props = {
  value: ProductColorOption;
  onChange: (value: ProductColorOption) => void;
};

export default function ApparelColorField({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Один колір для цього товару. Інші кольори цієї моделі додайте окремими товарами та зв&apos;яжіть
        у блоці нижче.
      </p>
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Назва кольору</Label>
          <Input
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Чорний"
          />
        </div>
        <div>
          <Label>Зразок</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value.hex.startsWith("#") ? value.hex : "#888888"}
              onChange={(e) => onChange({ ...value, hex: e.target.value })}
              className="h-11 w-14 cursor-pointer rounded border border-gray-200 bg-white p-1"
              aria-label="Колір"
            />
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 shadow-inner"
              style={{ background: value.hex }}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
