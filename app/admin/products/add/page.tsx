"use client";

import AdminProductsBackLink from "@/components/admin/AdminProductsBackLink";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ApparelProductEditor from "@/components/admin/apparel/ApparelProductEditor";
import type { ApparelProductApiBody } from "@/lib/apparelProduct";

export default function AddProductPage() {
  const handleSubmit = async (body: ApparelProductApiBody) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || "Не вдалося створити товар");
    }
  };

  return (
    <div className="min-w-0">
      <AdminProductsBackLink />
      <PageBreadcrumb pageTitle="Додати товар" />
      <ApparelProductEditor mode="create" submitLabel="Створити товар" onSubmit={handleSubmit} />
    </div>
  );
}
