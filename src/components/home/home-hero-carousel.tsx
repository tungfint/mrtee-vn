"use client";

import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";

const slides = [
  {
    caption: "Tin2023 · Một thời áo trắng",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=80",
  },
  {
    caption: "Đội tuyển Tin · Hành trình luyện tập",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1800&q=80",
  },
  {
    caption: "STEM và công nghệ · Những dự án đầu tiên",
    image:
      "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1800&q=80",
  },
];

export function HomeHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const active = slides[activeIndex];

  useEffect(() => {
    if (!autoPlay) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(interval);
  }, [autoPlay]);

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {slides.map((slide, index) => (
        <div
          aria-hidden
          className={
            index === activeIndex
              ? "absolute inset-0 bg-cover bg-center opacity-48 transition-opacity duration-700"
              : "absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-700"
          }
          key={slide.image}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}
      <div className="absolute inset-0 bg-slate-950/46" />
      <ImageLightboxButton
        className="absolute right-5 top-5 z-20"
        imageUrl={active.image}
        label="Xem ảnh banner"
      />
      <div className="relative mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-between px-5 pb-10 pt-24 sm:px-8 lg:px-10">
        <div className="max-w-3xl pt-10">
          <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <ShieldCheck aria-hidden className="h-4 w-4" />
            If you never try, you'll never know!
          </p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">MrTee</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
            Nơi lưu giữ kỷ niệm của các lớp học và các thế hệ học sinh của thầy Tùng.
            <br />
            Những câu chuyện trưởng thành sẽ tiếp tục được viết từ đây, và còn mãi về sau...
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/tin2023">
                Xem lớp học
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/hsg-tin">Đội tuyển Tin</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/18 pt-5">
          <p className="text-sm font-medium text-white">{active.caption}</p>
          <div className="flex items-center gap-2">
            <button
              aria-label="Ảnh trước"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/25 hover:bg-white/20"
              onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
              type="button"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" />
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md bg-white/10 px-3 text-xs font-medium ring-1 ring-white/25 hover:bg-white/20"
              onClick={() => setAutoPlay((value) => !value)}
              type="button"
            >
              {autoPlay ? <Pause aria-hidden className="h-3.5 w-3.5" /> : <Play aria-hidden className="h-3.5 w-3.5" />}
              {autoPlay ? "Dừng" : "Chạy"}
            </button>
            <button
              aria-label="Ảnh tiếp theo"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/25 hover:bg-white/20"
              onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
              type="button"
            >
              <ChevronRight aria-hidden className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
