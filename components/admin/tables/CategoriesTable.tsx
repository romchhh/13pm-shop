"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      alert("Введіть назву категорії");
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      if (!res.ok) throw new Error("Failed to create category");
      
      const newCategory = await res.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Помилка при створенні категорії");
    }
  }

  async function handleUpdateCategory(id: number, name: string) {
    if (!name.trim()) {
      alert("Введіть назву категорії");
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update category");

      const updatedCategory = await res.json();
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Помилка при оновленні категорії");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Ви впевнені, що хочете видалити цю категорію?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete category");

      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Помилка при видаленні категорії");
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Категорії
            </h2>
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-block rounded-md bg-green-400 px-4 py-2 text-white text-sm hover:bg-green-600 transition"
            >
              + Додати категорію
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  ID
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
                  Дії
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {/* Add new category row */}
              {isAddingNew && (
                <TableRow className="bg-green-50 dark:bg-green-900/10">
                  <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                    —
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleAddCategory();
                        if (e.key === "Escape") {
                          setIsAddingNew(false);
                          setNewCategoryName("");
                        }
                      }}
                      placeholder="Введіть назву категорії"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                  </TableCell>
                  <TableCell className="px-5 py-4 space-x-2">
                    <button
                      onClick={handleAddCategory}
                      className="inline-block rounded-md bg-green-500 px-3 py-1 text-white text-sm hover:bg-green-600 transition"
                    >
                      Зберегти
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewCategoryName("");
                      }}
                      className="inline-block rounded-md bg-gray-400 px-3 py-1 text-white text-sm hover:bg-gray-600 transition"
                    >
                      Скасувати
                    </button>
                  </TableCell>
                </TableRow>
              )}

              {/* Loading state */}
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Категорій не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {category.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter")
                              handleUpdateCategory(category.id, editingName);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">
                          {category.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateCategory(category.id, editingName)
                            }
                            className="inline-block rounded-md bg-blue-500 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                          >
                            Зберегти
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="inline-block rounded-md bg-gray-400 px-3 py-1 text-white text-sm hover:bg-gray-600 transition"
                          >
                            Скасувати
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            // onClick={() => startEditing(category)}
                            href={`/admin/categories/${category.id}`}
                            className="inline-block rounded-md bg-blue-400 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                          >
                            Редагувати
                          </Link>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="inline-block rounded-md bg-red-400 px-3 py-1 text-white text-sm hover:bg-red-600 transition"
                          >
                            Видалити
                          </button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

