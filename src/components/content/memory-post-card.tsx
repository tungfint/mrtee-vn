import { ArrowRight, BookOpenText, Images } from "lucide-react";
import Link from "next/link";

import { BackgroundCard } from "@/components/ui/background-card";

type MemoryPostPreview = {
  backgroundImage?: string | null;
  backgroundImageCrop?: string | null;
  content: string;
  coverImage?: string | null;
  coverImageCrop?: string | null;
  excerpt?: string | null;
  media?: unknown[];
  slug?: string | null;
  title: string;
};

function excerptFor(post: MemoryPostPreview) {
  if (post.excerpt) {
    return post.excerpt;
  }

  return post.content
    .replace(/[#>*_`\-[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 148);
}

export function MemoryPostCard({
  label = "Bài viết",
  post,
}: {
  label?: string;
  post: MemoryPostPreview;
}) {
  const image = post.coverImage ?? post.backgroundImage;

  return (
    <BackgroundCard
      backgroundImage={image}
      backgroundPosition={post.coverImageCrop ?? post.backgroundImageCrop ?? "center"}
      className="min-h-72 p-5"
      overlayClassName={image ? "bg-slate-950/34" : "bg-white"}
      showImageAction={Boolean(image)}
    >
      <div className="flex min-h-60 flex-col justify-end">
        <div className={image ? "rounded-md bg-slate-950/64 p-4 text-white" : "text-slate-950"}>
          <p className={image ? "text-xs font-semibold uppercase text-emerald-100" : "text-xs font-semibold uppercase text-emerald-700"}>
            {label}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
          <p className={image ? "mt-3 line-clamp-3 text-sm leading-6 text-slate-100" : "mt-3 line-clamp-3 text-sm leading-6 text-slate-600"}>
            {excerptFor(post)}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            {post.media?.length ? (
              <span className={image ? "inline-flex items-center gap-1 text-xs text-slate-100" : "inline-flex items-center gap-1 text-xs text-slate-500"}>
                <Images aria-hidden className="h-3.5 w-3.5" />
                {post.media.length} media
              </span>
            ) : (
              <BookOpenText aria-hidden className="h-4 w-4 text-emerald-600" />
            )}
            {post.slug ? (
              <Link
                className={image ? "inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-emerald-100" : "inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900"}
                href={`/memory/${post.slug}`}
              >
                Đọc tiếp
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </BackgroundCard>
  );
}
