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

function SaveIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  );
}

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
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setLocal(String(value ?? 0));
  }, [value]);

  const parsedLocal = parseCatalogPriority(local);
  const isDirty =
    parsedLocal !== null && parsedLocal !== (value ?? 0);

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
    setSavedFlash(false);
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
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка збереження");
      setLocal(String(value ?? 0));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-w-[6.5rem] ${className}`.trim()}>
      <div className="flex items-center gap-1.5">
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
            setSavedFlash(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void save();
            }
            if (e.key === "Escape") {
              setLocal(String(value ?? 0));
              setError(null);
              setSavedFlash(false);
            }
          }}
          className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
          title="Пріоритет відображення"
          aria-label="Пріоритет"
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || !isDirty}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
            saving || !isDirty
              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
              : "border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100"
          }`}
          title="Зберегти пріоритет"
          aria-label="Зберегти пріоритет"
        >
          {saving ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          ) : (
            <SaveIcon />
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-[10px] text-red-600">{error}</p>
      ) : savedFlash ? (
        <p className="mt-1 text-[10px] text-green-600">Збережено</p>
      ) : null}
    </div>
  );
}
