import { BookImage, CalendarDays, Camera, GraduationCap, MessagesSquare } from "lucide-react";
import Link from "next/link";

import { AlbumShowcase } from "@/components/content/album-showcase";
import { MemoryPostCard } from "@/components/content/memory-post-card";
import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";
import { HomeNavigation } from "@/components/home/home-navigation";
import { prisma } from "@/lib/prisma";

async function loadHomeHighlights() {
  try {
    const [stories, album] = await Promise.all([
      prisma.memoryPost.findMany({
        include: { media: { orderBy: { sortOrder: "asc" } } },
        orderBy: { updatedAt: "desc" },
        take: 3,
        where: { publishedAt: { not: null } },
      }),
      prisma.album.findFirst({
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          playlist: {
            include: {
              tracks: {
                orderBy: { sortOrder: "asc" },
                where: { enabled: true },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        where: { published: true },
      }),
    ]);

    return { album, stories };
  } catch {
    return { album: null, stories: [] };
  }
}

export default async function HomePage() {
  const { album, stories } = await loadHomeHighlights();

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

      {stories.length ? (
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <div className="mb-7 flex items-center gap-3">
              <MessagesSquare aria-hidden className="h-6 w-6 text-cyan-700" />
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">Ghi chép mới</p>
                <h2 className="text-2xl font-semibold text-slate-950">Những câu chuyện vừa được lưu lại</h2>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {stories.map((post) => (
                <MemoryPostCard key={post.id} label="Kỷ yếu số" post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {album ? (
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <div className="mb-7 flex items-center gap-3">
              <Camera aria-hidden className="h-6 w-6 text-emerald-700" />
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">Album nổi bật</p>
                <h2 className="text-2xl font-semibold text-slate-950">Ảnh và video từ những hành trình gần đây</h2>
              </div>
            </div>
            <AlbumShowcase
              albums={[
                {
                  ...album,
                  items: album.items.map((item) => ({
                    caption: item.caption ?? undefined,
                    title: item.title ?? undefined,
                    type: item.type,
                    url: item.url,
                  })),
                },
              ]}
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
