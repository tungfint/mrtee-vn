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
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmbeddedVideo } from "@/components/content/embedded-video";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl, embeddedVideoUrl, mediaPreviewImageUrl, playableAudioUrl } from "@/lib/media-urls";

export type GalleryMediaItem = {
  caption?: string;
  title?: string;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "LINK" | "FILE";
  url: string;
};

function uniqueByUrl(items: GalleryMediaItem[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.url.trim();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function MediaGallery({
  constrainGridHeight = false,
  items,
  title = "Album",
  viewMode = "SLIDE",
}: {
  constrainGridHeight?: boolean;
  items: GalleryMediaItem[];
  title?: string;
  viewMode?: "SLIDE" | "GRID";
}) {
  const images = useMemo(() => uniqueByUrl(items.filter((item) => item.type === "IMAGE")), [items]);
  const videos = useMemo(() => uniqueByUrl(items.filter((item) => item.type === "VIDEO")), [items]);
  const audio = items.find((item) => item.type === "AUDIO");
  const links = items.filter((item) => item.type === "LINK" || item.type === "FILE");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState<GalleryMediaItem | null>(null);
  const [autoPlay, setAutoPlay] = useState(images.length > 1);
  const activeImage = images[activeImageIndex];
  const activeVideo = videos[activeVideoIndex];
  const activeImageUrl = activeImage ? displayImageUrl(activeImage.url) : null;

  function openVideo(video: GalleryMediaItem, index: number) {
    setActiveVideoIndex(index);
    setLightboxItem(video);
  }

  const showImageAt = useCallback((index: number) => {
    if (!images.length) {
      return;
    }

    const nextIndex = (index + images.length) % images.length;
    setActiveImageIndex(nextIndex);
    setLightboxItem(images[nextIndex]);
  }, [images, setActiveImageIndex, setLightboxItem]);

  useEffect(() => {
    if (!autoPlay || images.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [autoPlay, images.length]);

  useEffect(() => {
    if (!lightboxItem) {
      return;
    }

    const currentLightboxItem = lightboxItem;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLightboxItem(null);
        return;
      }

      if (currentLightboxItem.type !== "IMAGE") {
        return;
      }

      if (event.key === "ArrowLeft") {
        showImageAt(activeImageIndex - 1);
      }

      if (event.key === "ArrowRight") {
        showImageAt(activeImageIndex + 1);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImageIndex, lightboxItem, showImageAt]);

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
        {activeImage && viewMode === "SLIDE" ? (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ring-1 ring-white/70">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Images aria-hidden className="h-4 w-4 text-emerald-700" />
                Ảnh trình chiếu
              </p>
            </div>
            <div className="relative bg-slate-950">
              <img
                alt={activeImage.title ?? title}
                className="aspect-[3/2] max-h-[680px] w-full cursor-zoom-in object-cover"
                onClick={() => setLightboxItem(activeImage)}
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
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-950/48 text-white ring-1 ring-white/20 transition hover:bg-slate-950/76"
                    onClick={() =>
                      setActiveImageIndex((activeImageIndex - 1 + images.length) % images.length)
                    }
                    type="button"
                  >
                    <ChevronLeft aria-hidden className="h-5 w-5" />
                  </button>
                  <button
                    aria-label="Ảnh tiếp theo"
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-950/48 text-white ring-1 ring-white/20 transition hover:bg-slate-950/76"
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
              <div className="gallery-scroll flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">
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

        {images.length && viewMode === "GRID" ? (
          <section className="grid gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Images aria-hidden className="h-4 w-4 text-emerald-700" />
              Grid ảnh
            </div>
            <div
              className={
                constrainGridHeight
                  ? "gallery-scroll grid max-h-[760px] gap-3 overflow-y-auto pr-1 sm:max-h-[560px] sm:grid-cols-2 lg:max-h-[680px] lg:grid-cols-4"
                  : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
              }
            >
              {images.map((image, index) => {
                const imageUrl = displayImageUrl(image.url) ?? image.url;

                return (
                  <button
                    className="group overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                    key={`${image.url}-grid-${index}`}
                    onClick={() => {
                      setActiveImageIndex(index);
                      setLightboxItem(image);
                    }}
                    type="button"
                  >
                    <img
                      alt={image.title ?? `${title} ${index + 1}`}
                      className="gallery-grid-image w-full object-cover transition group-hover:scale-105 sm:aspect-[4/3] sm:h-auto"
                      src={imageUrl}
                    />
                    <span className="block truncate px-3 py-2 text-xs font-medium text-slate-700">
                      {image.title ?? `Ảnh ${index + 1}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        {activeVideo && viewMode === "SLIDE" ? (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ring-1 ring-white/70">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Film aria-hidden className="h-4 w-4 text-cyan-700" />
                Video
              </p>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,360px)_1fr]">
              <button
                className="group overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-left shadow-sm"
                onClick={() => openVideo(activeVideo, activeVideoIndex)}
                type="button"
              >
                <VideoThumb title={activeVideo.title ?? "Video album"} url={activeVideo.url} />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{activeVideo.title ?? "Video album"}</p>
                {activeVideo.caption ? <p className="mt-1 text-xs text-slate-500">{activeVideo.caption}</p> : null}
                {videos.length > 1 ? (
                  <div className="mt-3 grid gap-2">
                    {videos.map((video, index) => (
                      <button
                    className={
                      index === activeVideoIndex
                            ? "rounded-md bg-cyan-50 px-3 py-2 text-left text-xs font-medium text-cyan-900 ring-1 ring-cyan-100"
                            : "rounded-md bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-slate-100"
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
            </div>
          </section>
        ) : null}

        {videos.length && viewMode === "GRID" ? (
          <section className="grid gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Film aria-hidden className="h-4 w-4 text-cyan-700" />
              Grid video
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {videos.map((video, index) => (
                <button
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
                  key={`${video.url}-grid-${index}`}
                  onClick={() => openVideo(video, index)}
                  type="button"
                >
                  <VideoThumb title={video.title ?? `Video ${index + 1}`} url={video.url} />
                  <span className="block truncate px-3 py-2 text-xs font-medium text-slate-700">
                    {video.title ?? `Video ${index + 1}`}
                  </span>
                </button>
              ))}
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

      {lightboxItem ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/88 p-4 sm:p-8"
          onClick={() => setLightboxItem(null)}
          role="dialog"
        >
          <button
            aria-label="Đóng"
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-md bg-white/12 text-white ring-1 ring-white/30 transition hover:bg-white/22"
            onClick={() => setLightboxItem(null)}
            type="button"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            {lightboxItem.type === "IMAGE" ? (
              <div className="relative">
                <img
                  alt={lightboxItem.title ?? title}
                  className="mx-auto max-h-[86vh] max-w-full rounded-md object-contain shadow-2xl"
                  src={displayImageUrl(lightboxItem.url) ?? lightboxItem.url}
                />
                {images.length > 1 ? (
                  <>
                    <button
                      aria-label="Ảnh trước"
                      className="absolute left-0 top-1/2 inline-flex h-11 w-11 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-md bg-white/12 text-white ring-1 ring-white/30 transition hover:bg-white/22 sm:-translate-x-14"
                      onClick={() => showImageAt(activeImageIndex - 1)}
                      type="button"
                    >
                      <ChevronLeft aria-hidden className="h-6 w-6" />
                    </button>
                    <button
                      aria-label="Ảnh tiếp theo"
                      className="absolute right-0 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 translate-x-2 items-center justify-center rounded-md bg-white/12 text-white ring-1 ring-white/30 transition hover:bg-white/22 sm:translate-x-14"
                      onClick={() => showImageAt(activeImageIndex + 1)}
                      type="button"
                    >
                      <ChevronRight aria-hidden className="h-6 w-6" />
                    </button>
                  </>
                ) : null}
              </div>
            ) : embeddedVideoUrl(lightboxItem.url) ? (
              <EmbeddedVideo
                autoStart
                key={lightboxItem.url}
                src={embeddedVideoUrl(lightboxItem.url) ?? ""}
                title={lightboxItem.title ?? "Video album"}
              />
            ) : (
              <video
                autoPlay
                className="max-h-[86vh] w-full rounded-md bg-slate-950 shadow-2xl"
                controls
                preload="metadata"
                src={lightboxItem.url}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function VideoThumb({ title, url }: { title: string; url: string }) {
  const previewImage = mediaPreviewImageUrl(url);

  return (
    <div className="relative aspect-video bg-slate-950 text-white">
      {previewImage ? (
        <img
          alt={title}
          className="h-full w-full object-cover opacity-90 transition group-hover:scale-105"
          src={previewImage}
        />
      ) : (
        <video className="h-full w-full object-cover opacity-90" muted preload="metadata" src={url} />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/22">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/92 text-slate-950 shadow-lg transition group-hover:scale-105">
          <Play aria-hidden className="h-5 w-5 translate-x-0.5" />
        </span>
      </div>
    </div>
  );
}
