"use client";

/* eslint-disable @next/next/no-img-element */

import { Play } from "lucide-react";
import { useEffect, useState } from "react";

import { mediaPreviewImageUrl } from "@/lib/media-urls";

export function EmbeddedVideo({
  autoStart = false,
  src,
  title,
}: {
  autoStart?: boolean;
  src: string;
  title: string;
}) {
  const [started, setStarted] = useState(autoStart);
  const previewImage = mediaPreviewImageUrl(src);

  useEffect(() => {
    if (!started) return;

    window.dispatchEvent(new Event("mrtee:video-open"));

    return () => {
      window.dispatchEvent(new Event("mrtee:video-close"));
    };
  }, [started]);

  function playableSrc() {
    if (!autoStart) {
      return src;
    }

    try {
      const parsed = new URL(src);

      if (parsed.hostname.includes("youtube.com")) {
        parsed.searchParams.set("autoplay", "1");
        return parsed.toString();
      }
    } catch {
      return src;
    }

    return src;
  }

  if (!started) {
    return (
      <button
        className="group relative flex aspect-video min-h-[180px] w-full items-center justify-center overflow-hidden bg-slate-950 text-sm font-semibold text-white sm:min-h-[280px]"
        onClick={() => setStarted(true)}
        type="button"
      >
        {previewImage ? (
          <img
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition group-hover:scale-105"
            src={previewImage}
          />
        ) : null}
        <span className="absolute inset-0 bg-slate-950/24" />
        <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/92 text-slate-950 shadow-lg transition group-hover:scale-105">
          <Play aria-hidden className="h-6 w-6 translate-x-0.5" />
        </span>
      </button>
    );
  }

  return (
    <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-video min-h-[180px] w-full rounded-md bg-slate-950 sm:min-h-[280px]"
      src={playableSrc()}
      title={title}
    />
  );
}
