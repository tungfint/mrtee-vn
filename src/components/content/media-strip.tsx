import { ExternalLink, FileText, Headphones, ImageIcon, Video } from "lucide-react";

import { EmbeddedVideo } from "@/components/content/embedded-video";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl, drivePreviewUrl, embeddedVideoUrl } from "@/lib/media-urls";

type MediaItem = {
  type: "IMAGE" | "VIDEO" | "AUDIO" | "LINK" | "FILE";
  url: string;
  title?: string;
  caption?: string;
};

const mediaIcons = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  AUDIO: Headphones,
  LINK: ExternalLink,
  FILE: FileText,
};

export function MediaStrip({ items }: { items: MediaItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = mediaIcons[item.type];

        if (item.type === "VIDEO") {
          const embedUrl = embeddedVideoUrl(item.url);

          return (
            <div
              key={item.url}
              className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm"
            >
              {embedUrl ? (
                <EmbeddedVideo src={embedUrl} title={item.title ?? "Video"} />
              ) : (
                <video className="aspect-video w-full" controls src={item.url} />
              )}
              {item.caption ? (
                <p className="bg-white px-3 py-2 text-sm text-slate-600">
                  {item.caption}
                </p>
              ) : null}
            </div>
          );
        }

        if (item.type === "AUDIO") {
          const embedUrl = drivePreviewUrl(item.url);

          return (
            <div
              key={item.url}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                <Icon aria-hidden className="h-4 w-4 text-emerald-700" />
                {item.title ?? "Audio"}
              </div>
              {embedUrl ? (
                <iframe
                  className="h-20 w-full rounded-md border-0"
                  src={embedUrl}
                  title={item.title ?? "Audio"}
                />
              ) : (
                <audio className="w-full" controls src={item.url} />
              )}
            </div>
          );
        }

        if (item.type === "IMAGE") {
          const visibleImageUrl = displayImageUrl(item.url) ?? item.url;

          return (
            <div
              key={item.url}
              className="relative min-h-48 overflow-hidden rounded-lg border border-slate-200 bg-cover bg-center p-4 shadow-sm"
              style={{ backgroundImage: `url(${visibleImageUrl})` }}
            >
              <div className="absolute inset-0 bg-slate-950/10" />
              <div className="relative inline-flex rounded-md bg-white/92 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm">
                {item.title ?? "Hình ảnh"}
              </div>
              <ImageLightboxButton
                className="absolute right-3 top-3 z-10"
                imageUrl={item.url}
                label="Xem ảnh"
              />
            </div>
          );
        }

        return (
          <a
            key={item.url}
            href={item.url}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-800 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
            rel="noreferrer"
            target="_blank"
          >
            <Icon aria-hidden className="h-4 w-4 text-emerald-700" />
            {item.title ?? item.url}
          </a>
        );
      })}
    </div>
  );
}
