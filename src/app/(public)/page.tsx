import { MediaType, TeamCategory } from "@prisma/client";
import { BookImage, CalendarDays, Camera, GraduationCap } from "lucide-react";
import Link from "next/link";

import { AlbumShowcase } from "@/components/content/album-showcase";
import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";
import { HomeNavigation } from "@/components/home/home-navigation";
import { HomePostsCarousel, type HomePostItem } from "@/components/home/home-posts-carousel";
import { getHomeSectionVisibility } from "@/lib/home-section-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function loadHomeHighlights() {
  try {
    const [stories, blogPosts, album, allAlbums, allMediaPosts, classes, teams, sectionVisibility] = await Promise.all([
      prisma.memoryPost.findMany({
        include: { media: { orderBy: { sortOrder: "asc" } } },
        orderBy: { updatedAt: "desc" },
        where: { publishedAt: { not: null } },
      }),
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
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
        orderBy: [{ showOnHome: "desc" }, { updatedAt: "desc" }],
        where: { published: true, showOnHome: true },
      }),
      prisma.album.findMany({
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            where: { type: { in: [MediaType.IMAGE, MediaType.VIDEO] } },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        where: { published: true },
      }),
      prisma.memoryPost.findMany({
        include: {
          media: {
            orderBy: { sortOrder: "asc" },
            where: { type: { in: [MediaType.IMAGE, MediaType.VIDEO] } },
          },
        },
        orderBy: { updatedAt: "desc" },
        where: { publishedAt: { not: null } },
      }),
      prisma.class.findMany({
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: {
          cardBackgroundImage: true,
          cardBackgroundImageCrop: true,
          coverImage: true,
          coverImageCrop: true,
          id: true,
          introduction: true,
          name: true,
          slug: true,
          slogan: true,
        },
      }),
      prisma.team.findMany({
        orderBy: [{ displayOrder: "asc" }, { category: "asc" }, { year: "desc" }],
        select: {
          backgroundImage: true,
          backgroundImageCrop: true,
          cardBackgroundImage: true,
          cardBackgroundImageCrop: true,
          category: true,
          coverImage: true,
          coverImageCrop: true,
          description: true,
          id: true,
          year: true,
        },
      }),
      getHomeSectionVisibility(),
    ]);

    return { album, allAlbums, allMediaPosts, blogPosts, classes, sectionVisibility, stories, teams };
  } catch {
    return {
      album: null,
      allAlbums: [],
      allMediaPosts: [],
      blogPosts: [],
      classes: [],
      sectionVisibility: { allImages: true, allPosts: true, allVideos: true },
      stories: [],
      teams: [],
    };
  }
}

function teamSlug(category: TeamCategory) {
  if (category === TeamCategory.HSG_TIN) return "hsg-tin";
  if (category === TeamCategory.FTC) return "ftc";
  return "ai";
}

function teamTitle(category: TeamCategory) {
  if (category === TeamCategory.HSG_TIN) return "Đội tuyển HSG Tin";
  if (category === TeamCategory.FTC) return "Đội tuyển Robotics FTC";
  return "Đội tuyển AI";
}

function uniqueByUrl<T extends { url: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.url.trim();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export default async function HomePage() {
  const { album, allAlbums, allMediaPosts, blogPosts, classes, sectionVisibility, stories, teams } = await loadHomeHighlights();
  const teamItems = Array.from(
    new Map(teams.map((team) => [team.category, team])).values(),
  );
  const navigationItems = [
    ...classes.map((classroom) => ({
      backgroundImage: classroom.cardBackgroundImage ?? classroom.coverImage,
      backgroundPosition: classroom.cardBackgroundImageCrop ?? classroom.coverImageCrop,
      description:
        classroom.introduction ??
        classroom.slogan ??
        "Không gian lưu giữ hành trình, ảnh, video và lưu bút của lớp.",
      href: `/${classroom.slug}`,
      kind: "class" as const,
      title: classroom.name,
    })),
    ...teamItems.map((team) => ({
      backgroundImage: team.cardBackgroundImage ?? team.coverImage ?? team.backgroundImage,
      backgroundPosition:
        team.cardBackgroundImageCrop ?? team.coverImageCrop ?? team.backgroundImageCrop,
      description:
        team.description ??
        `Hành trình luyện tập, thi đấu và kỷ niệm qua các năm của ${teamTitle(team.category)}.`,
      href: `/${teamSlug(team.category)}`,
      kind: "team" as const,
      title: teamTitle(team.category),
    })),
    {
      backgroundImage:
        "https://drive.google.com/open?id=11wSOdKPYsSX2NkfEVfhGiXxUWuPZ8Ur5&usp=drive_fs",
      description: "Những chia sẻ, những câu chuyện và những kỷ niệm của chúng ta.",
      href: "/blog",
      kind: "blog" as const,
      title: "Blog",
    },
  ];
  const allPosts: HomePostItem[] = [
    ...stories.map((post) => ({
      backgroundImage: post.backgroundImage,
      backgroundImageCrop: post.backgroundImageCrop,
      coverImage: post.coverImage,
      coverImageCrop: post.coverImageCrop,
      excerpt: post.excerpt,
      href: `/memory/${post.slug}`,
      label: post.classId ? "Lớp học" : post.teamId ? "Đội tuyển" : "Lưu bút",
      title: post.title,
    })),
    ...blogPosts.map((post) => ({
      backgroundImage: post.backgroundImage,
      backgroundImageCrop: post.backgroundImageCrop,
      coverImage: post.coverImage,
      coverImageCrop: post.coverImageCrop,
      excerpt: post.excerpt,
      href: `/blog/${post.slug}`,
      label: "Blog",
      title: post.title,
    })),
  ].filter((post) => !post.href.endsWith("/null"));
  const featuredPosts = [
    ...stories.filter((post) => post.showOnHome).map((post) => ({
      backgroundImage: post.backgroundImage,
      backgroundImageCrop: post.backgroundImageCrop,
      coverImage: post.coverImage,
      coverImageCrop: post.coverImageCrop,
      excerpt: post.excerpt,
      href: `/memory/${post.slug}`,
      label: post.classId ? "Lớp học" : post.teamId ? "Đội tuyển" : "Lưu bút",
      title: post.title,
    })),
    ...blogPosts.filter((post) => post.showOnHome).map((post) => ({
      backgroundImage: post.backgroundImage,
      backgroundImageCrop: post.backgroundImageCrop,
      coverImage: post.coverImage,
      coverImageCrop: post.coverImageCrop,
      excerpt: post.excerpt,
      href: `/blog/${post.slug}`,
      label: "Blog",
      title: post.title,
    })),
  ].filter((post) => !post.href.endsWith("/null"));
  const imageItems = uniqueByUrl([
    ...allAlbums.flatMap((item) => item.items).filter((item) => item.type === MediaType.IMAGE),
    ...allMediaPosts.flatMap((post) => post.media).filter((item) => item.type === MediaType.IMAGE),
  ]).map((item) => ({
    caption: item.caption ?? undefined,
    title: item.title ?? undefined,
    type: "IMAGE" as const,
    url: item.url,
  }));
  const videoItems = uniqueByUrl([
    ...allAlbums.flatMap((item) => item.items).filter((item) => item.type === MediaType.VIDEO),
    ...allMediaPosts.flatMap((post) => post.media).filter((item) => item.type === MediaType.VIDEO),
  ]).map((item) => ({
    caption: item.caption ?? undefined,
    title: item.title ?? undefined,
    type: "VIDEO" as const,
    url: item.url,
  }));
  const imageFolderUrls = uniqueByUrl(
    allAlbums
      .filter((item) => item.imageFolderUrl)
      .map((item) => ({ title: item.title, url: item.imageFolderUrl ?? "" })),
  );
  const videoFolderUrls = uniqueByUrl(
    allAlbums
      .filter((item) => item.videoFolderUrl)
      .map((item) => ({ title: item.title, url: item.videoFolderUrl ?? "" })),
  );
  const showFeaturedAlbum =
    Boolean(album) && !sectionVisibility.allImages && !sectionVisibility.allVideos;

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
        <HomeNavigation items={navigationItems} />
      </section>

      {!sectionVisibility.allPosts && featuredPosts.length ? (
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <HomePostsCarousel posts={featuredPosts} title="Bài viết nổi bật" />
          </div>
        </section>
      ) : null}

      {sectionVisibility.allPosts && allPosts.length ? (
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <HomePostsCarousel posts={allPosts} title="Tất cả bài viết" />
          </div>
        </section>
      ) : null}

      {showFeaturedAlbum && album ? (
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

      {sectionVisibility.allImages && (imageItems.length || imageFolderUrls.length) ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <div className="mb-7 flex items-center gap-3">
              <Camera aria-hidden className="h-6 w-6 text-emerald-700" />
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">Tất cả hình ảnh</p>
                <h2 className="text-2xl font-semibold text-slate-950">Album tổng hợp từ các lớp học và đội tuyển</h2>
              </div>
            </div>
            <AlbumShowcase
              albums={[
                {
                  constrainGridHeight: true,
                  description: "Tự động gom toàn bộ ảnh từ các album public và media trong bài viết đã xuất bản.",
                  id: "all-home-images",
                  imageFolderUrls,
                  items: imageItems,
                  playlist: null,
                  title: "Tất cả hình ảnh",
                  videoFolderUrl: null,
                  viewMode: "GRID",
                },
              ]}
            />
          </div>
        </section>
      ) : null}

      {sectionVisibility.allVideos && (videoItems.length || videoFolderUrls.length) ? (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <div className="mb-7 flex items-center gap-3">
              <Camera aria-hidden className="h-6 w-6 text-emerald-700" />
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">Tất cả video</p>
                <h2 className="text-2xl font-semibold text-slate-950">Video tổng hợp từ các lớp học và đội tuyển</h2>
              </div>
            </div>
            <AlbumShowcase
              albums={[
                {
                  description: "Tự động gom toàn bộ video từ các album public và media trong bài viết đã xuất bản.",
                  id: "all-home-videos",
                  imageFolderUrl: null,
                  items: videoItems,
                  playlist: null,
                  title: "Tất cả video",
                  videoFolderUrls,
                  viewMode: "GRID",
                },
              ]}
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
