import { ArrowLeft, BookOpenText, Camera, Medal, Trophy, UsersRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamCategory } from "@prisma/client";

import { MediaGallery, type GalleryMediaItem } from "@/components/content/media-gallery";
import { AlbumShowcase } from "@/components/content/album-showcase";
import { MemoryPostCard } from "@/components/content/memory-post-card";
import { RichContent } from "@/components/content/rich-content";
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

function galleryItems(
  team: {
    galleryImages: string[];
    memoryPosts: {
      media: {
        caption?: string | null;
        title?: string | null;
        type: GalleryMediaItem["type"];
        url: string;
      }[];
    }[];
  },
  fallbackImage: string,
) {
  const items: GalleryMediaItem[] = team.galleryImages.map((url, index) => ({
    title: `Khoảnh khắc ${index + 1}`,
    type: "IMAGE",
    url,
  }));

  for (const post of team.memoryPosts) {
    items.push(
      ...post.media.map((item) => ({
        caption: item.caption ?? undefined,
        title: item.title ?? undefined,
        type: item.type,
        url: item.url,
      })),
    );
  }

  if (!items.some((item) => item.type === "IMAGE" || item.type === "VIDEO")) {
    items.unshift({ title: "Ảnh đội tuyển", type: "IMAGE", url: fallbackImage });
  }

  return items.filter(
    (item, index) => items.findIndex((candidate) => candidate.url === item.url) === index,
  );
}

export default async function TeamYearPage({
  params,
}: {
  params: Promise<{ category: string; year: string }>;
}) {
  const { category, year } = await params;
  const teamCategory = categoryFromSlug(category);
  const yearNumber = Number(year);

  if (!teamCategory || !Number.isInteger(yearNumber)) {
    notFound();
  }

  const [team, availableYears] = await Promise.all([
    prisma.team.findUnique({
      include: {
        albums: {
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
          orderBy: { sortOrder: "asc" },
          where: { published: true },
        },
        members: {
          include: { studentProfile: true },
          orderBy: { createdAt: "asc" },
        },
        memoryPosts: {
          include: { media: { orderBy: { sortOrder: "asc" } } },
          orderBy: { updatedAt: "desc" },
          where: { publishedAt: { not: null } },
        },
      },
      where: { category_year: { category: teamCategory, year: yearNumber } },
    }),
    prisma.team.findMany({
      orderBy: { year: "desc" },
      select: { year: true },
      where: { category: teamCategory },
    }),
  ]);

  if (!team) {
    notFound();
  }

  const teamName = formatTeamName(category);
  const heroImage =
    team.backgroundImage ?? team.coverImage ?? team.cardBackgroundImage ?? fallbackHero;
  const albumItems = galleryItems(team, heroImage);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${displayImageUrl(heroImage) ?? heroImage})`,
            backgroundPosition: team.backgroundImageCrop ?? team.coverImageCrop ?? "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/38 to-transparent" />
        <ImageLightboxButton
          className="absolute right-5 top-5 z-20"
          imageUrl={heroImage}
          label="Xem ảnh bìa"
        />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <Medal aria-hidden className="h-4 w-4" />
            {teamName}
          </p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">Năm {team.year}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
            {team.description ?? "Hồ sơ hoạt động và lưu bút của đội tuyển trong năm học này."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-white/12 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
              href={`/${category}`}
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Các năm
            </Link>
            {availableYears.map((available) => (
              <Link
                className={
                  available.year === team.year
                    ? "rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-950"
                    : "rounded-md bg-white/12 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/20"
                }
                href={`/${category}/${available.year}`}
                key={available.year}
              >
                {available.year}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="feature-story-layout mx-auto grid max-w-7xl gap-6 px-5 py-10 sm:px-8 lg:px-10">
          <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-cyan-100/70 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
                <BookOpenText aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">Bài viết giới thiệu</p>
                <h2 className="text-2xl font-semibold">{teamName} {team.year}</h2>
              </div>
            </div>
            <RichContent content={team.introContent ?? team.description ?? ""} format={team.introFormat} />
            {team.achievements ? (
              <div className="mt-7 rounded-lg border border-emerald-100 bg-emerald-50/60 p-5">
                <div className="mb-3 flex items-center gap-2 text-emerald-800">
                  <Trophy aria-hidden className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Thành tích</h3>
                </div>
                <RichContent className="text-slate-700" content={team.achievements} />
              </div>
            ) : null}
          </article>

          <aside className="feature-story-aside min-w-0 rounded-lg border border-cyan-100 bg-white/72 p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <UsersRound aria-hidden className="h-6 w-6 text-emerald-700" />
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">Lưu bút</p>
                <h2 className="text-2xl font-semibold">Bài viết và chia sẻ</h2>
              </div>
            </div>
            <div className="feature-story-list grid gap-4">
              {team.memoryPosts.length ? (
                team.memoryPosts.slice(0, 4).map((post) => (
                  <MemoryPostCard compact key={post.id} label={`${team.year} · Chia sẻ`} post={post} />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  Chưa có bài viết được công khai trong năm này.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="mb-6 flex items-center gap-3">
            <Camera aria-hidden className="h-6 w-6 text-emerald-700" />
            <h2 className="text-3xl font-semibold">Album đội tuyển</h2>
          </div>
          {team.albums.length ? (
            <AlbumShowcase
              albums={team.albums.map((album) => ({
                ...album,
                items: album.items.map((item) => ({
                  caption: item.caption ?? undefined,
                  title: item.title ?? undefined,
                  type: item.type,
                  url: item.url,
                })),
              }))}
            />
          ) : (
            <MediaGallery items={albumItems} title={`Album ${teamName} ${team.year}`} />
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase text-emerald-700">Thành viên</p>
            <h2 className="mt-2 text-3xl font-semibold">Gương mặt trong đội</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.members.map((member) => (
              <BackgroundCard
                backgroundImage={member.studentProfile.coverImage ?? member.studentProfile.avatar}
                backgroundPosition={
                  member.studentProfile.coverImageCrop ??
                  member.studentProfile.avatarCrop ??
                  "center"
                }
                className="min-h-80 p-5 shadow-xl shadow-slate-900/12"
                key={member.id}
                overlayClassName="bg-gradient-to-t from-slate-950/12 via-transparent to-transparent"
                showImageAction
              >
                <div className="flex min-h-64 flex-col justify-end">
                  <Link
                    className="rounded-md bg-white/94 p-4 shadow-md transition hover:bg-emerald-50"
                    href={`/student/${member.studentProfile.id}`}
                  >
                    {member.role ? (
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        {member.role}
                      </p>
                    ) : null}
                    <h3 className="mt-1 text-lg font-semibold">{member.studentProfile.fullName}</h3>
                    {member.studentProfile.nickname ? (
                      <p className="mt-1 text-sm text-slate-600">{member.studentProfile.nickname}</p>
                    ) : null}
                  </Link>
                </div>
              </BackgroundCard>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
