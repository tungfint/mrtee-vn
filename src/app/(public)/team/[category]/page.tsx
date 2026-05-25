import { ArrowLeft, ArrowRight, Medal, UsersRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamCategory } from "@prisma/client";

import { BackgroundCard } from "@/components/ui/background-card";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl } from "@/lib/media-urls";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallbackHero =
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1800&q=80";

function categoryFromSlug(category: string) {
  if (category === "hsg-tin") return TeamCategory.HSG_TIN;
  if (category === "ftc") return TeamCategory.FTC;
  if (category === "ai") return TeamCategory.AI;
  return null;
}

function formatTeamName(category: string) {
  if (category === "hsg-tin") return "Học sinh giỏi - Tin";
  if (category === "ftc") return "FTC Robotics";
  if (category === "ai") return "AI Lab";
  return category;
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const teamCategory = categoryFromSlug(category);

  if (!teamCategory) {
    notFound();
  }

  const teams = await prisma.team.findMany({
    include: {
      _count: { select: { members: true, memoryPosts: true } },
    },
    orderBy: { year: "desc" },
    where: { category: teamCategory },
  });

  const latest = teams[0];
  const teamName = formatTeamName(category);
  const heroImage =
    latest?.backgroundImage ?? latest?.coverImage ?? latest?.cardBackgroundImage ?? fallbackHero;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${displayImageUrl(heroImage) ?? heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/36 to-transparent" />
        <ImageLightboxButton
          className="absolute right-5 top-5 z-20"
          imageUrl={heroImage}
          label="Xem ảnh bìa"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <Medal aria-hidden className="h-4 w-4" />
            Đội tuyển
          </p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">{teamName}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
            {latest?.description ??
              "Hành trình thi đấu, luyện tập và những kỷ niệm được lưu theo từng năm."}
          </p>
          <Link
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-white/12 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
            href="/"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Trang chủ
          </Link>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
          <div>
            <p className="text-sm font-medium uppercase text-emerald-700">Giới thiệu chung</p>
            <h2 className="mt-2 text-3xl font-semibold">Một đội tuyển, nhiều thế hệ</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              {teamName} là nơi học sinh rèn tư duy giải quyết vấn đề, cùng
              xây dự án và lưu lại hành trình của từng mùa hoạt động. Mỗi năm
              bên dưới có album, thành viên, thành tích và những câu chuyện riêng.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase text-slate-500">Số mùa lưu trữ</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-800">{teams.length}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase text-slate-500">Nội dung</p>
              <p className="mt-1 text-sm font-semibold">Ảnh · Video · Lưu bút</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mb-7">
          <p className="text-sm font-medium uppercase text-emerald-700">Theo năm học</p>
          <h2 className="mt-2 text-3xl font-semibold">Chọn một hành trình để xem</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Mỗi năm là một trang riêng với phần giới thiệu, album, thành viên,
            thành tích và các bài lưu bút của năm đó.
          </p>
        </div>

        {teams.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <BackgroundCard
                backgroundImage={
                  team.cardBackgroundImage ??
                  team.coverImage ??
                  team.backgroundImage ??
                  fallbackHero
                }
                backgroundPosition={
                  team.cardBackgroundImageCrop ?? team.coverImageCrop ?? "center"
                }
                className="min-h-80 p-5"
                key={team.id}
                overlayClassName="bg-gradient-to-t from-slate-950/20 via-transparent to-transparent"
                showImageAction
              >
                <div className="flex min-h-72 flex-col justify-end">
                  <div className="rounded-md bg-slate-950/62 p-5 text-white shadow-lg">
                    <p className="text-sm font-medium text-emerald-100">{teamName}</p>
                    <h3 className="mt-2 text-4xl font-semibold">{team.year}</h3>
                    <p className="mt-3 flex items-center gap-2 text-sm text-slate-100">
                      <UsersRound aria-hidden className="h-4 w-4" />
                      {team._count.members} thành viên · {team._count.memoryPosts} bài viết
                    </p>
                    <Link
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-emerald-100"
                      href={`/${category}/${team.year}`}
                    >
                      Mở trang năm {team.year}
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </BackgroundCard>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
            Chưa có năm hoạt động nào được công khai cho đội tuyển này.
          </div>
        )}
      </section>
    </main>
  );
}
