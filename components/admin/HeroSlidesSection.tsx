"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import ComponentCard from "./ComponentCard";
import HeroImageDropzone from "./HeroImageDropzone";
import Input from "./form/input/InputField";
import Label from "./form/Label";
import TextArea from "./form/input/TextArea";
import { resolveHeroImageSrc } from "@/lib/heroSlides.shared";

interface HeroSlideRow {
  id: number;
  title: string;
  subtitle: string | null;
  desktopImageUrl: string;
  mobileImageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = {
  title: "",
  subtitle: "",
  desktopImageUrl: "",
  mobileImageUrl: "",
  sortOrder: "0",
  isActive: true,
};

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("images", file);
  const res = await fetch("/api/images", { method: "POST", body: form });
  if (!res.ok) throw new Error("Помилка завантаження");
  const data = await res.json();
  const url = data.media?.[0]?.url;
  if (!url) throw new Error("Файл не збережено");
  return url;
}

export default function HeroSlidesSection() {
  const [list, setList] = useState<HeroSlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hero-slides");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview(null);
    setMobilePreview(null);
  };

  const startEdit = (row: HeroSlideRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      subtitle: row.subtitle ?? "",
      desktopImageUrl: row.desktopImageUrl,
      mobileImageUrl: row.mobileImageUrl,
      sortOrder: String(row.sortOrder),
      isActive: row.isActive,
    });
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview(resolveHeroImageSrc(row.desktopImageUrl));
    setMobilePreview(resolveHeroImageSrc(row.mobileImageUrl));
    setMessage(null);
  };

  const onFileChange = (kind: "desktop" | "mobile", file: File | null) => {
    if (kind === "desktop") {
      setDesktopFile(file);
      if (file) {
        setDesktopPreview(URL.createObjectURL(file));
      } else if (form.desktopImageUrl) {
        setDesktopPreview(resolveHeroImageSrc(form.desktopImageUrl));
      } else {
        setDesktopPreview(null);
      }
    } else {
      setMobileFile(file);
      if (file) {
        setMobilePreview(URL.createObjectURL(file));
      } else if (form.mobileImageUrl) {
        setMobilePreview(resolveHeroImageSrc(form.mobileImageUrl));
      } else {
        setMobilePreview(null);
      }
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Введіть заголовок" });
      return;
    }

    setSubmitting(true);
    try {
      let desktopUrl = form.desktopImageUrl;
      let mobileUrl = form.mobileImageUrl;

      if (desktopFile) desktopUrl = await uploadImage(desktopFile);
      if (mobileFile) mobileUrl = await uploadImage(mobileFile);

      if (!desktopUrl || !mobileUrl) {
        setMessage({
          type: "error",
          text: "Завантажте фото для десктопу та мобільної версії",
        });
        return;
      }

      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        desktopImageUrl: desktopUrl,
        mobileImageUrl: mobileUrl,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
        isActive: form.isActive,
      };

      const res = await fetch(
        editingId ? `/api/admin/hero-slides/${editingId}` : "/api/admin/hero-slides",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Помилка збереження" });
        return;
      }

      setMessage({
        type: "success",
        text: editingId ? "Слайд оновлено" : "Слайд додано",
      });
      resetForm();
      fetchList();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Помилка мережі",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Видалити цей слайд?")) return;
    try {
      const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      if (editingId === id) resetForm();
      fetchList();
      setMessage({ type: "success", text: "Слайд видалено" });
    } catch {
      setMessage({ type: "error", text: "Не вдалося видалити" });
    }
  }

  return (
    <div className="space-y-6">
      <ComponentCard title={editingId ? "Редагувати слайд Hero" : "Новий слайд Hero"}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <p
              className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
            >
              {message.text}
            </p>
          )}

          <div>
            <Label>Заголовок</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Заголовок на банері"
            />
          </div>

          <div>
            <Label>Підзаголовок</Label>
            <TextArea
              value={form.subtitle}
              onChange={(value) => setForm((p) => ({ ...p, subtitle: value }))}
              rows={3}
              placeholder="Короткий опис під заголовком"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <HeroImageDropzone
              label="Фото — десктоп (широкий банер)"
              hint="JPG, PNG, WebP або HEIC, до 15 МБ"
              previewUrl={desktopPreview}
              aspectClassName="aspect-[16/9] max-w-md"
              onFile={(file) => onFileChange("desktop", file)}
            />
            <HeroImageDropzone
              label="Фото — мобільна версія"
              hint="Вертикальне зображення для телефону"
              previewUrl={mobilePreview}
              aspectClassName="aspect-[3/4] max-w-[220px]"
              onFile={(file) => onFileChange("mobile", file)}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="w-32">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 pt-8 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Активний (показувати на сайті)
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#8B5E3F] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Збереження…" : editingId ? "Зберегти зміни" : "Додати слайд"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm hover:bg-gray-50"
              >
                Скасувати
              </button>
            )}
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Слайди на головній">
        <p className="mb-4 text-sm text-gray-500">
          На сайті слайди перемикаються автоматично кожні 5 секунд. Окремі зображення для
          комп&apos;ютера та телефону.
        </p>
        {loading ? (
          <p className="text-sm text-gray-500">Завантаження…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500">Немає слайдів — додайте перший вище.</p>
        ) : (
          <ul className="space-y-4">
            {list.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex gap-3 shrink-0">
                  <div className="relative h-16 w-28 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={resolveHeroImageSrc(row.desktopImageUrl)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                  <div className="relative h-16 w-12 overflow-hidden rounded-md bg-gray-100">
                    <Image
                      src={resolveHeroImageSrc(row.mobileImageUrl)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 line-clamp-1">{row.title}</p>
                  <p className="text-xs text-gray-500">
                    Порядок: {row.sortOrder} · {row.isActive ? "активний" : "прихований"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(row)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Редагувати
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Видалити
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ComponentCard>
    </div>
  );
}
