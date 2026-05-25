"use client";

/* eslint-disable @next/next/no-img-element */

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Film,
  Images,
  Pause,
  Play,
  Volume2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmbeddedVideo } from "@/components/content/embedded-video";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl, embeddedVideoUrl, playableAudioUrl } from "@/lib/media-urls";

export type GalleryMediaItem = {
  caption?: string;
  title?: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "LINK" | "FILE";
  url: string;
};

export function MediaGallery({
  items,
  title = "Album",
}: {
  items: GalleryMediaItem[];
  title?: string;
}) {
  const images = useMemo(() => items.filter((item) => item.type === "IMAGE"), [items]);
  const videos = useMemo(() => items.filter((item) => item.type === "VIDEO"), [items]);
  const audio = items.find((item) => item.type === "AUDIO");
  const links = items.filter((item) => item.type === "LINK" || item.type === "FILE");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(images.length > 1);
  const activeImage = images[activeImageIndex];
  const activeVideo = videos[activeVideoIndex];
  const activeImageUrl = activeImage ? displayImageUrl(activeImage.url) : null;

  useEffect(() => {
    if (!autoPlay || images.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [autoPlay, images.length]);

  if (!images.length && !videos.length && !audio && !links.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
        Chưa có ảnh hoặc video trong album.
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5">
        {activeImage ? (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Images aria-hidden className="h-4 w-4 text-emerald-700" />
                Ảnh trình chiếu
              </p>
            </div>
            <div className="relative bg-slate-950">
              <img
                alt={activeImage.title ?? title}
                className="aspect-[3/2] max-h-[680px] w-full object-cover"
                src={activeImageUrl ?? activeImage.url}
              />
              <ImageLightboxButton
                alt={activeImage.title ?? title}
                className="absolute right-3 top-3 z-10"
                imageUrl={activeImage.url}
                label="Xem ảnh"
              />
              {images.length > 1 ? (
                <>
                  <button
                    aria-label="Ảnh trước"
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-950/45 text-white hover:bg-slate-950/70"
                    onClick={() =>
                      setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)
                    }
                    type="button"
                  >
                    <ChevronLeft aria-hidden className="h-5 w-5" />
                  </button>
                  <button
                    aria-label="Ảnh tiếp theo"
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-950/45 text-white hover:bg-slate-950/70"
                    onClick={() => setActiveImageIndex((activeImageIndex + 1) % images.length)}
                    type="button"
                  >
                    <ChevronRight aria-hidden className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  {activeImage.title ?? "Ảnh trình chiếu"}
                </p>
                {activeImage.caption ? (
                  <p className="mt-1 text-xs text-slate-500">{activeImage.caption}</p>
                ) : null}
              </div>
              {images.length > 1 ? (
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setAutoPlay((value) => !value)}
                  type="button"
                >
                  {autoPlay ? <Pause aria-hidden className="h-3.5 w-3.5" /> : <Play aria-hidden className="h-3.5 w-3.5" />}
                  {autoPlay ? "Dừng ảnh chạy" : "Chạy ảnh"}
                </button>
              ) : null}
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">
                {images.map((image, index) => (
                  <button
                    aria-label={`Mở ảnh ${index + 1}`}
                    className={
                      index === activeImageIndex
                        ? "h-2 w-9 shrink-0 rounded-full bg-emerald-600"
                        : "h-2 w-9 shrink-0 rounded-full bg-slate-200 hover:bg-slate-300"
                    }
                    key={`${image.url}-${index}`}
                    onClick={() => setActiveImageIndex(index)}
                    type="button"
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {activeVideo ? (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Film aria-hidden className="h-4 w-4 text-cyan-700" />
                Video
              </p>
              <p className="mt-1 text-xs text-slate-500">Chọn video và bấm phát để xem.</p>
            </div>
            <div className="bg-slate-950">
              {embeddedVideoUrl(activeVideo.url) ? (
                <EmbeddedVideo
                  src={embeddedVideoUrl(activeVideo.url) ?? ""}
                  title={activeVideo.title ?? "Video album"}
                />
              ) : (
                <video className="aspect-video min-h-[220px] w-full bg-slate-950 sm:min-h-[360px]" controls preload="metadata" src={activeVideo.url} />
              )}
            </div>
            <div className="px-4 py-4">
              <p className="text-sm font-medium text-slate-900">{activeVideo.title ?? "Video album"}</p>
              {activeVideo.caption ? <p className="mt-1 text-xs text-slate-500">{activeVideo.caption}</p> : null}
              {videos.length > 1 ? (
                <div className="mt-3 grid gap-2">
                  {videos.map((video, index) => (
                    <button
                      className={
                        index === activeVideoIndex
                          ? "rounded-md bg-cyan-50 px-3 py-2 text-left text-xs font-medium text-cyan-900"
                          : "rounded-md bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-100"
                      }
                      key={video.url}
                      onClick={() => setActiveVideoIndex(index)}
                      type="button"
                    >
                      {video.title ?? `Video ${index + 1}`}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      {audio ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Volume2 aria-hidden className="h-4 w-4 text-emerald-700" />
            {audio.title ?? "Nhạc nền album"}
          </p>
          <audio className="w-full" controls preload="metadata" src={playableAudioUrl(audio.url)} />
        </div>
      ) : null}

      {links.length ? (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-800"
              href={link.url}
              key={link.url}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden className="h-3.5 w-3.5" />
              {link.title ?? "Mở tài liệu"}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
