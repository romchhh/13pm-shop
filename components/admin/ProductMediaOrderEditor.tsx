"use client";

import Image from "next/image";
import { moveArrayItem } from "@/lib/moveArrayItem";

export type ProductMediaOrderItem = {
  key: string;
  type: "photo" | "video";
  src: string;
  /** Підпис, напр. «Нове» для щойно доданих файлів */
  label?: string;
};

type ProductMediaOrderEditorProps = {
  items: ProductMediaOrderItem[];
  onReorder: (items: ProductMediaOrderItem[]) => void;
  onRemove: (index: number) => void;
};

export default function ProductMediaOrderEditor({
  items,
  onReorder,
  onRemove,
}: ProductMediaOrderEditorProps) {
  if (items.length === 0) return null;

  const move = (index: number, direction: -1 | 1) => {
    onReorder(moveArrayItem(items, index, direction));
  };

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-gray-500">
        Перше фото — головне в каталозі та на сторінці товару. Використовуйте ↑ ↓ для зміни порядку.
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => {
          const isVideo = item.type === "video";
          const isMain = index === 0;
          return (
            <li
              key={item.key}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-2 py-2"
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  className="rounded border border-gray-200 bg-white px-1.5 text-xs leading-none text-gray-600 disabled:opacity-30"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="Вище"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="rounded border border-gray-200 bg-white px-1.5 text-xs leading-none text-gray-600 disabled:opacity-30"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="Нижче"
                >
                  ↓
                </button>
              </div>
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {isVideo ? (
                  <video
                    src={item.src}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                )}
                <span className="absolute left-0 top-0 rounded-br bg-black/55 px-1 text-[10px] font-semibold text-white">
                  {index + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800">
                  {isMain ? (
                    <span className="font-semibold text-blue-700">Головне фото</span>
                  ) : (
                    <span className="text-gray-600">Фото {index + 1}</span>
                  )}
                </p>
                {item.label ? (
                  <p className="text-xs text-gray-500">{item.label}</p>
                ) : null}
                <p className="text-xs text-gray-400">{isVideo ? "Відео" : "Зображення"}</p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                onClick={() => onRemove(index)}
              >
                Видалити
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
