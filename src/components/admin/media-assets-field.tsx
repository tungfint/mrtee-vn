import { Film, ImageIcon, Music2 } from "lucide-react";

import { textareaClass } from "@/components/admin/admin-shell";

type MediaItem = {
  caption?: string | null;
  title?: string | null;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "LINK" | "FILE";
  url: string;
};

function mediaText(items: MediaItem[]) {
  return items
    .map((item) =>
      [item.type, item.url, item.title ?? "", item.caption ?? ""].join(" | "),
    )
    .join("\n");
}

export function MediaAssetsField({ items = [] }: { items?: MediaItem[] }) {
  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-800">
        <span className="inline-flex items-center gap-1.5">
          <ImageIcon aria-hidden className="h-4 w-4 text-emerald-700" />
          Ảnh slide
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Film aria-hidden className="h-4 w-4 text-emerald-700" />
          Video
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Music2 aria-hidden className="h-4 w-4 text-emerald-700" />
          Nhạc nền
        </span>
      </div>
      <p className="mb-3 text-xs leading-5 text-slate-500">
        Mỗi dòng: TYPE | URL | Tiêu đề | Chú thích. TYPE gồm IMAGE, VIDEO,
        AUDIO, LINK hoặc FILE. VIDEO chấp nhận URL YouTube/Google Drive hoặc file MP4.
      </p>
      <textarea
        className={textareaClass}
        defaultValue={mediaText(items)}
        name="mediaLines"
        placeholder={"IMAGE | https://... | Ảnh tập thể | Buổi tổng kết\nVIDEO | https://youtu.be/... | Clip kỷ niệm |\nAUDIO | https://...mp3 | Nhạc nền album |"}
      />
      <label className="mt-3 block text-sm font-medium text-slate-700">
        Upload thêm ảnh, video hoặc audio
        <input
          accept="image/*,video/mp4,video/webm,audio/mpeg,audio/mp4,audio/wav,audio/ogg"
          className="mt-2 block h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          multiple
          name="mediaFiles"
          type="file"
        />
      </label>
      <p className="mt-2 text-xs text-slate-500">
        Ảnh tối đa 8MB; video hoặc audio tối đa 20MB mỗi file.
      </p>
    </div>
  );
}
