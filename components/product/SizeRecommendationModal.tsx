"use client";

import { useEffect, useState } from "react";
import {
  normalizeApparelSizeLabel,
  recommendSizeFromHeightWeight,
} from "@/lib/sizeRecommendationGrid";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

type SizeRecommendationModalProps = {
  open: boolean;
  onClose: () => void;
  /** Підписи розмірів, які є у товару (для підказки про наявність). */
  availableSizeLabels?: string[];
  onApplySize?: (sizeLabel: string) => void;
};

export default function SizeRecommendationModal({
  open,
  onClose,
  availableSizeLabels = [],
  onApplySize,
}: SizeRecommendationModalProps) {
  useBodyScrollLock(open);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof recommendSizeFromHeightWeight>>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setHeight("");
      setWeight("");
      setError(null);
      setResult(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const heightCm = Number(height.replace(",", "."));
    const weightKg = Number(weight.replace(",", "."));

    if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 230) {
      setError("Вкажіть зріст у сантиметрах (наприклад, 175)");
      return;
    }
    if (!Number.isFinite(weightKg) || weightKg < 40 || weightKg > 200) {
      setError("Вкажіть вагу в кілограмах (наприклад, 78)");
      return;
    }

    const recommendation = recommendSizeFromHeightWeight(heightCm, weightKg);
    if (!recommendation) {
      setError("Не вдалося підібрати розмір. Перевірте введені дані.");
      return;
    }
    setResult(recommendation);
  };

  const matchedProductSize = result
    ? availableSizeLabels.find(
        (label) => normalizeApparelSizeLabel(label) === normalizeApparelSizeLabel(result.size)
      )
    : undefined;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-site-overlay)] flex items-end justify-center bg-black/65 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-recommendation-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-black/10 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="size-recommendation-title"
              className="font-['Montserrat'] text-lg font-bold text-black sm:text-xl"
            >
              Підібрати розмір
            </h2>
            <p className="mt-1 font-['Montserrat'] text-sm text-black/55">
              Вкажіть зріст і вагу — підкажемо орієнтовний розмір
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 font-['Montserrat'] text-lg text-black transition-colors hover:bg-black/10"
            aria-label="Закрити"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="size-rec-height"
                  className="mb-1.5 block font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-black/50"
                >
                  Зріст (см)
                </label>
                <input
                  id="size-rec-height"
                  type="number"
                  inputMode="decimal"
                  min={100}
                  max={230}
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 font-['Montserrat'] text-base text-black outline-none transition-colors focus:border-black/40"
                />
              </div>
              <div>
                <label
                  htmlFor="size-rec-weight"
                  className="mb-1.5 block font-['Montserrat'] text-xs font-semibold uppercase tracking-wide text-black/50"
                >
                  Вага (кг)
                </label>
                <input
                  id="size-rec-weight"
                  type="number"
                  inputMode="decimal"
                  min={40}
                  max={200}
                  placeholder="78"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 font-['Montserrat'] text-base text-black outline-none transition-colors focus:border-black/40"
                />
              </div>
            </div>

            {error ? (
              <p className="font-['Montserrat'] text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#1C1C1C] px-4 py-3.5 font-['Montserrat'] text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-black"
            >
              Підібрати
            </button>
          </form>

          {result ? (
            <div className="mt-5 rounded-2xl border border-black/10 bg-[#F2F2F0] p-4 sm:p-5">
              <p className="font-['Montserrat'] text-xs font-semibold uppercase tracking-[0.12em] text-black/50">
                Ваш розмір
              </p>
              <p className="mt-1 font-['Montserrat'] text-3xl font-bold text-black">{result.size}</p>
              <p className="mt-2 font-['Montserrat'] text-sm text-black/60">
                {result.perfectFit
                  ? "За вашими параметрами цей розмір найкраще відповідає нашій сітці."
                  : "Орієнтовний розмір — за межами типової сітки обрано найближчий варіант."}
              </p>
              {matchedProductSize && onApplySize ? (
                <button
                  type="button"
                  onClick={() => {
                    onApplySize(matchedProductSize);
                    onClose();
                  }}
                  className="mt-4 w-full rounded-xl border-2 border-[#1C1C1C] bg-white px-4 py-3 font-['Montserrat'] text-sm font-semibold text-black transition-colors hover:bg-black/[0.03]"
                >
                  Обрати {matchedProductSize} для цього товару
                </button>
              ) : matchedProductSize === undefined && availableSizeLabels.length > 0 ? (
                <p className="mt-3 font-['Montserrat'] text-sm text-black/55">
                  Цей розмір може бути недоступний у поточній моделі — перевірте наявні варіанти
                  вище.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
