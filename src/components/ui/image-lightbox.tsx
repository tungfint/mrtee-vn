"use client";

/* eslint-disable @next/next/no-img-element */

import { Expand, X } from "lucide-react";
import { useEffect, useState } from "react";

import { displayImageUrl } from "@/lib/media-urls";
import { cn } from "@/lib/utils";

export function ImageLightboxButton({
  alt = "Hình ảnh",
  className,
  imageUrl,
  label = "Xem ảnh",
}: {
  alt?: string;
  className?: string;
  imageUrl: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const visibleImageUrl = displayImageUrl(imageUrl) ?? imageUrl;

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeWithKeyboard(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithKeyboard);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithKeyboard);
    };
  }, [open]);

  return (
    <>
      <button
        aria-label={label}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-950/38 text-white ring-1 ring-white/40 backdrop-blur-sm transition hover:bg-slate-950/62",
          className,
        )}
        onClick={() => setOpen(true)}
        title={label}
        type="button"
      >
        <Expand aria-hidden className="h-3.5 w-3.5" />
      </button>

      {open ? (
        <div
          aria-label={label}
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/88 p-4 sm:p-8"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <button
            aria-label="Đóng ảnh"
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/12 text-white ring-1 ring-white/30 transition hover:bg-white/22"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
          <img
            alt={alt}
            className="max-h-[88vh] max-w-full rounded-md object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            src={visibleImageUrl}
          />
        </div>
      ) : null}
    </>
  );
}
