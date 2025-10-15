"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";

type Subcategory = {
  id?: number;
  name: string;
};

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = Number(params?.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deletedSubcategoryIds, setDeletedSubcategoryIds] = useState<number[]>(
    []
  );

  const [formData, setFormData] = useState({
    name: "",
    subcategories: [] as Subcategory[],
  });

  // Fetch category + its subcategories
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [categoryRes, subcategoriesRes] = await Promise.all([
          fetch(`/api/categories/${categoryId}`),
          fetch(`/api/subcategories?parent_category_id=${categoryId}`),
        ]);

        if (!categoryRes.ok || !subcategoriesRes.ok)
          throw new Error("Failed to fetch data");

        const category = await categoryRes.json();
        const subcategories = await subcategoriesRes.json();

        setFormData({
          name: category.name,
          subcategories: subcategories || [],
        });
      } catch (err) {
        console.error(err);
        setError("Помилка при завантаженні категорії");
      } finally {
        setLoadingData(false);
      }
    }

    if (!isNaN(categoryId)) fetchData();
  }, [categoryId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubcategoryNameChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newSubs = [...prev.subcategories];
      newSubs[index] = { ...newSubs[index], name: value };
      return { ...prev, subcategories: newSubs };
    });
  };

  const handleAddSubcategory = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, { name: "" }],
    }));
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData((prev) => {
      const subToRemove = prev.subcategories[index];
      const updated = [...prev.subcategories];
      updated.splice(index, 1);

      if (subToRemove.id) {
        // Track it for deletion
        setDeletedSubcategoryIds((prevIds) => [...prevIds, subToRemove.id!]);
        console.log(deletedSubcategoryIds);
      }

      return { ...prev, subcategories: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const { name, subcategories } = formData;

      if (!name.trim()) {
        setError("Назва категорії не може бути порожньою");
        setLoading(false);
        return;
      }

      // Update category name
      const categoryRes = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!categoryRes.ok) throw new Error("Failed to update category");

      // Delete subcategories
      for (const subId of deletedSubcategoryIds) {
        await fetch(`/api/subcategories/${subId}`, {
          method: "DELETE",
        });
      }

      for (const sub of subcategories) {
        const trimmedName = sub.name.trim();
        if (!trimmedName) continue;

        if (sub.id) {
          // Existing subcategory → update
          await fetch(`/api/subcategories/${sub.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              parent_category_id: categoryId, // ✅ add this
            }),
          });
        } else {
          // New subcategory → create
          await fetch(`/api/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              parent_category_id: categoryId, // ✅ add this
            }),
          });
        }
      }

      setSuccess("Категорію успішно оновлено");
      router.push("/admin/categories");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити категорію");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loadingData ? (
        <div className="p-4 text-center text-lg">Завантаження...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PageBreadcrumb pageTitle="Редагувати Категорію" />

          <div className="max-w-2xl mx-auto p-4">
            <ComponentCard title="Редагування Категорії">
              <Label>Назва категорії</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <Label className="mt-6">Підкатегорії</Label>
              {formData.subcategories.map((sub, index) => (
                <div
                  key={sub.id ?? `new-${index}`}
                  className="flex items-center gap-2 mb-2"
                >
                  <Input
                    type="text"
                    value={sub.name}
                    onChange={(e) =>
                      handleSubcategoryNameChange(index, e.target.value)
                    }
                    placeholder="Назва підкатегорії"
                  />
                  <button
                    type="button"
                    className="text-red-600 font-bold px-2"
                    onClick={() => handleRemoveSubcategory(index)}
                    title="Видалити"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddSubcategory}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
              >
                Додати підкатегорію
              </button>
            </ComponentCard>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded"
                disabled={loading}
              >
                {loading ? "Збереження..." : "Зберегти"}
              </button>
            </div>

            {success && (
              <div className="text-green-600 text-center mt-4">{success}</div>
            )}
            {error && (
              <div className="text-red-600 text-center mt-4">{error}</div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
