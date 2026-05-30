"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { defaultHomeHeroSlides, type HomeHeroSlide } from "@/lib/home-hero-slides";
import { displayImageUrl } from "@/lib/media-urls";

const introLines = [
  "Nơi lưu giữ kỷ niệm của các lớp học và các thế hệ học sinh của thầy Tùng.",
  "Những câu chuyện trưởng thành sẽ tiếp tục được viết từ đây, và mãi về sau.",
];

export function HomeHeroCarousel({
  slides = defaultHomeHeroSlides,
}: {
  slides?: HomeHeroSlide[];
}) {
  const heroSlides = slides.length ? slides : defaultHomeHeroSlides;
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const active = heroSlides[activeIndex] ?? heroSlides[0];

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [autoPlay, heroSlides.length]);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {heroSlides.map((slide, index) => (
        <div
          aria-hidden
          className={
            index === activeIndex
              ? "absolute inset-0 bg-cover opacity-100 transition-opacity duration-700"
              : "absolute inset-0 bg-cover opacity-0 transition-opacity duration-700"
          }
          key={`${slide.image}-${index}`}
          style={{
            backgroundImage: `url(${displayImageUrl(slide.image) ?? slide.image})`,
            backgroundPosition: slide.imageCrop ?? "50% 50%",
          }}
        />
      ))}
      <div className="absolute inset-0 bg-slate-950/10" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-slate-950/82 via-slate-950/28 to-transparent" />

      <div className="relative mx-auto flex min-h-[min(84vh,820px)] max-w-7xl flex-col px-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-5 border-b border-white/16 py-5">
          <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-slate-950/38 px-3 py-2 shadow-lg shadow-slate-950/20 ring-1 ring-white/16 backdrop-blur-sm sm:flex-nowrap sm:gap-5">
            <Link
              className="font-code shrink-0 text-base font-semibold tracking-wide text-white drop-shadow sm:text-2xl"
              href="/"
            >
              mrtee.vn
            </Link>
            <span aria-hidden className="hidden h-5 w-px shrink-0 bg-white/24 sm:block" />
            <p className="slogan-type min-w-0 flex-1 text-[13px] leading-4 text-white drop-shadow sm:truncate sm:text-2xl sm:leading-none">
              If you never try, you&apos;ll never know!
            </p>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-slate-100 lg:flex">
            <Link className="hover:text-emerald-200" href="/tin2023">Tin2023</Link>
            <Link className="hover:text-emerald-200" href="/tin2326">Tin2326</Link>
            <Link className="hover:text-emerald-200" href="/hsg-tin">Đội tuyển</Link>
            <Link className="hover:text-emerald-200" href="/blog">Blog</Link>
          </nav>
        </header>

        <div className="flex flex-1 items-end pt-16 pb-6 sm:pt-20 sm:pb-8">
          <div className="w-fit max-w-3xl">
            <div className="rounded-r-xl border-l-2 border-emerald-300/90 bg-slate-950/[0.48] px-4 py-3 shadow-lg shadow-slate-950/20 backdrop-blur-[2px] sm:px-5 sm:py-3.5">
              <div className="grid gap-0.5 font-code text-sm font-medium leading-6 text-white sm:text-[15px] sm:leading-6 md:text-base md:leading-7">
                {introLines.map((line) => (
                  <p key={line} className="md:whitespace-nowrap">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-white/20 py-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="font-code text-sm text-cyan-100">
              {String(activeIndex + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
            </span>
            <p className="max-w-xl text-sm font-medium text-white">{active.caption}</p>
          </div>
          <div className="flex items-center gap-2">
            <ImageLightboxButton imageUrl={active.image} label="Xem ảnh banner" />
            <button
              aria-label="Ảnh trước"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-950/34 ring-1 ring-white/28 hover:bg-white/18"
              onClick={() => setActiveIndex((activeIndex - 1 + heroSlides.length) % heroSlides.length)}
              type="button"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950/34 px-3 text-xs font-medium ring-1 ring-white/28 hover:bg-white/18"
              onClick={() => setAutoPlay((value) => !value)}
              type="button"
            >
              {autoPlay ? <Pause aria-hidden className="h-3.5 w-3.5" /> : <Play aria-hidden className="h-3.5 w-3.5" />}
              {autoPlay ? "Dừng" : "Chạy"}
            </button>
            <button
              aria-label="Ảnh tiếp theo"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-950/34 ring-1 ring-white/28 hover:bg-white/18"
              onClick={() => setActiveIndex((activeIndex + 1) % heroSlides.length)}
              type="button"
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
