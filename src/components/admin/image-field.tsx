"use client";

import { ImagePlus } from "lucide-react";
import { useMemo, useState } from "react";

import { inputClass, selectClass } from "@/components/admin/admin-shell";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl } from "@/lib/media-urls";
import { cn } from "@/lib/utils";

const cropOptions = [
  { label: "Giữa ảnh", value: "50% 50%" },
  { label: "Phía trên", value: "50% 0%" },
  { label: "Phía dưới", value: "50% 100%" },
  { label: "Bên trái", value: "0% 50%" },
  { label: "Bên phải", value: "100% 50%" },
];

const legacyCrops: Record<string, string> = {
  bottom: "50% 100%",
  center: "50% 50%",
  left: "0% 50%",
  right: "100% 50%",
  top: "50% 0%",
};

function cropCoordinates(value?: string | null) {
  const normalized = legacyCrops[value ?? ""] ?? value ?? "50% 50%";
  const match = normalized.match(/^(\d{1,3})%\s+(\d{1,3})%$/);

  return match
    ? {
        x: Math.min(100, Number(match[1])),
        y: Math.min(100, Number(match[2])),
      }
    : { x: 50, y: 50 };
}

function cropPercentage(value: string) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

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
  const initialCrop = cropCoordinates(defaultCrop);
  const [cropX, setCropX] = useState(initialCrop.x);
  const [cropY, setCropY] = useState(initialCrop.y);

  const activePreview = useMemo(
    () => localPreview || preview,
    [localPreview, preview],
  );
  const visiblePreview = displayImageUrl(activePreview) ?? activePreview;
  const cropValue = `${cropX}% ${cropY}%`;
  const cropPreset = cropOptions.some((option) => option.value === cropValue)
    ? cropValue
    : "custom";

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

      <div className="mt-3">
        <input
          className={inputClass}
          defaultValue={defaultValue ?? ""}
          id={name}
          name={name}
          onChange={(event) => setPreview(event.target.value)}
          placeholder="https://... hoặc Google Drive public link"
        />
      </div>

      <div
        className={cn(
          "relative mt-3 flex items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-100 bg-cover bg-center text-sm text-slate-500",
          previewAspectClass(recommendedSize),
        )}
        style={{
          backgroundImage: visiblePreview ? `url(${visiblePreview})` : undefined,
          backgroundPosition: cropName ? cropValue : "center",
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

      {cropName ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <input name={cropName} type="hidden" value={cropValue} />
          <div className="mb-3 grid gap-2 sm:grid-cols-[150px_1fr] sm:items-center">
            <span className="text-xs font-semibold text-slate-600">Vị trí nhanh</span>
            <select
              className={selectClass}
              onChange={(event) => {
                if (event.target.value !== "custom") {
                  const coordinates = cropCoordinates(event.target.value);
                  setCropX(coordinates.x);
                  setCropY(coordinates.y);
                }
              }}
              value={cropPreset}
            >
              {cropOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="flex items-center justify-between gap-3 text-xs font-medium text-slate-600">
              <span>Ngang</span>
              <span className="flex items-center gap-1">
                <input
                  aria-label="Vị trí crop ngang"
                  className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-right text-xs text-slate-700"
                  max="100"
                  min="0"
                  onChange={(event) => setCropX(cropPercentage(event.target.value))}
                  type="number"
                  value={cropX}
                />
                %
              </span>
            </label>
            <input
              aria-label="Kéo vị trí crop ngang"
              className="mt-2 block w-full accent-emerald-700"
              max="100"
              min="0"
              onChange={(event) => setCropX(cropPercentage(event.target.value))}
              type="range"
              value={cropX}
            />
          </div>
          <div>
            <label className="flex items-center justify-between gap-3 text-xs font-medium text-slate-600">
              <span>Dọc</span>
              <span className="flex items-center gap-1">
                <input
                  aria-label="Vị trí crop dọc"
                  className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-right text-xs text-slate-700"
                  max="100"
                  min="0"
                  onChange={(event) => setCropY(cropPercentage(event.target.value))}
                  type="number"
                  value={cropY}
                />
                %
              </span>
            </label>
            <input
              aria-label="Kéo vị trí crop dọc"
              className="mt-2 block w-full accent-emerald-700"
              max="100"
              min="0"
              onChange={(event) => setCropY(cropPercentage(event.target.value))}
              type="range"
              value={cropY}
            />
          </div>
        </div>
      ) : null}

      {localPreview ? (
        <p className="mt-2 text-xs leading-5 text-amber-700">
          Ảnh này sẽ được upload vào thư mục public/uploads khi bấm lưu. Khi đưa
          website lên production, có thể đổi sang Cloudinary hoặc Vercel Blob.
        </p>
      ) : null}
    </div>
  );
}
