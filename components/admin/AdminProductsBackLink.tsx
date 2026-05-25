"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function BackLinkInner() {
  const searchParams = useSearchParams();
  const returnParam = searchParams.get("return");
  const href =
    returnParam?.startsWith("/admin/products") ? returnParam : "/admin/products";

  return (
    <Link
      href={href}
      className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
    >
      <span aria-hidden>←</span>
      До списку товарів
    </Link>
  );
}

export default function AdminProductsBackLink() {
  return (
    <Suspense fallback={null}>
      <BackLinkInner />
    </Suspense>
  );
}
