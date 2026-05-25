"use client";

import { Play } from "lucide-react";
import { useEffect, useState } from "react";

export function EmbeddedVideo({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;

    window.dispatchEvent(new Event("mrtee:video-open"));

    return () => {
      window.dispatchEvent(new Event("mrtee:video-close"));
    };
  }, [started]);

  if (!started) {
    return (
      <button
        className="flex aspect-video min-h-[220px] w-full items-center justify-center gap-2 bg-slate-950 text-sm font-semibold text-white hover:bg-slate-900 sm:min-h-[360px]"
        onClick={() => setStarted(true)}
        type="button"
      >
        <Play aria-hidden className="h-5 w-5" />
        Phát video
      </button>
    );
  }

  return (
    <iframe
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-video min-h-[220px] w-full sm:min-h-[360px]"
      src={src}
      title={title}
    />
  );
}
