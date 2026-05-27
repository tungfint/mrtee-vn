"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl } from "@/lib/media-urls";

const introLines = [
  "Nơi lưu giữ kỷ niệm của các lớp học và các thế hệ học sinh của thầy Tùng.",
  "Những câu chuyện trưởng thành sẽ tiếp tục được viết từ đây, và mãi về sau.",
];

const slides = [
  {
    caption: "Tin2023 · Kỷ niệm cấp 3 là thứ càng trưởng thành càng thấy quý giá.",
    image:
      "https://drive.google.com/open?id=1rnXV8ZvdHMOxiEunF_jEy4e9F_Z_WYDt&usp=drive_fs",
  },
  {
    caption: "Tin2326 · Điều đẹp nhất của tuổi trẻ là đã từng cùng nhau đi qua nó.",
    image:
      "https://drive.google.com/open?id=17wypm_VMME-9YY6QK4DwX4InLsM1vvOt&usp=drive_fs",
  },
  {
    caption: "Đội tuyển Tin · Thanh xuân đôi khi chỉ là một phòng học đầy tiếng gõ bàn phím.",
    image:
      "https://drive.google.com/open?id=1sQJrXZKqE9KmkEJ_gWCAyGf75VU6D--F&usp=drive_fs",
  },
  {
    caption: "Đội tuyển Robotics FTC · Nơi từng có bảng trắng, máy tính và cả một bầu trời thanh xuân.",
    image:
      "https://drive.google.com/open?id=1Y8Zdj0kMM_QppxzTsH1N7UqZprZT-Rnb&usp=drive_fs",
  },
  {
    caption: "Đội tuyển AI · Thanh xuân của dân Tin: deadline, contest và những đêm không ngủ.",
    image:
      "https://drive.google.com/open?id=1Uwn6Q24bxQNnWKU_xOLnwphqCzG2uXxr&usp=drive_fs",
  },
  {
    caption: "Đội tuyển Robotics FTC · Robot có thể chạy bằng động cơ, còn chúng ta chạy bằng đam mê.",
    image:
      "https://drive.google.com/open?id=1A2Fcf4HAdmdzZXPd391xVF3R6nhm8BVz&usp=drive_fs",
  },
  {
    caption: "Đội tuyển AI · Code, robot, AI và những giấc mơ chưa giới hạn.",
    image:
      "https://drive.google.com/open?id=11XTbGqwgxzRd8J4NwfUEy6_FpRdxEfDK&usp=drive_fs",
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
              ? "absolute inset-0 bg-cover bg-center opacity-100 transition-opacity duration-700"
              : "absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-700"
          }
          key={slide.image}
          style={{ backgroundImage: `url(${displayImageUrl(slide.image) ?? slide.image})` }}
        />
      ))}
      <div className="absolute inset-0 bg-slate-950/10" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-slate-950/82 via-slate-950/28 to-transparent" />

      <div className="relative mx-auto flex min-h-[min(84vh,820px)] max-w-7xl flex-col px-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-5 border-b border-white/16 py-5">
          <div className="flex min-w-0 items-center gap-3 rounded-md bg-slate-950/38 px-3 py-2 shadow-lg shadow-slate-950/20 ring-1 ring-white/16 backdrop-blur-sm sm:gap-5">
            <Link
              className="font-code shrink-0 text-lg font-semibold tracking-wide text-white drop-shadow sm:text-2xl"
              href="/"
            >
              mrtee.vn
            </Link>
            <span aria-hidden className="hidden h-5 w-px shrink-0 bg-white/24 sm:block" />
            <p className="slogan-type min-w-0 truncate text-lg leading-none text-white drop-shadow sm:text-2xl">
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
              {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <p className="max-w-xl text-sm font-medium text-white">{active.caption}</p>
          </div>
          <div className="flex items-center gap-2">
            <ImageLightboxButton imageUrl={active.image} label="Xem ảnh banner" />
            <button
              aria-label="Ảnh trước"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-950/34 ring-1 ring-white/28 hover:bg-white/18"
              onClick={() => setActiveIndex((activeIndex - 1 + slides.length) % slides.length)}
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
              onClick={() => setActiveIndex((activeIndex + 1) % slides.length)}
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
