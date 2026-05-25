"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
import Image from "next/image";
import { parseProductPageText } from "@/lib/parseProductFile";
import { parseColorOptions, parseSizeVariants, serializeColorOptions } from "@/lib/productOptions";
import { formatAdminProductPrice } from "@/lib/formatAdminProductPrice";
import {
  VIRTUAL_STOCK_WHEN_IN_STOCK,
  isProductOutOfStock,
} from "@/lib/productAvailability";

interface Category {
  id: number;
  name: string;
}

type ExistingMedia = { type: string; url: string };
type NewMediaFile = { file: File; type: "photo" | "video"; preview: string };

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;

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

  const [colorRows, setColorRows] = useState<ColorRow[]>([{ hex: "#888888", name: "" }]);
  const [boughtTogetherIds, setBoughtTogetherIds] = useState<number[]>([]);
  const [sizeGroupOrderedIds, setSizeGroupOrderedIds] = useState<number[]>([]);

  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<NewMediaFile[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [subcategoriesByCategory, setSubcategoriesByCategory] = useState<Record<number, Category[]>>({});
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parseFileLoading, setParseFileLoading] = useState(false);
  const [parseFileError, setParseFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchData() {
      if (!productId) return;
      setLoadingData(true);
      setError(null);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${productId}`, { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        if (!productRes.ok) throw new Error("Не вдалося завантажити товар");
        const productData = await productRes.json();
        const categoryData: Category[] = categoriesRes.ok ? await categoriesRes.json() : [];

        const mediaArray = Array.isArray(productData.media) ? productData.media : [];
        setExistingMedia(
          mediaArray.map((item: { url: string; type: string }) => ({
            type: item.type,
            url: item.url,
          }))
        );

        const allCategoryIds: number[] = Array.isArray(productData.category_ids)
          ? productData.category_ids
          : productData.category_id
            ? [productData.category_id]
            : [];
        const allSubcategoryIds: number[] = Array.isArray(productData.subcategory_ids)
          ? productData.subcategory_ids
          : productData.subcategory_id
            ? [productData.subcategory_id]
            : [];

        setSelectedCategoryIds(allCategoryIds);
        setSelectedSubcategoryIds(allSubcategoryIds);
        setCategories(categoryData);

        setName(productData.name || "");
        setSubtitle(productData.subtitle || "");
        setShortDescription(productData.short_description || "");
        setDescription(productData.description || "");
        setPrice(String(productData.price ?? ""));
        setOldPrice(productData.old_price != null ? String(productData.old_price) : "");
        setDiscountPercentage(
          productData.discount_percentage != null ? String(productData.discount_percentage) : ""
        );
        setIsHit(productData.is_hit === true);
        setIsNew(productData.is_new === true);
        setInStock(
          !isProductOutOfStock({
            in_stock: productData.in_stock,
            stock: productData.stock,
          })
        );

        const cols = parseColorOptions(productData.color_options);
        setColorRows(
          cols.length ? cols.map((c) => ({ hex: c.hex, name: c.name })) : [{ hex: "#888888", name: "" }]
        );

        const boughtIds: number[] = Array.isArray(productData.bought_together_ids)
          ? productData.bought_together_ids
              .map((x: unknown) => Number(x))
              .filter((n: number) => Number.isInteger(n) && n > 0)
          : [];
        setBoughtTogetherIds(boughtIds);

        const pid =
          productId != null && !Array.isArray(productId) ? Number(productId) : NaN;
        const variants = parseSizeVariants(productData.size_variants);
        if (variants.length > 0) {
          const ids = variants.map((v) => v.productId);
          if (Number.isInteger(pid) && !ids.includes(pid)) {
            setSizeGroupOrderedIds([pid, ...ids]);
          } else {
            setSizeGroupOrderedIds(ids);
          }
        } else if (Number.isInteger(pid)) {
          setSizeGroupOrderedIds([pid]);
        } else {
          setSizeGroupOrderedIds([]);
        }

        const subMap: Record<number, Category[]> = {};
        for (const catId of allCategoryIds) {
          try {
            const res = await fetch(`/api/subcategories?parent_category_id=${catId}`, {
              cache: "no-store",
            });
            if (res.ok) subMap[catId] = await res.json();
          } catch {
            /* ignore */
          }
        }
        setSubcategoriesByCategory(subMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Помилка завантаження");
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [productId]);

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
    const added: NewMediaFile[] = files.map((file) => {
      const isVideo =
        file.type.startsWith("video/") ||
        [".webm", ".mp4", ".mov", ".avi", ".mkv"].some((ext) =>
          file.name.toLowerCase().endsWith(ext)
        );
      return {
        file,
        type: (isVideo ? "video" : "photo") as NewMediaFile["type"],
        preview: URL.createObjectURL(file),
      };
    });
    setNewMediaFiles((prev) => [...prev, ...added]);
  };

  const removeExistingMedia = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewMedia = (index: number) => {
    setNewMediaFiles((prev) => {
      const item = prev[index];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];
      if (newMediaFiles.length > 0) {
        const uploadForm = new FormData();
        newMediaFiles.forEach((m) => uploadForm.append("images", m.file));
        const uploadRes = await fetch("/api/images", { method: "POST", body: uploadForm });
        if (!uploadRes.ok) throw new Error("Не вдалося завантажити файли");
        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media || [];
      }

      const allCategoryIds = Array.from(new Set(selectedCategoryIds));
      const allSubcategoryIds = Array.from(new Set(selectedSubcategoryIds));
      const primaryCategoryId = allCategoryIds[0] ?? null;
      const primarySubcategoryId = allSubcategoryIds[0] ?? null;

      const colors = colorRows
        .filter((r) => r.name.trim() && r.hex.trim())
        .map((r) => ({ hex: r.hex.trim(), name: r.name.trim() }));

      const pid =
        productId != null && !Array.isArray(productId) ? Number(productId) : NaN;
      const seenSize = new Set<number>();
      let sizeGroupPayload: number[] = [];
      for (const x of sizeGroupOrderedIds) {
        const id = Number(x);
        if (!Number.isInteger(id) || id <= 0 || seenSize.has(id)) continue;
        seenSize.add(id);
        sizeGroupPayload.push(id);
      }
      if (Number.isInteger(pid)) {
        if (!sizeGroupPayload.includes(pid)) sizeGroupPayload.unshift(pid);
      }

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
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
          size_group_ordered_ids:
            Number.isInteger(pid) && sizeGroupPayload.length > 0
              ? sizeGroupPayload
              : undefined,
          category_id: primaryCategoryId,
          subcategory_id: primarySubcategoryId,
          media: [...existingMedia, ...uploadedMedia],
          category_ids: allCategoryIds,
          subcategory_ids: allSubcategoryIds,
          color_options: serializeColorOptions(colors),
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
          fabric_composition: null,
          has_lining: false,
          lining_description: null,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Не вдалося оновити");
      }

      setSuccess("Товар успішно оновлено!");
      setNewMediaFiles([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      <AdminProductsBackLink />
      <PageBreadcrumb pageTitle="Редагувати товар" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf"
        className="hidden"
        onChange={handleAddFromFile}
      />

      {loadingData ? (
        <div className="mt-4 space-y-4" aria-busy="true">
          <div className="h-12 w-48 animate-pulse rounded-xl bg-gray-100" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-96 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      ) : (
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
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
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

              {productId != null && !Array.isArray(productId) && Number.isInteger(Number(productId)) ? (
                <ComponentCard title="Пов'язані розміри (одна сторінка)">
                  <SizeGroupPicker
                    currentProductId={Number(productId)}
                    value={sizeGroupOrderedIds}
                    onChange={setSizeGroupOrderedIds}
                    editedProductPreview={{
                      name,
                      subtitle,
                      priceDisplay: formatAdminProductPrice(
                        Number(price) || 0,
                        discountPercentage ? Number(discountPercentage) : null
                      ),
                    }}
                  />
                </ComponentCard>
              ) : null}

              <ComponentCard title="Рекомендації">
                <BoughtTogetherPicker
                  value={boughtTogetherIds}
                  onChange={setBoughtTogetherIds}
                  excludeProductId={
                    productId != null && !Array.isArray(productId) ? Number(productId) : undefined
                  }
                />
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
                                setSelectedSubcategoryIds((p) =>
                                  p.filter((sid) => !subs.some((s) => s.id === sid))
                                );
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
                <div className="mt-4 flex flex-wrap gap-3">
                  {existingMedia.map((media, i) => {
                    const isVideo = media.type === "video";
                    return (
                      <div key={`ex-${media.url}-${i}`} className="relative inline-block">
                        {isVideo ? (
                          <video
                            src={`/api/images/${media.url}`}
                            width={160}
                            height={160}
                            className="rounded object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <Image
                            src={`/api/images/${media.url}`}
                            alt=""
                            width={160}
                            height={160}
                            className="rounded object-cover"
                            unoptimized
                          />
                        )}
                        <button
                          type="button"
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                          onClick={() => removeExistingMedia(i)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {newMediaFiles.map((media, i) => (
                    <div key={`new-${i}`} className="relative inline-block">
                      {media.type === "video" ? (
                        <video
                          src={media.preview}
                          width={160}
                          height={160}
                          className="rounded object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <Image
                          src={media.preview}
                          alt=""
                          width={160}
                          height={160}
                          className="rounded object-cover"
                          unoptimized
                        />
                      )}
                      <button
                        type="button"
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                        onClick={() => removeNewMedia(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
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
              {loading ? "Збереження…" : "Зберегти зміни"}
            </button>
          </div>
          {success && <p className="text-center text-green-600">{success}</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
