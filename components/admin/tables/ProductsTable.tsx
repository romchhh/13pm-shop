"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import Pagination from "./Pagination";
import { getProductImageSrc } from "@/lib/getFirstProductImage";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

const CACHE_KEY = "products_cache";
const CACHE_EXPIRY_KEY = "products_cache_expiry";
const CACHE_DURATION = 5 * 60 * 1000; // 5 хвилин

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: Date;
  sizes: { size: string }[];
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string;
  category_name?: string;
  color: string
  media?: { type: string; url: string }[];
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const totalPages = useMemo(() => 
    Math.ceil(products.length / productsPerPage), 
    [products.length]
  );

  const paginatedProducts = useMemo(() => 
    products.slice(
      (currentPage - 1) * productsPerPage,
      currentPage * productsPerPage
    ),
    [products, currentPage, productsPerPage]
  );

  // Reset to first page if orders are changed (e.g., after deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [products, currentPage, totalPages]);

  // Функція для очищення кешу
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    setLoading(true);
    window.location.reload();
  };

  async function handleDelete(productId: number) {
    if (!confirm("Ви впевнені, що хочете видалити цей продукт?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      
      // Оновлюємо стан
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      
      // Оновлюємо кеш
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Перевірка кешу
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        const now = Date.now();

        if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
          // Використовуємо кешовані дані
          console.log("Використання кешованих даних продуктів");
          setProducts(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Якщо кеш застарів або відсутній, завантажуємо з сервера
        console.log("Завантаження продуктів з сервера");
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        
        setProducts(data);
        
        // Зберігаємо в кеш
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_EXPIRY_KEY, (now + CACHE_DURATION).toString());
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Продукти
            </h2>
            <div className="flex gap-2">
              <button
                onClick={clearCache}
                className="inline-block rounded-md bg-gray-400 px-4 py-2 text-white text-sm hover:bg-gray-600 transition"
                title="Очистити кеш та перезавантажити дані"
              >
                🔄 Оновити
              </button>
              <Link
                href="/admin/products/add"
                className="inline-block rounded-md bg-green-400 px-4 py-2 text-white text-sm hover:bg-green-600 transition"
              >
                + Додати продукт
              </Link>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Фото
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Назва
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Опис
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Ціна
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Розміри
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Категорія
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Сезон
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Колір
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Топ продаж?
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Лімітована серія?
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Створено
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Продуктів не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4">
                      {product.media && product.media.length > 0 ? (
                        <img
                          src={getProductImageSrc(product.media)}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-xs text-gray-400">—</span>';
                            }
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {product.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[360px]">
                      {(product.description || "").length > 20
                        ? `${product.description.slice(0, 20)}…`
                        : product.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.price} ₴
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.sizes && product.sizes.length > 0
                        ? product.sizes
                            .map((s) => SIZE_MAP[s.size] || s.size)
                            .join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.category_name || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {Array.isArray(product.season)
                        ? product.season.length > 0
                          ? product.season.join(", ")
                          : "—"
                        : product.season || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.color || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.top_sale ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.limited_edition ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-block rounded-md bg-blue-400 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                      >
                        Редагувати
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-block rounded-md bg-red-400 px-3 py-1 text-white text-sm hover:bg-red-600 transition"
                      >
                        Видалити
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && products.length > productsPerPage && (
            <div className="flex justify-end px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
