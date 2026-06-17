"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import Image from "next/image";
import Pagination from "./Pagination";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { buildColorLinkGroupLabels } from "@/lib/colorLinkGroups";
import { buildSizeGroupLabels } from "@/lib/sizeGroupLabels";
import { compareByCatalogPriority, CATALOG_PRIORITY_HINT } from "@/lib/catalogPriority";
import AdminPriorityCell from "@/components/admin/AdminPriorityCell";

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
  priority?: number;
  created_at: Date;
  sizes: { size: string }[];
  top_sale?: boolean;
  limited_edition?: boolean;
  category_name?: string;
  category_ids?: number[];
  color: string;
  first_media?: { url: string; type: string } | null;
  size_variants?: unknown;
  pair_together_ids?: number[];
}

interface CategoryOption {
  id: number;
  name: string;
}

function parsePageParam(value: string | null): number {
  const n = parseInt(value || "1", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function parseCategoryParam(value: string | null): number | null {
  if (!value || value === "all") return null;
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function productMatchesCategory(
  product: Product,
  categoryId: number | null,
  categoriesById: Map<number, string>
): boolean {
  if (categoryId === null) return true;
  const ids = product.category_ids ?? [];
  if (ids.includes(categoryId)) return true;
  const catName = categoriesById.get(categoryId);
  if (catName && product.category_name === catName) return true;
  return false;
}

export default function ProductsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  const productsPerPage = 10;

  const categoryFromUrl = parseCategoryParam(searchParams.get("category"));
  const pageFromUrl = parsePageParam(searchParams.get("page"));

  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(categoryFromUrl);
  const [filterPage, setFilterPage] = useState(pageFromUrl);

  useEffect(() => {
    setFilterCategoryId(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setFilterPage(pageFromUrl);
  }, [pageFromUrl]);

  const updateListUrl = useCallback(
    (page: number, categoryId: number | null) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", String(page));
      if (categoryId != null) params.set("category", String(categoryId));
      const q = params.toString();
      const href = q ? `${pathname}?${q}` : pathname;
      router.replace(href, { scroll: false });
    },
    [pathname, router]
  );

  const handleCategoryChange = (value: string) => {
    const categoryId =
      value === "all"
        ? null
        : (() => {
            const n = parseInt(value, 10);
            return Number.isFinite(n) && n > 0 ? n : null;
          })();
    setFilterCategoryId(categoryId);
    setFilterPage(1);
    updateListUrl(1, categoryId);
  };

  const handlePageChange = (page: number) => {
    setFilterPage(page);
    updateListUrl(page, filterCategoryId);
  };

  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filteredProducts = useMemo(
    () =>
      products
        .filter((p) =>
          productMatchesCategory(p, filterCategoryId, categoriesById)
        )
        .sort(compareByCatalogPriority),
    [products, filterCategoryId, categoriesById]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / productsPerPage)),
    [filteredProducts.length, productsPerPage]
  );

  const paginatedProducts = useMemo(
    () =>
      filteredProducts.slice(
        (filterPage - 1) * productsPerPage,
        filterPage * productsPerPage
      ),
    [filteredProducts, filterPage, productsPerPage]
  );

  const sizeGroupLabelById = useMemo(
    () =>
      buildSizeGroupLabels(
        products.map((p) => ({ id: p.id, size_variants: p.size_variants }))
      ),
    [products]
  );

  const colorLinkGroupLabelById = useMemo(
    () =>
      buildColorLinkGroupLabels(
        products.map((p) => ({ id: p.id, pair_together_ids: p.pair_together_ids }))
      ),
    [products]
  );

  useEffect(() => {
    if (filterPage > totalPages) {
      const nextPage = totalPages;
      setFilterPage(nextPage);
      updateListUrl(nextPage, filterCategoryId);
    }
  }, [filterPage, totalPages, filterCategoryId, updateListUrl]);

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
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || "Не вдалося видалити товар";
        alert(errorMessage);
        return;
      }

      // Оновлюємо стан
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);

      // Оновлюємо кеш
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(
        CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_DURATION).toString()
      );
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Помилка при видаленні товару. Спробуйте ще раз.");
    }
  }

  function handlePrioritySaved(productId: number, priority: number) {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.id === productId ? { ...p, priority } : p
      );
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      localStorage.setItem(
        CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_DURATION).toString()
      );
      return updated;
    });
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);
        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const data = await productsRes.json();
        setProducts(data);
        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(
          CACHE_EXPIRY_KEY,
          (now + CACHE_DURATION).toString()
        );
        if (categoriesRes.ok) {
          const cats: CategoryOption[] = await categoriesRes.json();
          setCategories(cats);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const returnTo = useMemo(() => {
    const params = new URLSearchParams();
    if (filterPage > 1) params.set("page", String(filterPage));
    if (filterCategoryId != null) params.set("category", String(filterCategoryId));
    const q = params.toString();
    return q ? `${pathname}?${q}` : pathname;
  }, [filterPage, filterCategoryId, pathname]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Продукти</h2>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium whitespace-nowrap">Категорія:</span>
                <select
                  value={
                    filterCategoryId != null ? String(filterCategoryId) : "all"
                  }
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="min-w-[180px] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">Усі категорії</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              {filterCategoryId != null && (
                <span className="text-sm text-gray-500">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "товар" : "товарів"}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCache}
                className="inline-block rounded-md bg-gray-500 px-4 py-2 text-white text-sm font-medium hover:bg-gray-600 transition shadow-sm"
                title="Очистити кеш та перезавантажити дані"
              >
                🔄 Оновити
              </button>
              <Link
                href={`/admin/products/add?return=${encodeURIComponent(returnTo)}`}
                className="inline-block rounded-md bg-green-500 px-4 py-2 text-white text-sm font-medium hover:bg-green-600 transition shadow-sm"
              >
                + Додати продукт
              </Link>
            </div>
          </div>
          <p className="border-b border-gray-200 bg-gray-50 px-5 pb-3 text-xs text-gray-500">
            {CATALOG_PRIORITY_HINT}
          </p>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Фото
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Назва
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Пріоритет
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Опис
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Ціна
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Розміри
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Група розмірів
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Група кольорів
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Категорія
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Колір
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Бестселлер
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Створено
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="text-center py-6 text-gray-600"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="text-center py-6 text-gray-600"
                  >
                    {filterCategoryId != null
                      ? "У цій категорії товарів не знайдено."
                      : "Продуктів не знайдено."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      {product.first_media ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={getProductImageSrc(product.first_media)}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-900 font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <AdminPriorityCell
                        value={product.priority ?? 0}
                        entityType="product"
                        entityId={product.id}
                        onSaved={(priority) => handlePrioritySaved(product.id, priority)}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 max-w-[360px]">
                      {(product.description || "").length > 20
                        ? `${product.description.slice(0, 20)}…`
                        : product.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 font-medium">
                      {product.price} ₴
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.sizes && product.sizes.length > 0
                        ? product.sizes
                            .map((s) => SIZE_MAP[s.size] || s.size)
                            .join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {sizeGroupLabelById.get(product.id) ? (
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200/80">
                          {sizeGroupLabelById.get(product.id)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {colorLinkGroupLabelById.get(product.id) ? (
                        <span className="inline-block rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
                          {colorLinkGroupLabelById.get(product.id)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.category_name || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.color || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {product.top_sale ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <Link
                        href={`/admin/products/${product.id}/edit?return=${encodeURIComponent(returnTo)}`}
                        scroll={false}
                        className="inline-block rounded-md bg-blue-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-blue-600 transition shadow-sm"
                      >
                        Редагувати
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-block rounded-md bg-red-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-red-600 transition shadow-sm"
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
          {!loading && filteredProducts.length > productsPerPage && (
            <div className="flex justify-end px-5 py-4 border-t border-gray-200 bg-gray-50">
              <Pagination
                currentPage={filterPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
