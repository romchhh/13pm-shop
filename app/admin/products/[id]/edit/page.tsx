"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminProductsBackLink from "@/components/admin/AdminProductsBackLink";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ApparelProductEditor from "@/components/admin/apparel/ApparelProductEditor";
import {
  apparelFormFromProduct,
  type ApparelProductApiBody,
  type ApparelProductFormValues,
} from "@/lib/apparelProduct";

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id != null && !Array.isArray(params.id) ? Number(params.id) : NaN;

  const [initialValues, setInitialValues] = useState<ApparelProductFormValues | null>(null);
  const [initialMedia, setInitialMedia] = useState<{ url: string; type: string }[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setLoadError("Невірний ID товару");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Не вдалося завантажити товар");
        const data = await res.json();
        if (cancelled) return;

        const media = Array.isArray(data.media) ? data.media : [];
        setInitialMedia(
          media.map((item: { url: string; type: string }) => ({
            url: item.url,
            type: item.type,
          }))
        );
        setInitialValues(apparelFormFromProduct(data));
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Помилка завантаження");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleSubmit = async (body: ApparelProductApiBody) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || "Не вдалося зберегти");
    }
  };

  if (loadError) {
    return (
      <div className="min-w-0">
        <AdminProductsBackLink />
        <PageBreadcrumb pageTitle="Редагувати товар" />
        <p className="text-center text-red-600">{loadError}</p>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="min-w-0">
        <AdminProductsBackLink />
        <PageBreadcrumb pageTitle="Редагувати товар" />
        <p className="text-center text-gray-500">Завантаження…</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <AdminProductsBackLink />
      <PageBreadcrumb pageTitle="Редагувати товар" />
      <ApparelProductEditor
        mode="edit"
        productId={productId}
        initialValues={initialValues}
        initialMedia={initialMedia}
        submitLabel="Зберегти зміни"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
