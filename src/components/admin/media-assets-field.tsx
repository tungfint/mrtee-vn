import { Film, HardDrive, ImageIcon, Music2 } from "lucide-react";

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
        AUDIO, LINK hoặc FILE. Dán trực tiếp link Google Drive, YouTube,
        Cloudinary hoặc CDN để server chỉ lưu URL.
      </p>
      <textarea
        className={textareaClass}
        defaultValue={mediaText(items)}
        name="mediaLines"
        placeholder={
          "IMAGE | https://drive.google.com/file/d/... | Ảnh tập thể | Buổi tổng kết\nVIDEO | https://youtu.be/... | Clip kỷ niệm |\nAUDIO | https://drive.google.com/file/d/... | Nhạc nền album |"
        }
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
      <p className="mt-2 text-xs text-amber-700">
        Nên ưu tiên Google Drive/Cloudinary/CDN cho album lớn. Upload local sẽ
        lưu file vào hosting; ảnh tối đa 8MB, video/audio tối đa 20MB mỗi file.
      </p>
      <p className="mt-3 flex items-start gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-900">
        <HardDrive aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
        Nên lưu ảnh, video và audio trên Google Drive/Cloudinary/CDN rồi dán URL
        vào ô trên. Database chỉ lưu URL và metadata; file thật không được tải
        về database. Nếu upload local, database cũng chỉ lưu đường dẫn file.
      </p>
    </div>
  );
}
