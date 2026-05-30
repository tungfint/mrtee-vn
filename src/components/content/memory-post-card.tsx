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
  compact = false,
  label = "Bài viết",
  post,
}: {
  compact?: boolean;
  label?: string;
  post: MemoryPostPreview;
}) {
  const image = post.coverImage ?? post.backgroundImage;
  const card = (
    <BackgroundCard
      backgroundImage={image}
      backgroundPosition={post.coverImageCrop ?? post.backgroundImageCrop ?? "center"}
      className={compact ? "min-h-56 p-4" : "min-h-72 p-5"}
      overlayClassName={image ? "bg-gradient-to-t from-white/16 via-transparent to-transparent" : "bg-white"}
      showImageAction={false}
    >
      <div className={compact ? "flex min-h-48 flex-col justify-end" : "flex min-h-60 flex-col justify-end"}>
        <div className={image ? "rounded-md bg-white/74 p-4 text-slate-950 shadow-lg backdrop-blur-[2px]" : "text-slate-950"}>
          <p className="text-xs font-semibold uppercase text-emerald-700">{label}</p>
          <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
            {excerptFor(post)}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3">
            {post.media?.length ? (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Images aria-hidden className="h-3.5 w-3.5" />
                {post.media.length} media
              </span>
            ) : (
              <BookOpenText aria-hidden className="h-4 w-4 text-emerald-600" />
            )}
            {post.slug ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:text-emerald-900">
                Đọc tiếp
                <ArrowRight aria-hidden className="h-4 w-4" />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </BackgroundCard>
  );

  if (!post.slug) {
    return card;
  }

  return (
    <Link className="group block h-full transition hover:-translate-y-0.5" href={`/memory/${post.slug}`}>
      {card}
    </Link>
  );
}

