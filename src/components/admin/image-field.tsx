"use client";

import { ImagePlus } from "lucide-react";
import { useMemo, useState } from "react";

import { inputClass, selectClass } from "@/components/admin/admin-shell";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { cn } from "@/lib/utils";

const cropOptions = [
  { label: "Giữa ảnh", value: "center" },
  { label: "Phía trên", value: "top" },
  { label: "Phía dưới", value: "bottom" },
  { label: "Bên trái", value: "left" },
  { label: "Bên phải", value: "right" },
];

type ImageFieldProps = {
  name: string;
  label: string;
  recommendedSize: string;
  cropName?: string;
  defaultCrop?: string | null;
  defaultValue?: string | null;
  helpText?: string;
};

function previewAspectClass(recommendedSize: string) {
  if (recommendedSize.includes("800 x 800")) {
    return "aspect-square";
  }

  if (recommendedSize.includes("1920 x 720")) {
    return "aspect-[8/3]";
  }

  if (recommendedSize.includes("1200 x 900")) {
    return "aspect-[4/3]";
  }

  return "aspect-[16/9]";
}

export function ImageField({
  name,
  label,
  recommendedSize,
  cropName,
  defaultCrop,
  defaultValue,
  helpText,
}: ImageFieldProps) {
  const [preview, setPreview] = useState(defaultValue ?? "");
  const [localPreview, setLocalPreview] = useState("");

  const activePreview = useMemo(
    () => localPreview || preview,
    [localPreview, preview],
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <label className="text-sm font-semibold text-slate-800" htmlFor={name}>
            {label}
          </label>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Kích thước gợi ý: {recommendedSize}. Có thể dán URL ảnh hoặc link
            Google Drive đã bật chia sẻ công khai.
          </p>
          {helpText ? (
            <p className="mt-1 text-xs leading-5 text-slate-500">{helpText}</p>
          ) : null}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
          <ImagePlus aria-hidden className="h-4 w-4 text-emerald-700" />
          Up ảnh
          <input
            accept="image/*"
            className="sr-only"
            name={`${name}File`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setLocalPreview(URL.createObjectURL(file));
              }
            }}
            type="file"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px]">
        <input
          className={inputClass}
          defaultValue={defaultValue ?? ""}
          id={name}
          name={name}
          onChange={(event) => setPreview(event.target.value)}
          placeholder="https://... hoặc Google Drive public link"
        />
        {cropName ? (
          <select
            className={selectClass}
            defaultValue={defaultCrop ?? "center"}
            name={cropName}
          >
            {cropOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Crop: {option.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div
        className={cn(
          "relative mt-3 flex items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-100 bg-cover bg-center text-sm text-slate-500",
          previewAspectClass(recommendedSize),
        )}
        style={{
          backgroundImage: activePreview ? `url(${activePreview})` : undefined,
        }}
      >
        {activePreview ? (
          <ImageLightboxButton
            className="absolute right-3 top-3"
            imageUrl={activePreview}
            label="Xem ảnh"
          />
        ) : (
          "Preview ảnh"
        )}
      </div>

      {localPreview ? (
        <p className="mt-2 text-xs leading-5 text-amber-700">
          Ảnh này sẽ được upload vào thư mục public/uploads khi bấm lưu. Khi đưa
          website lên production, có thể đổi sang Cloudinary hoặc Vercel Blob.
        </p>
      ) : null}
    </div>
  );
}
