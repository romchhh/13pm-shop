import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ProductsTable from "@/components/admin/tables/ProductsTable";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Next.js Basic Table | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Таблиця Продуктів" />
      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="rounded-xl border border-gray-300 bg-white px-5 py-8 text-center text-gray-600">
              Завантаження таблиці…
            </div>
          }
        >
          <ProductsTable />
        </Suspense>
      </div>
    </div>
  );
}
