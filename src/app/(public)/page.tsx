import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { HomeNavigation } from "@/components/home/home-navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-5 pb-12 pt-24 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
              <ShieldCheck aria-hidden className="h-4 w-4" />
              RBAC cho giáo viên, lớp trưởng và học sinh
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
              mrtee.vn
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
              Cuốn kỷ yếu số và portfolio của thầy Tee: nơi lưu giữ lớp chủ
              nhiệm, đội tuyển Tin học, dự án công nghệ và những dòng lưu bút
              rất riêng của học sinh.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/class/tin2023">
                  Xem lớp học
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/blog">Đọc blog</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10">
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
