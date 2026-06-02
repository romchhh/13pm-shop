"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import { formatAdminProductPrice } from "@/lib/formatAdminProductPrice";
import { buildColorLinkGroupLabels } from "@/lib/colorLinkGroups";
import { buildSizeGroupLabels, groupProductsForAdminPicker } from "@/lib/sizeGroupLabels";

type CatalogProduct = {
  id: number;
  name: string;
  subtitle: string | null;
  price: number;
  discount_percentage?: number | null;
  first_media?: { url: string; type: string } | null;
  size_variants?: unknown;
  pair_together_ids?: unknown;
};

function thumbSrc(p: CatalogProduct | undefined): string | null {
  const m = p?.first_media;
  if (!m?.url) return null;
  return `/api/images/${m.url}`;
}

type BoughtTogetherPickerProps = {
  value: number[];
  onChange: (ids: number[]) => void;
  excludeProductId?: number;
  /** size — групи розмірів; color — групи пов’язаних кольорів */
  groupLabelSource?: "size" | "color";
};

export default function BoughtTogetherPicker({
  value,
  onChange,
  excludeProductId,
  groupLabelSource = "size",
}: BoughtTogetherPickerProps) {
  const selectedIds = useMemo(
    () => Array.from(new Set(value.filter((n) => Number.isInteger(n) && n > 0))),
    [value]
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [query, setQuery] = useState("");

  const setIds = (ids: number[]) => {
    onChange(Array.from(new Set(ids.filter((n) => n > 0))));
  };

  const addId = (id: number) => {
    if (excludeProductId != null && id === excludeProductId) return;
    if (selectedIds.includes(id)) return;
    setIds([...selectedIds, id]);
  };

  const removeId = (id: number) => {
    setIds(selectedIds.filter((x) => x !== id));
  };

  useEffect(() => {
    if (catalog.length > 0) return;
    const hasSelection = selectedIds.length > 0;
    if (!pickerOpen && !hasSelection) return;
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
                pair_together_ids: r.pair_together_ids ?? [],
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
  }, [pickerOpen, selectedIds.length, catalog.length]);

  const byId = useMemo(() => {
    const m = new Map<number, CatalogProduct>();
    for (const p of catalog) {
      if (Number.isInteger(p.id)) m.set(p.id, p);
    }
    return m;
  }, [catalog]);

  const catalogGroupLabels = useMemo(() => {
    if (groupLabelSource === "color") {
      return buildColorLinkGroupLabels(
        catalog.map((p) => ({ id: p.id, pair_together_ids: p.pair_together_ids }))
      );
    }
    return buildSizeGroupLabels(
      catalog.map((p) => ({ id: p.id, size_variants: p.size_variants }))
    );
  }, [catalog, groupLabelSource]);

  const selectionGroupLabel = useMemo(() => {
    if (groupLabelSource !== "color" || excludeProductId == null) return null;
    const allIds = [excludeProductId, ...selectedIds];
    const labels = buildColorLinkGroupLabels(
      allIds.map((id) => ({ id, pair_together_ids: catalog.find((p) => p.id === id)?.pair_together_ids }))
    );
    return labels.get(excludeProductId) ?? null;
  }, [groupLabelSource, excludeProductId, selectedIds, catalog]);

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((p) => {
      if (excludeProductId != null && p.id === excludeProductId) return false;
      if (selectedIds.includes(p.id)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.subtitle?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [catalog, query, selectedIds, excludeProductId]);

  const modalSections = useMemo(
    () => groupProductsForAdminPicker(filteredCatalog, catalogGroupLabels),
    [filteredCatalog, catalogGroupLabels]
  );

  return (
    <div className="space-y-3">
      {groupLabelSource === "color" ? (
        <p className="text-xs text-gray-500">
          Інші кольори того ж виробу. Після збереження зв’язок двосторонній (A↔B), усі в групі бачать одна
          одну — у списках нижче позначено <strong>Група 1</strong>, <strong>Група 2</strong> тощо.
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          Товари з блоку «Купують разом» на сторінці товару. Оберіть з каталогу або керуйте списком нижче.
        </p>
      )}

      {selectionGroupLabel ? (
        <p className="text-sm font-medium text-amber-900">
          Поточна група:{" "}
          <span className="rounded bg-amber-50 px-2 py-0.5 ring-1 ring-amber-200/70">
            {selectionGroupLabel}
          </span>
        </p>
      ) : null}

      {selectedIds.length > 0 && (
        <ul className="flex flex-col gap-2">
            {selectedIds.map((id) => {
              const p = byId.get(id);
              const src = thumbSrc(p);
              const nameLine = p?.name?.trim() || "Товар";
              const sizeLine = p?.subtitle?.trim() || null;
              const priceLine = formatAdminProductPrice(p?.price ?? 0, p?.discount_percentage);
              const groupTag = catalogGroupLabels.get(id);
              return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50/80 px-2 py-2"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {src ? (
                    p?.first_media?.type === "video" ? (
                      <video src={src} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <Image src={src} alt="" fill className="object-cover" unoptimized sizes="48px" />
                    )
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                      …
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
                </div>
                <button
                  type="button"
                  onClick={() => removeId(id)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Прибрати
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => {
          setQuery("");
          setPickerOpen(true);
        }}
        className="rounded-lg border border-blue-400 px-4 py-2 text-sm text-blue-600 hover:border-blue-600"
      >
        Додати з каталогу…
      </button>

      {pickerOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Обрати товар"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">Оберіть товар</h3>
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
                                onClick={() => {
                                  addId(p.id);
                                  setPickerOpen(false);
                                }}
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
