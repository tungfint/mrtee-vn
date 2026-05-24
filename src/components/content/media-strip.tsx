import { ExternalLink, FileText, Headphones, ImageIcon, Video } from "lucide-react";

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
          return (
            <div
              key={item.url}
              className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm"
            >
              <video className="aspect-video w-full" controls src={item.url} />
              {item.caption ? (
                <p className="bg-white px-3 py-2 text-sm text-slate-600">
                  {item.caption}
                </p>
              ) : null}
            </div>
          );
        }

        if (item.type === "AUDIO") {
          return (
            <div
              key={item.url}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
                <Icon aria-hidden className="h-4 w-4 text-emerald-700" />
                {item.title ?? "Audio"}
              </div>
              <audio className="w-full" controls src={item.url} />
            </div>
          );
        }

        if (item.type === "IMAGE") {
          return (
            <div
              key={item.url}
              className="min-h-48 rounded-lg border border-slate-200 bg-cover bg-center p-4 shadow-sm"
              style={{ backgroundImage: `url(${item.url})` }}
            >
              <div className="inline-flex rounded-md bg-white/90 px-3 py-2 text-sm font-medium text-slate-800 shadow-sm">
                {item.title ?? "Hình ảnh"}
              </div>
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
