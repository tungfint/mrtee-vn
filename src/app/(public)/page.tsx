import { BookImage, CalendarDays, GraduationCap } from "lucide-react";
import Link from "next/link";

import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";
import { HomeNavigation } from "@/components/home/home-navigation";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <HomeHeroCarousel />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:px-8 md:grid-cols-3 lg:px-10">
          <div className="flex items-start gap-3">
            <GraduationCap aria-hidden className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold">Lớp chủ nhiệm</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Tin2023 và Tin2326, hồ sơ và lưu bút theo lớp.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CalendarDays aria-hidden className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold">Đội tuyển theo năm</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">HSG Tin 2024 - 2026, FTC và AI Lab.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <BookImage aria-hidden className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold">Ảnh, video và bài viết</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Album trình chiếu cùng những câu chuyện đáng nhớ.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase text-emerald-700">
              Điều hướng nhanh
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Lớp học, đội tuyển và bài viết
            </h2>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            Đăng nhập quản trị
          </Link>
        </div>
        <HomeNavigation />
      </section>
    </main>
  );
}
