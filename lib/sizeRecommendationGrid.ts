import { normalizeApparelSizeLabel } from "@/lib/productOptions";

export { normalizeApparelSizeLabel };

/** Сітка підбору розмірів за зростом (см) та вагою (кг). */
export type SizeRecommendationRow = {
  size: string;
  heightMin: number;
  heightMax: number;
  weightMin: number;
  weightMax: number;
};

export const SIZE_RECOMMENDATION_GRID: SizeRecommendationRow[] = [
  { size: "XS", heightMin: 160, heightMax: 170, weightMin: 55, weightMax: 65 },
  { size: "S", heightMin: 165, heightMax: 175, weightMin: 65, weightMax: 75 },
  { size: "M", heightMin: 170, heightMax: 180, weightMin: 75, weightMax: 82 },
  { size: "L", heightMin: 175, heightMax: 185, weightMin: 82, weightMax: 88 },
  { size: "XL", heightMin: 178, heightMax: 188, weightMin: 88, weightMax: 94 },
  { size: "XXL", heightMin: 180, heightMax: 190, weightMin: 94, weightMax: 100 },
  { size: "3XL", heightMin: 182, heightMax: 195, weightMin: 100, weightMax: 110 },
  { size: "4XL", heightMin: 185, heightMax: 200, weightMin: 110, weightMax: 120 },
];

function distanceToRange(value: number, min: number, max: number): number {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

/** @deprecated Використовуйте normalizeApparelSizeLabel */
export const normalizeSizeLabelForMatch = normalizeApparelSizeLabel;

function fitScore(row: SizeRecommendationRow, heightCm: number, weightKg: number): number {
  const heightDist = distanceToRange(heightCm, row.heightMin, row.heightMax);
  const weightDist = distanceToRange(weightKg, row.weightMin, row.weightMax);
  const heightCenter = (row.heightMin + row.heightMax) / 2;
  const weightCenter = (row.weightMin + row.weightMax) / 2;
  const centerBias =
    (Math.abs(heightCm - heightCenter) + Math.abs(weightKg - weightCenter)) * 0.01;
  return heightDist + weightDist + centerBias;
}

export type SizeRecommendationResult = {
  size: string;
  heightCm: number;
  weightKg: number;
  perfectFit: boolean;
};

/**
 * Орієнтовний розмір за зростом і вагою.
 * Якщо значення поза сіткою — повертає найближчий розмір.
 */
export function recommendSizeFromHeightWeight(
  heightCm: number,
  weightKg: number
): SizeRecommendationResult | null {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return null;
  if (heightCm <= 0 || weightKg <= 0) return null;

  let best = SIZE_RECOMMENDATION_GRID[0];
  let bestScore = Infinity;

  for (const row of SIZE_RECOMMENDATION_GRID) {
    const score = fitScore(row, heightCm, weightKg);
    if (score < bestScore) {
      bestScore = score;
      best = row;
    }
  }

  const perfectFit =
    heightCm >= best.heightMin &&
    heightCm <= best.heightMax &&
    weightKg >= best.weightMin &&
    weightKg <= best.weightMax;

  return {
    size: best.size,
    heightCm,
    weightKg,
    perfectFit,
  };
}

export function formatHeightRange(row: SizeRecommendationRow): string {
  return `${row.heightMin}–${row.heightMax} см`;
}

export function formatWeightRange(row: SizeRecommendationRow): string {
  return `${row.weightMin}–${row.weightMax} кг`;
}
