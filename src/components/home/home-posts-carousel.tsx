"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

import { BackgroundCard } from "@/components/ui/background-card";

export type HomePostItem = {
  backgroundImage?: string | null;
  backgroundImageCrop?: string | null;
  coverImage?: string | null;
  coverImageCrop?: string | null;
  excerpt?: string | null;
  href: string;
  label: string;
  title: string;
};

export function HomePostsCarousel({
  posts,
  title,
}: {
  posts: HomePostItem[];
  title: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollPosts(direction: "left" | "right") {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    scroller.scrollBy({
      behavior: "smooth",
      left: direction === "left" ? -scroller.clientWidth * 0.82 : scroller.clientWidth * 0.82,
    });
  }

  if (!posts.length) {
    return null;
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase text-emerald-700">{title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Bài viết và câu chuyện</h2>
        </div>
        {posts.length > 3 ? (
          <div className="flex items-center gap-2">
            <button
              aria-label="Bài viết trước"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => scrollPosts("left")}
              type="button"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            <button
              aria-label="Bài viết tiếp theo"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              onClick={() => scrollPosts("right")}
              type="button"
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="-mx-5 flex snap-x gap-5 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
        ref={scrollerRef}
      >
        {posts.map((post, index) => {
          const image = post.coverImage ?? post.backgroundImage;

          return (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="min-w-[78%] snap-center sm:min-w-[46%] lg:min-w-[31%] xl:min-w-[29%]"
              initial={{ opacity: 0, y: 12 }}
              key={`${post.href}-${index}`}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <Link className="group block transition hover:-translate-y-0.5" href={post.href}>
                <BackgroundCard
                  backgroundImage={image}
                  backgroundPosition={post.coverImageCrop ?? post.backgroundImageCrop ?? "center"}
                  className="min-h-72 p-5 shadow-xl shadow-slate-900/15 group-hover:shadow-emerald-900/20"
                  overlayClassName={image ? "bg-gradient-to-t from-white/16 via-transparent to-transparent" : "bg-white"}
                >
                  <div className="flex min-h-60 flex-col justify-end">
                    <div className="rounded-md border border-white/45 bg-white/74 p-4 text-slate-950 shadow-lg backdrop-blur-[2px] transition group-hover:bg-white/84">
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        {post.label}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                        {post.excerpt ?? "Một câu chuyện được lưu lại trên mrtee.vn."}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        <Newspaper aria-hidden className="h-4 w-4" />
                        Đọc tiếp
                        <ArrowRight aria-hidden className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </BackgroundCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
