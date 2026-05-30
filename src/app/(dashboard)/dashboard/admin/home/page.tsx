import { AlbumViewMode, MediaType, TeamCategory } from "@prisma/client";
import { ExternalLink, Eye, Film, ImageIcon, Newspaper } from "lucide-react";
import Link from "next/link";

import {
  ActionFeedback,
  AdminPanel,
  AdminShell,
  selectClass,
  textareaClass,
} from "@/components/admin/admin-shell";
import { ImageField } from "@/components/admin/image-field";
import { requireAdmin } from "@/lib/admin-auth";
import { getHomeHeroSlides } from "@/lib/home-hero-settings";
import type { HomeHeroSlide } from "@/lib/home-hero-slides";
import { getHomeSectionVisibility } from "@/lib/home-section-settings";
import { prisma } from "@/lib/prisma";
import {
  createHomeHeroSlideAction,
  deleteHomeHeroSlideAction,
  updateHomeAlbumVisibilityAction,
  updateHomeHeroSlideAction,
  updateHomePostVisibilityAction,
  updateHomeSectionVisibilityAction,
} from "../actions";

export const dynamic = "force-dynamic";

function teamName(category?: TeamCategory | null, year?: number | null) {
  if (!category || !year) return "Chưa gắn đội tuyển";
  if (category === TeamCategory.HSG_TIN) return `HSG Tin ${year}`;
  if (category === TeamCategory.FTC) return `FTC ${year}`;
  return `AI ${year}`;
}

function sourceLabel(album: {
  class: { name: string } | null;
  team: { category: TeamCategory; year: number } | null;
}) {
  return album.class?.name ?? teamName(album.team?.category, album.team?.year);
}

function albumEditHref(album: {
  class: { id: string } | null;
  team: { id: string } | null;
}) {
  if (album.class) return `/dashboard/classes/${album.class.id}/edit#class-albums`;
  if (album.team) return `/dashboard/teams/${album.team.id}/edit#team-albums`;
  return "/dashboard/admin/albums";
}

function dateLabel(value?: Date | null) {
  if (!value) return "Bản nháp";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function HomeStatus({
  enabled,
  published,
}: {
  enabled: boolean;
  published: boolean;
}) {
  if (enabled && published) {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        Đang hiện
      </span>
    );
  }

  if (enabled && !published) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        Bật nhưng chưa public
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Đang ẩn
    </span>
  );
}

export default async function AdminHomeContentPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  await requireAdmin();
  const feedback = await searchParams;

  const [posts, memories, albums, sectionVisibility, heroSlides] = await Promise.all([
    prisma.post.findMany({
      orderBy: [{ showOnHome: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        publishedAt: true,
        showOnHome: true,
        slug: true,
        title: true,
        updatedAt: true,
      },
    }),
    prisma.memoryPost.findMany({
      include: {
        class: { select: { name: true } },
        studentProfile: { select: { fullName: true } },
        team: { select: { category: true, year: true } },
      },
      orderBy: [{ showOnHome: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.album.findMany({
      include: {
        class: { select: { id: true, name: true } },
        items: { select: { type: true } },
        team: { select: { category: true, id: true, year: true } },
      },
      orderBy: [{ showOnHome: "desc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
    getHomeSectionVisibility(),
    getHomeHeroSlides(),
  ]);

  const postRows = [
    ...posts.map((post) => ({
      editHref: "/dashboard/admin/posts",
      href: `/blog/${post.slug}`,
      id: post.id,
      kind: "post" as const,
      meta: `Blog · ${dateLabel(post.publishedAt)}`,
      published: Boolean(post.publishedAt),
      showOnHome: post.showOnHome,
      title: post.title,
    })),
    ...memories.map((post) => ({
      editHref: "/dashboard/admin/memories",
      href: post.slug ? `/memory/${post.slug}` : null,
      id: post.id,
      kind: "memory" as const,
      meta: [
        post.class?.name,
        post.studentProfile?.fullName,
        teamName(post.team?.category, post.team?.year),
        dateLabel(post.publishedAt),
      ]
        .filter(Boolean)
        .join(" · "),
      published: Boolean(post.publishedAt),
      showOnHome: post.showOnHome,
      title: post.title,
    })),
  ].sort((left, right) => Number(right.showOnHome) - Number(left.showOnHome));

  const imageAlbums = albums.filter(
    (album) =>
      album.imageFolderUrl ||
      album.items.some((item) => item.type === MediaType.IMAGE),
  );
  const videoAlbums = albums.filter(
    (album) =>
      album.videoFolderUrl ||
      album.items.some((item) => item.type === MediaType.VIDEO),
  );

  return (
    <AdminShell
      description="Bật/tắt nhanh nội dung đang xuất hiện ở trang chủ: bài viết nổi bật, album ảnh tổng hợp và album video tổng hợp. Muốn sửa nội dung chi tiết thì mở trang quản lý gốc của bài viết hoặc album."
      title="Quản lý nội dung trang chủ"
    >
      <div className="grid gap-5">
        <ActionFeedback message={feedback.message} status={feedback.status} />
        <HomeHeroSlidesPanel slides={heroSlides} />
        <AdminPanel
          description="Ẩn/hiện nhanh các khối tổng hợp ở ngoài trang chủ. Các phần này vẫn giữ dữ liệu trong admin, chỉ thay đổi việc hiển thị cho người xem."
          title="Ẩn / hiện các khối tổng hợp"
        >
          <form
            action={updateHomeSectionVisibilityAction}
            className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3"
          >
            <label className="flex items-center gap-3 rounded-md bg-white p-3 text-sm font-medium text-slate-800 shadow-sm">
              <input
                defaultChecked={sectionVisibility.allPosts}
                name="allPosts"
                type="checkbox"
              />
              <span className="flex items-center gap-2">
                <Newspaper aria-hidden className="h-4 w-4 text-emerald-700" />
                Tất cả bài viết
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-md bg-white p-3 text-sm font-medium text-slate-800 shadow-sm">
              <input
                defaultChecked={sectionVisibility.allImages}
                name="allImages"
                type="checkbox"
              />
              <span className="flex items-center gap-2">
                <ImageIcon aria-hidden className="h-4 w-4 text-emerald-700" />
                Tất cả hình ảnh
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-md bg-white p-3 text-sm font-medium text-slate-800 shadow-sm">
              <input
                defaultChecked={sectionVisibility.allVideos}
                name="allVideos"
                type="checkbox"
              />
              <span className="flex items-center gap-2">
                <Film aria-hidden className="h-4 w-4 text-emerald-700" />
                Tất cả video
              </span>
            </label>
            <button
              className="inline-flex w-fit items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:col-span-3"
              type="submit"
            >
              <Eye aria-hidden className="h-4 w-4" />
              Lưu trạng thái hiển thị
            </button>
          </form>
        </AdminPanel>

        <AdminPanel
          description="Trang chủ chỉ hiển thị các bài đã xuất bản và được bật hiển thị ở đây. Nếu đã bật khối Tất cả bài viết thì trang chủ sẽ không hiện thêm khối bài viết nổi bật để tránh lặp."
          title="Bài viết ngoài trang chủ"
        >
          <div className="grid gap-3">
            {postRows.length ? (
              postRows.map((post) => (
                <form
                  action={updateHomePostVisibilityAction}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  key={`${post.kind}-${post.id}`}
                >
                  <input name="id" type="hidden" value={post.id} />
                  <input name="type" type="hidden" value={post.kind} />
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Newspaper aria-hidden className="h-4 w-4 text-emerald-700" />
                        <h3 className="font-semibold text-slate-950">{post.title}</h3>
                        <HomeStatus enabled={post.showOnHome} published={post.published} />
                      </div>
                      <p className="text-sm text-slate-600">{post.meta}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm font-medium">
                        {post.href ? (
                          <Link className="text-emerald-700 hover:text-emerald-900" href={post.href}>
                            Xem trang <ExternalLink aria-hidden className="ml-1 inline h-3.5 w-3.5" />
                          </Link>
                        ) : null}
                        <Link className="text-slate-700 hover:text-slate-950" href={post.editHref}>
                          Sửa chi tiết
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <input
                          defaultChecked={post.showOnHome}
                          name="showOnHome"
                          type="checkbox"
                        />
                        Hiển thị
                      </label>
                      <button
                        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        type="submit"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </form>
              ))
            ) : (
              <p className="text-sm text-slate-500">Chưa có bài viết nào.</p>
            )}
          </div>
        </AdminPanel>

        <HomeAlbumPanel albums={imageAlbums} mediaType="image" title="Album hình ảnh ngoài trang chủ" />
        <HomeAlbumPanel albums={videoAlbums} mediaType="video" title="Album video ngoài trang chủ" />
      </div>
    </AdminShell>
  );
}

function HomeAlbumPanel({
  albums,
  mediaType,
  title,
}: {
  albums: Array<{
    class: { id: string; name: string } | null;
    id: string;
    imageFolderUrl: string | null;
    items: Array<{ type: MediaType }>;
    published: boolean;
    showOnHome: boolean;
    team: { category: TeamCategory; id: string; year: number } | null;
    title: string;
    videoFolderUrl: string | null;
    viewMode: AlbumViewMode;
  }>;
  mediaType: "image" | "video";
  title: string;
}) {
  const Icon = mediaType === "image" ? ImageIcon : Film;

  return (
    <AdminPanel
      description="Bật Public và Hiển thị để chọn album nổi bật. Khối Tất cả hình ảnh / Tất cả video ở trang chủ vẫn có thể gom từ toàn bộ album public."
      title={title}
    >
      <div className="grid gap-3">
        {albums.length ? (
          albums.map((album) => {
            const mediaCount = album.items.filter((item) =>
              mediaType === "image"
                ? item.type === MediaType.IMAGE
                : item.type === MediaType.VIDEO,
            ).length;
            const folderEnabled =
              mediaType === "image" ? album.imageFolderUrl : album.videoFolderUrl;

            return (
              <form
                action={updateHomeAlbumVisibilityAction}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={`${mediaType}-${album.id}`}
              >
                <input name="id" type="hidden" value={album.id} />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Icon aria-hidden className="h-4 w-4 text-emerald-700" />
                      <h3 className="font-semibold text-slate-950">{album.title}</h3>
                      <HomeStatus enabled={album.showOnHome} published={album.published} />
                    </div>
                    <p className="text-sm text-slate-600">
                      {sourceLabel(album)} · {mediaCount} media
                      {folderEnabled ? " · có folder Drive" : ""}
                    </p>
                    <Link
                      className="mt-3 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-950"
                      href={albumEditHref(album)}
                    >
                      Sửa album gốc
                      <ExternalLink aria-hidden className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[130px_150px_auto] sm:items-end">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input defaultChecked={album.published} name="published" type="checkbox" />
                      Public
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input defaultChecked={album.showOnHome} name="showOnHome" type="checkbox" />
                      Hiển thị
                    </label>
                    <select
                      aria-label="Chế độ xem"
                      className={selectClass}
                      defaultValue={album.viewMode}
                      name="viewMode"
                    >
                      <option value={AlbumViewMode.SLIDE}>Slide</option>
                      <option value={AlbumViewMode.GRID}>Grid</option>
                    </select>
                    <button
                      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:col-start-3"
                      type="submit"
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </form>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">Chưa có album phù hợp.</p>
        )}
      </div>
    </AdminPanel>
  );
}

function HomeHeroSlidesPanel({ slides }: { slides: HomeHeroSlide[] }) {
  return (
    <AdminPanel
      description="Quản lý ảnh banner lớn ở đầu trang chủ. Mỗi slide có ảnh, vị trí crop và caption hiển thị ở thanh dưới banner."
      title="Slide ảnh banner trang chủ"
    >
      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <form
            action={updateHomeHeroSlideAction}
            className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4"
            key={`${slide.image}-${index}`}
          >
            <input name="index" type="hidden" value={index} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-950">
                Slide {String(index + 1).padStart(2, "0")}
              </h3>
              <button
                className="rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                formAction={deleteHomeHeroSlideAction}
                formNoValidate
                type="submit"
              >
                Xóa slide
              </button>
            </div>
            <ImageField
              cropName="imageCrop"
              defaultCrop={slide.imageCrop}
              defaultValue={slide.image}
              label="Ảnh banner"
              name="image"
              recommendedSize="1920 x 720px"
            />
            <label className="block text-sm font-medium text-slate-700">
              Caption
              <textarea
                className={textareaClass}
                defaultValue={slide.caption}
                name="caption"
                placeholder="Dòng mô tả hiển thị ở cuối banner"
              />
            </label>
            <button
              className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Lưu slide
            </button>
          </form>
        ))}

        <form
          action={createHomeHeroSlideAction}
          className="grid gap-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4"
        >
          <h3 className="text-base font-semibold text-slate-950">Thêm slide mới</h3>
          <ImageField
            cropName="imageCrop"
            label="Ảnh banner"
            name="image"
            recommendedSize="1920 x 720px"
          />
          <label className="block text-sm font-medium text-slate-700">
            Caption
            <textarea
              className={textareaClass}
              name="caption"
              placeholder="Dòng mô tả hiển thị ở cuối banner"
            />
          </label>
          <button
            className="w-fit rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            type="submit"
          >
            Thêm slide
          </button>
        </form>
      </div>
    </AdminPanel>
  );
}
