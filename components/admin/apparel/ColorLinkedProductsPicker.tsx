"use client";

import BoughtTogetherPicker from "@/components/admin/BoughtTogetherPicker";

type Props = {
  value: number[];
  onChange: (ids: number[]) => void;
  excludeProductId?: number;
};

/** Товари інших кольорів — одна модель, різні сторінки (pair_together_ids). */
export default function ColorLinkedProductsPicker({
  value,
  onChange,
  excludeProductId,
}: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        Оберіть товари того ж виробу в інших кольорах. На сторінці товару з&apos;являться перемикачі
        кольору з переходом на відповідний товар.
      </p>
      <BoughtTogetherPicker
        value={value}
        onChange={onChange}
        excludeProductId={excludeProductId}
      />
    </div>
  );
}
