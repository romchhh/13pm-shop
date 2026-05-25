"use client";

import React, { useEffect, useRef, useState } from "react";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import AdminProductsBackLink from "@/components/admin/AdminProductsBackLink";
import ComponentCard from "@/components/admin/ComponentCard";
import Label from "@/components/admin/form/Label";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";
import ColorPaletteEditor, { type ColorRow } from "@/components/admin/ColorPaletteEditor";
import BoughtTogetherPicker from "@/components/admin/BoughtTogetherPicker";
import SizeGroupPicker from "@/components/admin/SizeGroupPicker";
import ProductMediaOrderEditor from "@/components/admin/ProductMediaOrderEditor";
import { parseProductPageText } from "@/lib/parseProductFile";
import {
  appendFilesToSlots,
  removeSlotAt,
  resolveSlotsToMedia,
  revokeNewSlotPreviews,
  slotPreviewSrc,
  type ProductMediaSlot,
} from "@/lib/adminProductMediaSlots";
import { serializeColorOptions } from "@/lib/productOptions";
import { formatAdminProductPrice } from "@/lib/formatAdminProductPrice";
import { VIRTUAL_STOCK_WHEN_IN_STOCK } from "@/lib/productAvailability";

interface Category {
  id: number;
  name: string;
}

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [isHit, setIsHit] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [inStock, setInStock] = useState(true);

  const [colorRows, setColorRows] = useState<ColorRow[]>([
    { hex: "#1a1a1a", name: "Чорний" },
    { hex: "#ffffff", name: "Білий" },
  ]);

  const [boughtTogetherIds, setBoughtTogetherIds] = useState<number[]>([]);
  const [sizeGroupOrderedIds, setSizeGroupOrderedIds] = useState<number[]>([0]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<number, Category[]>>({});
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseFileLoading, setParseFileLoading] = useState(false);
  const [parseFileError, setParseFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaSlots, setMediaSlots] = useState<ProductMediaSlot[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed");
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
      if (!res.ok) throw new Error("Failed");
      const data: Category[] = await res.json();
      setSubcategoriesByCategory((prev) => ({ ...prev, [categoryId]: data }));
    } catch {
      /* ignore */
    }
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
      if (parsed.name) setName(parsed.name);
      if (parsed.subtitle != null) setSubtitle(parsed.subtitle);
      if (parsed.shortDescription != null) setShortDescription(parsed.shortDescription);
      if (parsed.description != null) setDescription(parsed.description);
      if (parsed.price != null) setPrice(parsed.price);
    } catch (err) {
      setParseFileError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setParseFileLoading(false);
    }
  };

  const handleDrop = (files: File[]) => {
    setMediaSlots((prev) => appendFilesToSlots(prev, files));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const uploadedMedia =
        mediaSlots.length > 0 ? await resolveSlotsToMedia(mediaSlots) : [];

      const allCategoryIds = Array.from(new Set(selectedCategoryIds));
      const allSubcategoryIds = Array.from(new Set(selectedSubcategoryIds));
      const primaryCategoryId = allCategoryIds[0] ?? null;
      const primarySubcategoryId = allSubcategoryIds[0] ?? null;

      const colors = colorRows
        .filter((r) => r.name.trim() && r.hex.trim())
        .map((r) => ({ hex: r.hex.trim(), name: r.name.trim() }));
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subtitle: subtitle || null,
          short_description: shortDescription || null,
          description: description || null,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          discount_percentage: discountPercentage ? Number(discountPercentage) : null,
          priority: 0,
          stock: inStock ? VIRTUAL_STOCK_WHEN_IN_STOCK : 0,
          top_sale: false,
          in_stock: inStock,
          limited_edition: false,
          is_hit: isHit,
          is_promo: false,
          is_new: isNew,
          dietitian_approved: false,
          free_delivery_badge: false,
          gift_product_id: null,
          bought_together_ids: boughtTogetherIds,
          pair_together_ids: [],
          category_id: primaryCategoryId,
          subcategory_id: primarySubcategoryId,
          media: uploadedMedia,
          category_ids: allCategoryIds,
          subcategory_ids: allSubcategoryIds,
          color_options: serializeColorOptions(colors),
          size_variants: [],
          fabric_composition: null,
          has_lining: false,
          lining_description: null,
          release_form: null,
          course: null,
          package_weight: null,
          main_info: null,
          main_action: null,
          indications_for_use: null,
          benefits: null,
          full_composition: null,
          usage_method: null,
          contraindications: null,
          storage_conditions: null,
          size_group_ordered_ids: (() => {
            const seen = new Set<number>();
            const out: number[] = [];
            for (const x of sizeGroupOrderedIds) {
              const id = Number(x);
              if (!Number.isInteger(id) || seen.has(id)) continue;
              if (id < 0) continue;
              seen.add(id);
              out.push(id);
            }
            if (!out.includes(0)) out.unshift(0);
            return out;
          })(),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || "Не вдалося створити");
      }

      setSuccess("Товар успішно створено!");
      setName("");
      setSubtitle("");
      setShortDescription("");
      setDescription("");
      setPrice("");
      setOldPrice("");
      setDiscountPercentage("");
      setMediaSlots((prev) => {
        revokeNewSlotPreviews(prev);
        return [];
      });
      setIsHit(false);
      setIsNew(false);
      setInStock(true);
      setSelectedCategoryIds([]);
      setSelectedSubcategoryIds([]);
      setColorRows([
        { hex: "#1a1a1a", name: "Чорний" },
        { hex: "#ffffff", name: "Білий" },
      ]);
      setBoughtTogetherIds([]);
      setSizeGroupOrderedIds([0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      <AdminProductsBackLink />
      <PageBreadcrumb pageTitle="Додати товар" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf"
        className="hidden"
        onChange={handleAddFromFile}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>Розмір</Label>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="46×52 см"
                  />
                  <p className="mt-1 text-[11px] text-gray-500">
                    Використовується на кнопках розміру та в картці нижче «Пов&apos;язані розміри».
                  </p>
                </div>
                <div>
                  <Label>Короткий опис (на сторінці товару)</Label>
                  <TextArea value={shortDescription} onChange={setShortDescription} rows={3} />
                </div>
                <div>
                  <Label>Детальний опис</Label>
                  <TextArea value={description} onChange={setDescription} rows={6} />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Ціна *</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>
                  <div>
                    <Label>Стара ціна</Label>
                    <Input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
                  </div>
                  <div>
                    <Label>Знижка %</Label>
                    <Input
                      type="number"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Кольори">
              <ColorPaletteEditor rows={colorRows} onChange={setColorRows} />
            </ComponentCard>

            <ComponentCard title="Пов'язані розміри (одна сторінка)">
              <SizeGroupPicker
                currentProductId={0}
                value={sizeGroupOrderedIds}
                onChange={setSizeGroupOrderedIds}
                draftPreview={{
                  name,
                  subtitle,
                  priceDisplay: formatAdminProductPrice(
                    Number(price) || 0,
                    discountPercentage ? Number(discountPercentage) : null
                  ),
                }}
              />
            </ComponentCard>

            <ComponentCard title="Рекомендації">
              <BoughtTogetherPicker value={boughtTogetherIds} onChange={setBoughtTogetherIds} />
            </ComponentCard>
          </div>

          <div className="space-y-4">
            <ComponentCard title="Категорії">
              {categories.length ? (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded border p-2">
                  {categories.map((cat) => {
                    const checked = selectedCategoryIds.includes(cat.id);
                    return (
                      <label key={cat.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={async () => {
                            if (checked) {
                              setSelectedCategoryIds((p) => p.filter((id) => id !== cat.id));
                              const subs = subcategoriesByCategory[cat.id] || [];
                              setSelectedSubcategoryIds((p) => p.filter((sid) => !subs.some((s) => s.id === sid)));
                            } else {
                              setSelectedCategoryIds((p) => [...p, cat.id]);
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
              {selectedCategoryIds.map((catId) => {
                const subs = subcategoriesByCategory[catId] || [];
                if (!subs.length) return null;
                return (
                  <div key={catId} className="mt-3">
                    <p className="mb-1 text-xs text-gray-500">Підкатегорії</p>
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-2">
                      {subs.map((s) => {
                        const c = selectedSubcategoryIds.includes(s.id);
                        return (
                          <label key={s.id} className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={c}
                              onChange={() =>
                                setSelectedSubcategoryIds((p) =>
                                  c ? p.filter((id) => id !== s.id) : [...p, s.id]
                                )
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
              <DropzoneComponent onDrop={handleDrop} />
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
                  <ToggleSwitch enabled={inStock} setEnabled={setInStock} label="" />
                </div>
                <div className="flex justify-between">
                  <Label className="mb-0">Новинка (NEW)</Label>
                  <ToggleSwitch enabled={isNew} setEnabled={setIsNew} label="" />
                </div>
                <div className="flex justify-between">
                  <Label className="mb-0">Хіт</Label>
                  <ToggleSwitch enabled={isHit} setEnabled={setIsHit} label="" />
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
            {loading ? "Збереження…" : "Створити товар"}
          </button>
        </div>
        {success && <p className="text-center text-green-600">{success}</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
      </form>
    </div>
  );
}
