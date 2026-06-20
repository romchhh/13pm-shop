"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ComponentCard from "./ComponentCard";
import HeroImageDropzone from "./HeroImageDropzone";
import Input from "./form/input/InputField";
import Label from "./form/Label";
import TextArea from "./form/input/TextArea";
import {
  DEFAULT_HERO_SLIDES,
  resolveHeroImageSrc,
} from "@/lib/heroSlides.shared";

interface HeroSlideRow {
  id: number;
  title: string;
  subtitle: string | null;
  desktopImageUrl: string;
  mobileImageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

type HeroFormState = {
  title: string;
  subtitle: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

const HERO_FORM_ID = "hero-slide-form";

function defaultFormState(): HeroFormState {
  const slide = DEFAULT_HERO_SLIDES[0];
  return {
    title: slide.title,
    subtitle: slide.subtitle,
    desktopImageUrl: slide.desktopImage,
    mobileImageUrl: slide.mobileImage,
    sortOrder: "0",
    isActive: true,
  };
}

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

function formFromRow(row: HeroSlideRow): HeroFormState {
  return {
    title: row.title,
    subtitle: row.subtitle ?? "",
    desktopImageUrl: row.desktopImageUrl,
    mobileImageUrl: row.mobileImageUrl,
    sortOrder: String(row.sortOrder),
    isActive: row.isActive,
  };
}

export default function HeroSlidesSection() {
  const [list, setList] = useState<HeroSlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<HeroFormState>(defaultFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const formInitialized = useRef(false);

  const applyFormState = useCallback((nextForm: HeroFormState, id: number | null) => {
    setEditingId(id);
    setForm(nextForm);
    setDesktopFile(null);
    setMobileFile(null);
    setDesktopPreview(resolveHeroImageSrc(nextForm.desktopImageUrl));
    setMobilePreview(resolveHeroImageSrc(nextForm.mobileImageUrl));
    setMessage(null);
  }, []);

  const loadDefaultForm = useCallback(() => {
    applyFormState(defaultFormState(), null);
  }, [applyFormState]);

  const startEdit = useCallback(
    (row: HeroSlideRow) => {
      applyFormState(formFromRow(row), row.id);
    },
    [applyFormState]
  );

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hero-slides");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      return Array.isArray(data) ? (data as HeroSlideRow[]) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const slides = await fetchList();
      if (cancelled) return;
      setList(slides);
      setLoading(false);

      if (!formInitialized.current) {
        if (slides.length > 0) {
          const first =
            [...slides].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)[0] ??
            slides[0];
          applyFormState(formFromRow(first), first.id);
        } else {
          loadDefaultForm();
        }
        formInitialized.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyFormState, fetchList, loadDefaultForm]);

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

      const savedId = (data.id as number | undefined) ?? editingId;
      const nextForm: HeroFormState = {
        title: payload.title,
        subtitle: payload.subtitle,
        desktopImageUrl: desktopUrl,
        mobileImageUrl: mobileUrl,
        sortOrder: String(payload.sortOrder),
        isActive: payload.isActive,
      };

      applyFormState(nextForm, savedId ?? null);
      setMessage({ type: "success", text: "Hero збережено" });

      const slides = await fetchList();
      setList(slides);
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

      const slides = await fetchList();
      setList(slides);

      if (editingId === id) {
        if (slides.length > 0) {
          const first =
            [...slides].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)[0] ??
            slides[0];
          startEdit(first);
        } else {
          loadDefaultForm();
        }
      }

      setMessage({ type: "success", text: "Слайд видалено" });
    } catch {
      setMessage({ type: "error", text: "Не вдалося видалити" });
    }
  }

  return (
    <div className="space-y-6">
      <ComponentCard title="Налаштування Hero">
        <form id={HERO_FORM_ID} onSubmit={handleSubmit} className="space-y-5">
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
              label="Фото — комп'ютер (широкий банер)"
              hint="IMG_5342.PNG або власне фото · JPG, PNG, WebP, до 15 МБ"
              previewUrl={desktopPreview}
              aspectClassName="aspect-[16/9] max-w-md"
              onFile={(file) => onFileChange("desktop", file)}
            />
            <HeroImageDropzone
              label="Фото — мобільна версія"
              hint="IMG_5273.PNG або власне фото · вертикальне зображення"
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
        </form>

        <div className="sticky bottom-0 z-10 -mx-6 mt-6 border-t border-gray-200 bg-white/95 px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              {editingId ? `Редагування слайду #${editingId}` : "Новий слайд Hero"}
            </p>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    const row = list.find((item) => item.id === editingId);
                    if (row) startEdit(row);
                    else loadDefaultForm();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm hover:bg-gray-50"
                >
                  Скинути зміни
                </button>
              )}
              <button
                type="submit"
                form={HERO_FORM_ID}
                disabled={submitting}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-[var(--site-accent)] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <path d="M17 21v-8H7v8" />
                  <path d="M7 3v5h8" />
                </svg>
                {submitting ? "Збереження…" : "Зберегти"}
              </button>
            </div>
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Інші слайди">
        <p className="mb-4 text-sm text-gray-500">
          На сайті слайди перемикаються автоматично кожні 5 секунд. Окремі зображення для
          комп&apos;ютера та телефону.
        </p>
        {loading ? (
          <p className="text-sm text-gray-500">Завантаження…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500">
            Поки немає збережених слайдів — натисніть «Зберегти» вище, щоб опублікувати hero.
          </p>
        ) : (
          <ul className="space-y-4">
            {list.map((row) => (
              <li
                key={row.id}
                className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                  editingId === row.id
                    ? "border-[var(--site-accent)] bg-[var(--site-accent)]/5"
                    : "border-gray-200"
                }`}
              >
                <div className="flex shrink-0 gap-3">
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
                  <p className="line-clamp-1 font-medium text-gray-900">{row.title}</p>
                  <p className="text-xs text-gray-500">
                    Порядок: {row.sortOrder} · {row.isActive ? "активний" : "прихований"}
                    {editingId === row.id ? " · редагується" : ""}
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

        {list.length > 0 && (
          <button
            type="button"
            onClick={loadDefaultForm}
            className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            + Додати новий слайд
          </button>
        )}
      </ComponentCard>
    </div>
  );
}
