"use client";

import React, { useEffect, useRef, useState } from "react";
import ComponentCard from "@/components/admin/ComponentCard";
import Label from "@/components/admin/form/Label";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";
import ProductMediaOrderEditor from "@/components/admin/ProductMediaOrderEditor";
import BoughtTogetherPicker from "@/components/admin/BoughtTogetherPicker";
import ApparelColorField from "@/components/admin/apparel/ApparelColorField";
import ApparelSizeStockEditor from "@/components/admin/apparel/ApparelSizeStockEditor";
import ColorLinkedProductsPicker from "@/components/admin/apparel/ColorLinkedProductsPicker";
import { parseProductPageText } from "@/lib/parseProductFile";
import {
  appendFilesToSlots,
  removeSlotAt,
  resolveSlotsToMedia,
  revokeNewSlotPreviews,
  slotPreviewSrc,
  slotsFromExisting,
  type ProductMediaSlot,
} from "@/lib/adminProductMediaSlots";
import {
  apparelFormFromProduct,
  buildApparelProductApiBody,
  defaultApparelColor,
  defaultApparelSizeRows,
  type ApparelProductFormValues,
} from "@/lib/apparelProduct";

interface Category {
  id: number;
  name: string;
}

type ApparelProductEditorProps = {
  mode: "create" | "edit";
  productId?: number;
  initialValues?: ApparelProductFormValues;
  initialMedia?: { url: string; type: string }[];
  submitLabel: string;
  onSubmit: (body: ReturnType<typeof buildApparelProductApiBody>) => Promise<void>;
};

export default function ApparelProductEditor({
  mode,
  productId,
  initialValues,
  initialMedia,
  submitLabel,
  onSubmit,
}: ApparelProductEditorProps) {
  const [values, setValues] = useState<ApparelProductFormValues>(
    initialValues ?? {
      name: "",
      shortDescription: "",
      description: "",
      price: "",
      oldPrice: "",
      discountPercentage: "",
      color: defaultApparelColor(),
      colorLinkedIds: [],
      boughtTogetherIds: [],
      sizeRows: defaultApparelSizeRows(),
      inStock: true,
      isNew: false,
      isHit: false,
      categoryIds: [],
      subcategoryIds: [],
    }
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<number, Category[]>>({});
  const [mediaSlots, setMediaSlots] = useState<ProductMediaSlot[]>(() =>
    initialMedia?.length ? slotsFromExisting(initialMedia) : []
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseFileLoading, setParseFileLoading] = useState(false);
  const [parseFileError, setParseFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValues) setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (initialMedia?.length) {
      setMediaSlots(slotsFromExisting(initialMedia));
    }
  }, [initialMedia]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) return;
        const data: Category[] = await res.json();
        setCategories(data);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const loadSubcategoriesForCategory = async (categoryId: number) => {
    if (subcategoriesByCategory[categoryId]) return;
    try {
      const res = await fetch(`/api/subcategories?parent_category_id=${categoryId}`);
      if (!res.ok) return;
      const data: Category[] = await res.json();
      setSubcategoriesByCategory((prev) => ({ ...prev, [categoryId]: data }));
    } catch {
      /* ignore */
    }
  };

  const patch = (patchValues: Partial<ApparelProductFormValues>) => {
    setValues((prev) => ({ ...prev, ...patchValues }));
  };

  const handleAddFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setParseFileError(null);
    setParseFileLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/parse-product-file", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Помилка файлу");
      const parsed = parseProductPageText(data.text);
      patch({
        ...(parsed.name ? { name: parsed.name } : {}),
        ...(parsed.shortDescription != null ? { shortDescription: parsed.shortDescription } : {}),
        ...(parsed.description != null ? { description: parsed.description } : {}),
        ...(parsed.price != null ? { price: parsed.price } : {}),
      });
    } catch (err) {
      setParseFileError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setParseFileLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const uploadedMedia =
        mediaSlots.length > 0 ? await resolveSlotsToMedia(mediaSlots) : [];
      const body = buildApparelProductApiBody(values, uploadedMedia);
      await onSubmit(body);

      if (mode === "edit" && productId != null) {
        const res = await fetch(`/api/products/${productId}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          patch({ colorLinkedIds: apparelFormFromProduct(data).colorLinkedIds });
        }
      }

      if (mode === "create") {
        setSuccess("Товар успішно створено!");
        setValues({
          name: "",
          shortDescription: "",
          description: "",
          price: "",
          oldPrice: "",
          discountPercentage: "",
          color: defaultApparelColor(),
          colorLinkedIds: [],
          boughtTogetherIds: [],
          sizeRows: defaultApparelSizeRows(),
          inStock: true,
          isNew: false,
          isHit: false,
          categoryIds: [],
          subcategoryIds: [],
        });
        setMediaSlots((prev) => {
          revokeNewSlotPreviews(prev);
          return [];
        });
      } else {
        setSuccess("Збережено!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка збереження");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf"
        className="hidden"
        onChange={handleAddFromFile}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={parseFileLoading}
          className="rounded-lg border border-blue-400 px-4 py-2 text-sm text-blue-600 hover:border-blue-600 disabled:opacity-50"
        >
          {parseFileLoading ? "…" : "Імпорт з файлу"}
        </button>
        <span className="text-xs text-gray-500">назва, опис, ціна</span>
      </div>
      {parseFileError && <p className="text-sm text-red-600">{parseFileError}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ComponentCard title="Основне">
            <div className="space-y-3">
              <div>
                <Label>Назва *</Label>
                <Input
                  value={values.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Короткий опис</Label>
                <TextArea
                  value={values.shortDescription}
                  onChange={(v) => patch({ shortDescription: v })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Детальний опис</Label>
                <TextArea
                  value={values.description}
                  onChange={(v) => patch({ description: v })}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <Label>Ціна *</Label>
                  <Input
                    type="number"
                    value={values.price}
                    onChange={(e) => patch({ price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Стара ціна</Label>
                  <Input
                    type="number"
                    value={values.oldPrice}
                    onChange={(e) => patch({ oldPrice: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Знижка %</Label>
                  <Input
                    type="number"
                    value={values.discountPercentage}
                    onChange={(e) => patch({ discountPercentage: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Колір">
            <ApparelColorField
              value={values.color}
              onChange={(color) => patch({ color })}
            />
          </ComponentCard>

          <ComponentCard title="Пов’язані товари — інші кольори (Група 1, 2…)">
            <ColorLinkedProductsPicker
              value={values.colorLinkedIds}
              onChange={(colorLinkedIds) => patch({ colorLinkedIds })}
              excludeProductId={productId}
            />
          </ComponentCard>

          <ComponentCard title="Рекомендації">
            <BoughtTogetherPicker
              value={values.boughtTogetherIds}
              onChange={(boughtTogetherIds) => patch({ boughtTogetherIds })}
              excludeProductId={productId}
            />
          </ComponentCard>

          <ComponentCard title="Розміри">
            <ApparelSizeStockEditor
              rows={values.sizeRows}
              onChange={(sizeRows) => patch({ sizeRows })}
            />
          </ComponentCard>
        </div>

        <div className="space-y-4">
          <ComponentCard title="Категорії">
            {categories.length ? (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-2">
                {categories.map((cat) => {
                  const checked = values.categoryIds.includes(cat.id);
                  return (
                    <label key={cat.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={async () => {
                          if (checked) {
                            patch({
                              categoryIds: values.categoryIds.filter((id) => id !== cat.id),
                            });
                            const subs = subcategoriesByCategory[cat.id] || [];
                            patch({
                              subcategoryIds: values.subcategoryIds.filter(
                                (sid) => !subs.some((s) => s.id === sid)
                              ),
                            });
                          } else {
                            patch({ categoryIds: [...values.categoryIds, cat.id] });
                            await loadSubcategoriesForCategory(cat.id);
                          }
                        }}
                      />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Немає категорій</p>
            )}
            {values.categoryIds.map((catId) => {
              const subs = subcategoriesByCategory[catId] || [];
              if (!subs.length) return null;
              return (
                <div key={catId} className="mt-3">
                  <p className="mb-1 text-xs text-gray-500">Підкатегорії</p>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-2">
                    {subs.map((s) => {
                      const c = values.subcategoryIds.includes(s.id);
                      return (
                        <label key={s.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={c}
                            onChange={() =>
                              patch({
                                subcategoryIds: c
                                  ? values.subcategoryIds.filter((id) => id !== s.id)
                                  : [...values.subcategoryIds, s.id],
                              })
                            }
                          />
                          {s.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </ComponentCard>

          <ComponentCard title="Медіа">
            <DropzoneComponent onDrop={(files) => setMediaSlots((prev) => appendFilesToSlots(prev, files))} />
            <ProductMediaOrderEditor
              items={mediaSlots.map((slot) => ({
                key: slot.key,
                type: slot.kind === "new" ? slot.type : slot.type === "video" ? "video" : "photo",
                src: slotPreviewSrc(slot),
              }))}
              onReorder={(items) => {
                const byKey = new Map(mediaSlots.map((s) => [s.key, s]));
                setMediaSlots(
                  items
                    .map((it) => byKey.get(it.key))
                    .filter((s): s is ProductMediaSlot => s != null)
                );
              }}
              onRemove={(index) => setMediaSlots((prev) => removeSlotAt(prev, index))}
            />
          </ComponentCard>

          <ComponentCard title="Плашки на картці">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="mb-0">В наявності</Label>
                <ToggleSwitch
                  enabled={values.inStock}
                  setEnabled={(inStock) => patch({ inStock })}
                  label=""
                />
              </div>
              <div className="flex justify-between">
                <Label className="mb-0">Новинка (NEW)</Label>
                <ToggleSwitch enabled={values.isNew} setEnabled={(isNew) => patch({ isNew })} label="" />
              </div>
              <div className="flex justify-between">
                <Label className="mb-0">Хіт</Label>
                <ToggleSwitch enabled={values.isHit} setEnabled={(isHit) => patch({ isHit })} label="" />
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-8 py-3 text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Збереження…" : submitLabel}
        </button>
      </div>
      {success && <p className="text-center text-green-600">{success}</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
    </form>
  );
}
