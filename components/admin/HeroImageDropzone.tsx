"use client";

import Image from "next/image";
import { useDropzone } from "react-dropzone";
import {
  IMAGE_ONLY_DROPZONE_ACCEPT,
  adminImageOnlyDropzoneValidator,
} from "@/lib/imageUploadAccept";

type HeroImageDropzoneProps = {
  label: string;
  hint: string;
  previewUrl: string | null;
  aspectClassName: string;
  onFile: (file: File | null) => void;
};

export default function HeroImageDropzone({
  label,
  hint,
  previewUrl,
  aspectClassName,
  onFile,
}: HeroImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (accepted) => onFile(accepted[0] ?? null),
    accept: IMAGE_ONLY_DROPZONE_ACCEPT,
    validator: adminImageOnlyDropzoneValidator,
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
  });

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700">{label}</p>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
          isDragActive
            ? "border-[var(--site-accent)] bg-[var(--site-accent)]/5"
            : "border-gray-300 bg-gray-50 hover:border-[var(--site-accent)]/50 hover:bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? "Відпустіть файл тут" : "Перетягніть зображення сюди"}
        </p>
        <p className="mt-1 text-xs text-gray-500">або натисніть, щоб обрати файл</p>
        <p className="mt-2 text-xs text-gray-400">{hint}</p>
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-2 text-xs text-red-600">
          {fileRejections[0]?.errors[0]?.message ?? "Недопустимий файл"}
        </p>
      )}

      {previewUrl && (
        <div
          className={`relative mt-3 w-full overflow-hidden rounded-lg border border-gray-200 ${aspectClassName}`}
        >
          <Image
            src={previewUrl}
            alt=""
            fill
            className="object-cover"
            unoptimized={previewUrl.startsWith("blob:")}
          />
        </div>
      )}
    </div>
  );
}
