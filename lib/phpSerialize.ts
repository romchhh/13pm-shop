/**
 * Мінімальний PHP serialize() для масивів/рядків/чисел —
 * потрібен для LP-CRM `products` / `sender`.
 */
export function phpSerialize(value: unknown): string {
  if (value === null || value === undefined) return "N;";

  if (typeof value === "boolean") {
    return value ? "b:1;" : "b:0;";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "N;";
    if (Number.isInteger(value)) return `i:${value};`;
    return `d:${value};`;
  }

  if (typeof value === "string") {
    const bytes = Buffer.byteLength(value, "utf8");
    return `s:${bytes}:"${value}";`;
  }

  if (Array.isArray(value)) {
    let out = `a:${value.length}:{`;
    for (let i = 0; i < value.length; i++) {
      out += phpSerialize(i);
      out += phpSerialize(value[i]);
    }
    return `${out}}`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    let out = `a:${entries.length}:{`;
    for (const [key, val] of entries) {
      const numericKey = /^-?\d+$/.test(key) ? Number(key) : key;
      out += phpSerialize(numericKey);
      out += phpSerialize(val);
    }
    return `${out}}`;
  }

  return "N;";
}
