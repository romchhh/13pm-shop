"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProductImageSrc } from "@/lib/getFirstProductImage";

type AnalyticsData = {
  ordersCount: number;
  totalSales: number;
  averageCheck: number;
  popularProducts: {
    productId: number | null;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
    slug: string | null;
    imageUrl: string | null;
  }[];
};

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString("uk-UA")} ₴`;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = (await res.json()) as AnalyticsData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Не вдалося завантажити аналітику");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Аналітика</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error ?? "Помилка завантаження"}
      </section>
    );
  }

  const metrics = [
    {
      label: "Кількість замовлень",
      value: data.ordersCount.toLocaleString("uk-UA"),
      hint: "Лише завершені (оплачені) замовлення",
    },
    {
      label: "Сума продажів",
      value: formatMoney(data.totalSales),
      hint: "Сума товарів у завершених замовленнях",
    },
    {
      label: "Середній чек",
      value: formatMoney(data.averageCheck),
      hint: "Сума продажів ÷ кількість замовлень",
    },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Аналітика</h2>
        <p className="mt-1 text-sm text-gray-500">
          Зведення лише по завершених (оплачених) замовленнях
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-gray-600">{m.label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{m.value}</p>
            <p className="mt-1 text-xs text-gray-400">{m.hint}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          <h3 className="font-semibold text-gray-900">Популярні товари</h3>
          <p className="text-sm text-gray-500">
            За кількістю проданих одиниць у завершених замовленнях
          </p>
        </div>

        {data.popularProducts.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">
            Ще немає даних про продажі
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.popularProducts.map((product, index) => {
              const href = product.productId
                ? `/admin/products/${product.productId}/edit`
                : null;
              const imageSrc = product.imageUrl
                ? getProductImageSrc({ url: product.imageUrl, type: "photo" })
                : null;

              const row = (
                <>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B5E3F]/10 text-sm font-semibold text-[#8B5E3F]">
                    {index + 1}
                  </span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        —
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {product.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.totalQuantity} шт. · {formatMoney(product.totalRevenue)}
                    </p>
                  </div>
                </>
              );

              return (
                <li key={`${product.productId ?? product.productName}-${index}`}>
                  {href ? (
                    <Link
                      href={href}
                      scroll={false}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 sm:px-6"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4 px-5 py-4 sm:px-6">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
