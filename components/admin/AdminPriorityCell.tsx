"use client";

import { useEffect, useState } from "react";
import { parseCatalogPriority } from "@/lib/catalogPriority";

type EntityType = "product" | "category";

type AdminPriorityCellProps = {
  value: number;
  entityType: EntityType;
  entityId: number;
  onSaved?: (priority: number) => void;
  className?: string;
};

export default function AdminPriorityCell({
  value,
  entityType,
  entityId,
  onSaved,
  className = "",
}: AdminPriorityCellProps) {
  const [local, setLocal] = useState(String(value ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocal(String(value ?? 0));
  }, [value]);

  const save = async () => {
    const parsed = parseCatalogPriority(local);
    if (parsed === null) {
      setError("Ціле число ≥ 0");
      setLocal(String(value ?? 0));
      return;
    }
    if (parsed === (value ?? 0)) {
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/catalog/priorities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: entityType,
          id: entityId,
          priority: parsed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Не вдалося зберегти"
        );
      }
      onSaved?.(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка збереження");
      setLocal(String(value ?? 0));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-w-[5.5rem] ${className}`.trim()}>
      <input
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        value={local}
        disabled={saving}
        onChange={(e) => {
          setLocal(e.target.value);
          setError(null);
        }}
        onBlur={() => void save()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void save();
          }
          if (e.key === "Escape") {
            setLocal(String(value ?? 0));
            setError(null);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="w-20 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
        title="Пріоритет відображення"
        aria-label="Пріоритет"
      />
      {saving ? (
        <p className="mt-1 text-[10px] text-gray-400">Збереження…</p>
      ) : error ? (
        <p className="mt-1 text-[10px] text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
