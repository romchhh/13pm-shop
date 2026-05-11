"use client";

import { useState } from "react";

const PARTS = [
  { part: "products" },
  { part: "orders" },
  { part: "order_items" },
  { part: "users" },
] as const;

async function downloadPart(part: string) {
  const res = await fetch(`/api/admin/export-csv?part=${encodeURIComponent(part)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  const match = cd?.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? `export-${part}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExportDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      for (const { part } of PARTS) {
        await downloadPart(part);
        await new Promise((r) => setTimeout(r, 150));
      }
      setMessage("Чотири CSV-файли збережено у завантаженнях.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Помилка вигрузки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Вигрузка БД (CSV)</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Окремі файли: товари, замовлення, позиції замовлень, клієнти (без паролів). Кодування UTF-8 з BOM для
        Excel.
      </p>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#3D1A00] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2d1400] disabled:opacity-50"
      >
        {loading ? "Формування…" : "Завантажити CSV"}
      </button>
      {message && (
        <p className={`mt-2 text-xs ${message.includes("Помилка") ? "text-red-600" : "text-green-700"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
