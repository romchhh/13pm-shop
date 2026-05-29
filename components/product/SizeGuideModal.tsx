"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

type SizeGuideModalProps = {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
};

export default function SizeGuideModal({ open, onClose, imageSrc }: SizeGuideModalProps) {
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-site-overlay)] flex items-center justify-center bg-black/65 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Таблиця розмірів"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white p-3 shadow-2xl sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 font-['Montserrat'] text-lg text-white transition-opacity hover:bg-black"
          aria-label="Закрити"
        >
          ×
        </button>
        <p className="mb-3 shrink-0 pr-10 font-['Montserrat'] text-sm font-semibold text-black">
          Таблиця розмірів
        </p>
        <div className="flex min-h-0 justify-center overflow-auto">
          <Image
            src={imageSrc}
            alt="Таблиця розмірів тактичного одягу 13pm tactic — підбір розміру"
            width={1200}
            height={1600}
            className="h-auto max-h-[90vh] w-full max-w-full rounded-xl object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      </div>
    </div>
  );
}
