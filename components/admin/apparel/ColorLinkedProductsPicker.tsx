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
    <BoughtTogetherPicker
      value={value}
      onChange={onChange}
      excludeProductId={excludeProductId}
      groupLabelSource="color"
    />
  );
}
