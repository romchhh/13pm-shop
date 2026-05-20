"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import { formatAdminProductPrice } from "@/lib/formatAdminProductPrice";
import { buildSizeGroupLabels, groupProductsForAdminPicker } from "@/lib/sizeGroupLabels";

type CatalogProduct = {
  id: number;
  name: string;
  subtitle: string | null;
  price: number;
  discount_percentage?: number | null;
  first_media?: { url: string; type: string } | null;
  size_variants?: unknown;
};

function thumbSrc(p: CatalogProduct | undefined): string | null {
  const m = p?.first_media;
  if (!m?.url) return null;
  return `/api/images/${m.url}`;
}

export type SizeGroupDraftPreview = {
  name: string;
  subtitle: string;
  priceDisplay: string;
};

type SizeGroupPickerProps = {
  /** Реальний id товару або `0` під час створення (плейсхолдер у списку). */
  currentProductId: number;
  value: number[];
  onChange: (orderedIds: number[]) => void;
  /** Якщо `currentProductId === 0` — підпис картки «цей новий товар». */
  draftPreview?: SizeGroupDraftPreview;
  /** Під час редагування — показати назву/ціну поточного товару з форми (до завантаження каталогу). */
  editedProductPreview?: SizeGroupDraftPreview;
};

export default function SizeGroupPicker({
  currentProductId,
  value,
  onChange,
  draftPreview,
  editedProductPreview,
}: SizeGroupPickerProps) {
  const isDraft = currentProductId === 0;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [query, setQuery] = useState("");

  const ordered = useMemo(() => {
    const seen = new Set<number>();
    const out: number[] = [];
    for (const raw of value) {
      const id = Number(raw);
      if (!Number.isInteger(id) || seen.has(id)) continue;
      if (id <= 0 && !(isDraft && id === 0)) continue;
      seen.add(id);
      out.push(id);
    }
    if (isDraft) {
      if (!out.includes(0)) out.unshift(0);
    } else {
      if (!out.includes(currentProductId)) out.unshift(currentProductId);
    }
    return out;
  }, [value, currentProductId, isDraft]);

  useEffect(() => {
    const same =
      ordered.length === value.length && ordered.every((id, i) => id === value[i]);
    if (!same) onChange(ordered);
  }, [ordered, value, onChange]);

  useEffect(() => {
    if (catalog.length > 0) return;
    const hasPeers = value.some((id) => {
      const n = Number(id);
      return Number.isInteger(n) && n > 0 && (isDraft || n !== currentProductId);
    });
    if (!pickerOpen && !hasPeers) return;
    let cancelled = false;
    (async () => {
      setCatalogLoading(true);
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch");
        const data: unknown = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setCatalog(
            data.map((row: unknown) => {
              const r = row as Record<string, unknown>;
              return {
                id: Number(r.id),
                name: String(r.name ?? ""),
                subtitle:
                  r.subtitle == null || r.subtitle === undefined
                    ? null
                    : String(r.subtitle),
                price: Number(r.price ?? 0),
                discount_percentage:
                  r.discount_percentage == null ? null : Number(r.discount_percentage),
                first_media:
                  r.first_media && typeof r.first_media === "object"
                    ? (r.first_media as { url: string; type: string })
                    : null,
                size_variants: r.size_variants ?? [],
              };
            })
          );
        }
      } catch {
        if (!cancelled) setCatalog([]);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pickerOpen, value, catalog.length, isDraft, currentProductId]);

  const byId = useMemo(() => {
    const m = new Map<number, CatalogProduct>();
    for (const p of catalog) {
      if (Number.isInteger(p.id)) m.set(p.id, p);
    }
    return m;
  }, [catalog]);

  const catalogGroupLabels = useMemo(
    () =>
      buildSizeGroupLabels(
        catalog.map((p) => ({ id: p.id, size_variants: p.size_variants }))
      ),
    [catalog]
  );

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((p) => {
      if (ordered.includes(p.id)) return false;
      if (isDraft && p.id === 0) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.subtitle?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [catalog, query, ordered, isDraft]);

  const modalSections = useMemo(
    () => groupProductsForAdminPicker(filteredCatalog, catalogGroupLabels),
    [filteredCatalog, catalogGroupLabels]
  );

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= ordered.length) return;
    const next = [...ordered];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  const removeAt = (index: number) => {
    const id = ordered[index];
    if (isDraft && id === 0) return;
    if (!isDraft && id === currentProductId) return;
    if (ordered.length <= 1) return;
    onChange(ordered.filter((_, i) => i !== index));
  };

  const addId = (id: number) => {
    if (ordered.includes(id)) return;
    onChange([...ordered, id]);
    setPickerOpen(false);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Ці товари показуються як перемикачі розміру на одній сторінці. Підпис на кнопці — з поля «Розмір»
        або з назви. Порядок у списку = порядок кнопок на сайті.
      </p>

      <ul className="flex flex-col gap-2">
        {ordered.map((id, index) => {
          const p = id === 0 ? undefined : byId.get(id);
          const src = id === 0 ? null : thumbSrc(p);
          const isCurrent = isDraft ? id === 0 : id === currentProductId;
          const useFormPreview = !isDraft && isCurrent && editedProductPreview;
          const nameLine = useFormPreview
            ? editedProductPreview.name?.trim() || "—"
            : id === 0
              ? draftPreview?.name?.trim() || "Новий товар (заповніть назву)"
              : p?.name?.trim() || "Товар з каталогу";
          const sizeLine = useFormPreview
            ? editedProductPreview.subtitle?.trim() || null
            : id === 0
              ? draftPreview?.subtitle?.trim() || null
              : p?.subtitle?.trim() || null;
          const priceLine = useFormPreview
            ? editedProductPreview.priceDisplay || "—"
            : id === 0
              ? draftPreview?.priceDisplay || "—"
              : formatAdminProductPrice(p?.price ?? 0, p?.discount_percentage);
          const groupTag = id !== 0 ? catalogGroupLabels.get(id) : null;

          return (
            <li
              key={id === 0 ? "draft" : id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-2 py-2"
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  className="rounded border border-gray-200 bg-white px-1.5 text-xs leading-none text-gray-600 disabled:opacity-30"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Вище"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded border border-gray-200 bg-white px-1.5 text-xs leading-none text-gray-600 disabled:opacity-30"
                  disabled={index === ordered.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Нижче"
                >
                  ↓
                </button>
              </div>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {src ? (
                  p?.first_media?.type === "video" ? (
                    <video src={src} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <Image src={src} alt="" fill className="object-cover" unoptimized sizes="48px" />
                  )
                ) : (
                  <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-medium text-gray-500">
                    {isCurrent ? "Новий" : "—"}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{nameLine}</p>
                {groupTag ? (
                  <span className="mt-0.5 inline-block w-fit rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200/70">
                    {groupTag}
                  </span>
                ) : null}
                <p className="truncate text-xs text-gray-600">
                  {sizeLine ? <>{sizeLine} · </> : null}
                  <span className="font-medium text-gray-800">{priceLine}</span>
                </p>
                {isCurrent ? (
                  <p className="text-[11px] text-amber-800/90">
                    {isDraft ? "Буде першим у групі після збереження — можна змінити порядок." : "Поточний товар"}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={isCurrent || ordered.length <= 1}
                onClick={() => removeAt(index)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-35"
              >
                Прибрати
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => {
          setQuery("");
          setPickerOpen(true);
        }}
        className="rounded-lg border border-amber-700/40 px-4 py-2 text-sm text-amber-900 hover:bg-amber-50"
      >
        Додати товар з каталогу (інший розмір)…
      </button>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Додати розмір до групи"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Оберіть товар (розмір)</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Закрити"
              >
                ×
              </button>
            </div>
            <div className="border-b px-4 py-2">
              <Label className="sr-only">Пошук</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук за назвою або розміром…"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {catalogLoading ? (
                <p className="p-4 text-center text-sm text-gray-500">Завантаження…</p>
              ) : filteredCatalog.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500">Нічого не знайдено</p>
              ) : (
                <div className="space-y-3">
                  {modalSections.map((section) => (
                    <div key={section.sectionTitle}>
                      <p className="sticky top-0 z-[1] mb-1 bg-gray-100/95 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
                        {section.sectionTitle}
                      </p>
                      <ul className="space-y-1">
                        {section.items.map((p) => {
                          const src = thumbSrc(p);
                          const sz = p.subtitle?.trim();
                          const gTag = catalogGroupLabels.get(p.id);
                          return (
                            <li key={p.id}>
                              <button
                                type="button"
                                onClick={() => addId(p.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50"
                              >
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                  {src ? (
                                    p.first_media?.type === "video" ? (
                                      <video
                                        src={src}
                                        className="h-full w-full object-cover"
                                        muted
                                        playsInline
                                      />
                                    ) : (
                                      <Image
                                        src={src}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        unoptimized
                                        sizes="44px"
                                      />
                                    )
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                                  {gTag ? (
                                    <span className="mt-0.5 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 ring-1 ring-amber-200/70">
                                      {gTag}
                                    </span>
                                  ) : null}
                                  <p className="truncate text-xs text-gray-600">
                                    {sz ? `${sz} · ` : ""}
                                    <span className="font-medium text-gray-800">
                                      {formatAdminProductPrice(p.price, p.discount_percentage)}
                                    </span>
                                  </p>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
