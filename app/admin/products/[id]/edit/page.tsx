"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";

const multiOptions = [
  { value: "ONESIZE", text: "ONESIZE", selected: false },
  { value: "XL", text: "XL", selected: false },
  { value: "L", text: "L", selected: false },
  { value: "M", text: "M", selected: false },
  { value: "S", text: "S", selected: false },
  { value: "XS", text: "XS", selected: false },
];

const seasonOptions = [
  { value: "Літо", text: "Літо", selected: false },
  { value: "Весна", text: "Весна", selected: false },
  { value: "Зима", text: "Зима", selected: false },
  { value: "Осінь", text: "Осінь", selected: false },
];

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    discountPercentage: "",
    priority: "0",
    sizes: [] as string[],
    media: [] as { type: string; url: string }[],
    topSale: false,
    limitedEdition: false,
    season: [] as string[],
    color: "",
    categoryId: null as number | null,
    subcategoryId: null as number | null,
    fabricComposition: "",
    hasLining: false,
    liningDescription: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<
    { id: number; name: string; category_id: number }[]
  >([]);

  const [availableColors, setAvailableColors] = useState<
    { color: string; hex?: string }[]
  >([]);
  const [customColorLabel, setCustomColorLabel] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [colors, setColors] = useState<{ label: string; hex?: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/categories`),
        ]);

        const productData = await productRes.json();
        const categoryData = await categoriesRes.json();

        setFormData({
          name: productData.name,
          description: productData.description,
          price: String(productData.price),
          oldPrice: String(productData.old_price || ""),
          discountPercentage: String(productData.discount_percentage || ""),
          priority: String(productData.priority || 0),
          sizes: productData.sizes.map((s: { size: string }) => s.size),
          media: productData.media,
          topSale: productData.top_sale,
          limitedEdition: productData.limited_edition,
          season: productData.season,
          color: productData.color,
          categoryId: productData.category_id,
          subcategoryId: productData.subcategory_id || null,
          fabricComposition: productData.fabric_composition || "",
          hasLining: productData.has_lining || false,
          liningDescription: productData.lining_description || "",
        });

        setCategoryOptions(categoryData);
        setColors(productData.colors || []);
      } catch (err) {
        console.error("Failed to fetch product or categories", err);
        setError("Помилка при завантаженні товару або категорій");
      } finally {
        setLoadingData(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch("/api/colors");
        const data = await res.json();
        setAvailableColors(data);
      } catch (error) {
        console.error("Failed to fetch colors", error);
      }
    }

    fetchColors();
  }, []);

  useEffect(() => {
    async function fetchSubcategories() {
      if (!formData.categoryId) {
        setSubcategoryOptions([]); // Clear if no category selected
        return;
      }

      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${formData.categoryId}`
        );
        if (!res.ok) throw new Error("Failed to fetch subcategories");

        const data = await res.json();
        setSubcategoryOptions(data);
      } catch (error) {
        console.error("Error fetching subcategories", error);
      }
    }

    fetchSubcategories();
  }, [formData.categoryId]);

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  const handleDrop = (files: File[]) => {
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleDeleteNewImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];

      if (images.length > 0) {
        const uploadForm = new FormData();
        images.forEach((img) => uploadForm.append("images", img));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media;
      }

      const updatedMedia = [...formData.media, ...uploadedMedia];

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          old_price: formData.oldPrice ? Number(formData.oldPrice) : null,
          discount_percentage: formData.discountPercentage
            ? Number(formData.discountPercentage)
            : null,
          priority: Number(formData.priority),
          sizes: formData.sizes,
          media: updatedMedia,
          top_sale: formData.topSale,
          limited_edition: formData.limitedEdition,
          season: formData.season,
          color: formData.color,
          colors,
          category_id: formData.categoryId,
          subcategory_id: formData.subcategoryId,
          fabric_composition: formData.fabricComposition,
          has_lining: formData.hasLining,
          lining_description: formData.liningDescription,
        }),
      });

      if (!res.ok) throw new Error("Failed to update product");

      setSuccess("Товар успішно оновлено");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити товар");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loadingData ? (
        <div className="p-4 text-center text-lg">Завантаження даних...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PageBreadcrumb pageTitle="Редагувати Товар" />
          <div className="flex w-full h-auto">
            <div className="w-1/2 p-4">
              <ComponentCard title="Редагувати дані">
                <Label>Назва Товару</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />

                <Label>Опис</Label>
                <TextArea
                  value={formData.description}
                  onChange={(value) => handleChange("description", value)}
                  rows={6}
                />

                <Label>Ціна</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="Поточна ціна"
                />

                <Label>Стара ціна (опціонально)</Label>
                <Input
                  type="number"
                  value={formData.oldPrice}
                  onChange={(e) => handleChange("oldPrice", e.target.value)}
                  placeholder="Ціна до знижки"
                />

                <Label>Відсоток знижки (опціонально)</Label>
                <Input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    handleChange("discountPercentage", e.target.value)
                  }
                  placeholder="Наприклад: 20"
                />

                <Label>Пріоритет показу</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  placeholder="0 - звичайний, 1 - високий"
                />

                <Label>Розміри</Label>
                <MultiSelect
                  label="Розміри"
                  options={multiOptions}
                  defaultSelected={formData.sizes}
                  onChange={(values) => handleChange("sizes", values)}
                />

                <Label>Категорія</Label>
                <select
                  value={formData.categoryId ?? ""}
                  onChange={(e) => {
                    const selectedCategoryId = Number(e.target.value);
                    handleChange("categoryId", selectedCategoryId);
                    handleChange("subcategoryId", null); // ✅ Reset subcategory
                  }}
                  className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Виберіть категорію</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {formData.categoryId && (
                  <>
                    <Label>Підкатегорія</Label>
                    <select
                      value={formData.subcategoryId ?? ""}
                      onChange={(e) =>
                        handleChange("subcategoryId", Number(e.target.value))
                      }
                      className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Виберіть підкатегорію</option>
                      {subcategoryOptions
                        .filter(
                          (sub) => sub.category_id === formData.categoryId
                        )
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                    </select>
                  </>
                )}

                <Label>Cезон</Label>
                <MultiSelect
                  label="Сезон"
                  options={seasonOptions}
                  defaultSelected={formData.season}
                  onChange={(values) => handleChange("season", values)}
                />

                <div className="space-y-2">
                  <Label>Кольори</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs"
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.hex || "#fff" }}
                        />
                        {c.label}
                        <button
                          type="button"
                          className="ml-1 text-red-600"
                          onClick={() =>
                            setColors(colors.filter((_, i) => i !== idx))
                          }
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Removed dropdown; using swatch list below */}
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((c) => (
                      <button
                        type="button"
                        key={`pal-${c.color}`}
                        className="flex items-center gap-2 border rounded-full px-2 py-1 text-xs hover:shadow transition"
                        onClick={() =>
                          setColors((prev) => [
                            ...prev,
                            { label: c.color, hex: c.hex },
                          ])
                        }
                        title={c.color}
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.hex || "#fff" }}
                        />
                        <span>{c.color}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-10 h-10 p-0 border rounded"
                    />
                    <Input
                      type="text"
                      value={customColorLabel}
                      onChange={(e) => setCustomColorLabel(e.target.value)}
                      placeholder="Назва кольору"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customColorLabel.trim()) return;
                        setColors([
                          ...colors,
                          {
                            label: customColorLabel.trim(),
                            hex: customColorHex,
                          },
                        ]);
                        setCustomColorLabel("");
                        setCustomColorHex("#000000");
                      }}
                      className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
                    >
                      Додати власний
                    </button>
                  </div>
                </div>

                {/* Блок: Склад тканини і Підкладка */}
                <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50 mt-4">
                  <div>
                    <Label>Склад тканини</Label>
                    <TextArea
                      value={formData.fabricComposition}
                      onChange={(value) =>
                        handleChange("fabricComposition", value)
                      }
                      rows={3}
                      placeholder="Наприклад: 80% бавовна, 20% поліестер"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Підкладка?</Label>
                    <ToggleSwitch
                      enabled={formData.hasLining}
                      setEnabled={(value) => handleChange("hasLining", value)}
                      label="Has Lining"
                    />
                  </div>
                  {formData.hasLining && (
                  <div>
                    <Label>Опис підкладки</Label>
                    <TextArea
                      value={formData.liningDescription}
                      onChange={(value) =>
                        handleChange("liningDescription", value)
                      }
                      rows={2}
                      placeholder="Опис підкладки товару"
                    />
                  </div>
                )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Label className="mb-0">Топ продаж?</Label>
                  <ToggleSwitch
                    enabled={formData.topSale}
                    setEnabled={(value) => handleChange("topSale", value)}
                    label="Top Sale"
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Label className="mb-0">Лімітована серія?</Label>
                  <ToggleSwitch
                    enabled={formData.limitedEdition}
                    setEnabled={(value) =>
                      handleChange("limitedEdition", value)
                    }
                    label="Limited Edition"
                  />
                </div>
              </ComponentCard>
            </div>

            <div className="w-1/2 p-4">
              <DropzoneComponent onDrop={handleDrop} />
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {formData.media.map((item, i) => (
                  <div key={`existing-${i}`} className="relative inline-block">
                    {item.type === "video" ? (
                      <video
                        src={`/api/images/${item.url}`}
                        width={200}
                        height={200}
                        controls
                        className="rounded max-w-[200px] max-h-[200px]"
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        width={200}
                        height={200}
                        alt={`image-${i}`}
                        className="rounded"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {images.map((file, i) => {
                  const previewUrl = URL.createObjectURL(file);
                  const isVideo = file.type.startsWith("video/");
                  return (
                    <div key={`new-${i}`} className="relative inline-block">
                      {isVideo ? (
                        <video
                          src={previewUrl}
                          width={200}
                          height={200}
                          controls
                          className="rounded max-w-[200px] max-h-[200px]"
                          onLoadedData={() => URL.revokeObjectURL(previewUrl)}
                        />
                      ) : (
                        <Image
                          src={previewUrl}
                          alt={file.name}
                          width={200}
                          height={200}
                          className="rounded max-w-[200px] max-h-[200px]"
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteNewImage(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        title="Видалити"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти Зміни"}
            </button>

            {success && (
              <div className="text-green-600 text-center mt-2">{success}</div>
            )}
            {error && (
              <div className="text-red-600 text-center mt-2">{error}</div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
