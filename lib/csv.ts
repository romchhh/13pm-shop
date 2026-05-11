/** Екранування поля для CSV (Excel / UTF-8). */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsvLine(values: unknown[]): string {
  return values.map(escapeCsvCell).join(",");
}
