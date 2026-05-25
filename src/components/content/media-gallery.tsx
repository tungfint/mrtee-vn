"use client";

/* eslint-disable @next/next/no-img-element */

import { ChevronLeft, ChevronRight, Images, Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ImageLightboxButton } from "@/components/ui/image-lightbox";

export type GalleryMediaItem = {
  caption?: string;
  title?: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "LINK" | "FILE";
  url: string;
};

function embeddedVideoUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsed.hostname.includes("drive.google.com")) {
      return url.replace(/\/view.*$/, "/preview");
    }
  } catch {
    return null;
  }

  return null;
}

export function MediaGallery({
  items,
  title = "Album",
}: {
  items: GalleryMediaItem[];
  title?: string;
}) {
  const slides = useMemo(
    () => items.filter((item) => item.type === "IMAGE" || item.type === "VIDEO"),
    [items],
  );
  const audio = items.find((item) => item.type === "AUDIO");
  const links = items.filter((item) => item.type === "LINK" || item.type === "FILE");
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(slides.length > 1);
  const active = slides[activeIndex];

  useEffect(() => {
    if (!autoPlay || slides.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [autoPlay, slides.length]);

  if (!slides.length && !audio && !links.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
        Chưa có ảnh hoặc video trong album.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {active ? (
        <div className="relative bg-slate-950">
          {active.type === "IMAGE" ? (
            <>
              <img
                alt={active.title ?? title}
                className="aspect-[16/7] w-full object-cover"
                src={active.url}
              />
              <div className="absolute inset-0 bg-slate-950/10" />
              <ImageLightboxButton
                alt={active.title ?? title}
                className="absolute right-3 top-3 z-10"
                imageUrl={active.url}
                label="Xem ảnh"
              />
            </>
          ) : embeddedVideoUrl(active.url) ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
              src={embeddedVideoUrl(active.url) ?? undefined}
              title={active.title ?? title}
            />
          ) : (
            <video className="aspect-video w-full" controls src={active.url} />
          )}

          {slides.length > 1 ? (
            <>
              <button
                aria-label="Ảnh trước"
                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-950/42 text-white hover:bg-slate-950/68"
                onClick={() =>
                  setActiveIndex((activeIndex - 1 + slides.length) % slides.length)
                }
                type="button"
              >
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <button
                aria-label="Ảnh tiếp theo"
                className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-950/42 text-white hover:bg-slate-950/68"
                onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
                type="button"
              >
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Images aria-hidden className="h-4 w-4 text-emerald-700" />
            {active?.title ?? title}
          </p>
          {active?.caption ? (
            <p className="mt-1 text-xs text-slate-500">{active.caption}</p>
          ) : null}
        </div>
        {slides.length > 1 ? (
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            onClick={() => setAutoPlay((value) => !value)}
            type="button"
          >
            {autoPlay ? (
              <Pause aria-hidden className="h-3.5 w-3.5" />
            ) : (
              <Play aria-hidden className="h-3.5 w-3.5" />
            )}
            {autoPlay ? "Dừng tự động" : "Tự động chạy"}
          </button>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">
          {slides.map((slide, index) => (
            <button
              aria-label={`Mở media ${index + 1}`}
              className={
                index === activeIndex
                  ? "h-2 w-9 shrink-0 rounded-full bg-emerald-600"
                  : "h-2 w-9 shrink-0 rounded-full bg-slate-200 hover:bg-slate-300"
              }
              key={`${slide.url}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}

      {audio ? (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Volume2 aria-hidden className="h-4 w-4 text-emerald-700" />
            {audio.title ?? "Nhạc nền album"}
          </p>
          <audio className="w-full" controls src={audio.url} />
        </div>
      ) : null}

      {links.length ? (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3">
          {links.map((link) => (
            <a
              className="rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
              href={link.url}
              key={link.url}
              rel="noreferrer"
              target="_blank"
            >
              {link.title ?? "Mở tài liệu"}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
