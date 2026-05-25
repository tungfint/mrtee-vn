import { ArrowLeft, BookOpenText, Camera, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

import { MediaGallery, type GalleryMediaItem } from "@/components/content/media-gallery";
import { AlbumShowcase } from "@/components/content/album-showcase";
import { MediaStrip } from "@/components/content/media-strip";
import { MemoryPostCard } from "@/components/content/memory-post-card";
import { RichContent } from "@/components/content/rich-content";
import { BackgroundCard } from "@/components/ui/background-card";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl } from "@/lib/media-urls";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallbackHero =
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80";

const fallbackStudents = [
  {
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-1",
    name: "Nguyễn Minh Anh",
    nickname: "Min",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-2",
    name: "Trần Quốc Bảo",
    nickname: "BaoJS",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-3",
    name: "Lê Gia Hân",
    nickname: "Hana",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-4",
    name: "Phạm Đức Long",
    nickname: "LongPy",
  },
];

const fallbackPosts = [
  {
    content: `
Tin2023 là một góc nhỏ có rất nhiều tiếng cười, những buổi chạy deadline dự án,
những tiết Tin có lúc nghiêm túc tuyệt đối và có lúc đầy những câu hỏi bất ngờ.

## Dấu mốc đáng nhớ

- Cùng nhau hoàn thành các dự án web đầu tiên.
- Có nhóm tham gia đội tuyển và hoạt động STEM.
- Lưu lại ảnh, video, file âm thanh và liên kết kỷ niệm theo từng năm.
`,
    contentFormat: "MARKDOWN" as const,
    id: "fallback-class-post",
    media: [
      {
        title: "Khoảnh khắc lớp học",
        type: "IMAGE" as const,
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "Một đoạn ghi âm kỷ niệm",
        type: "AUDIO" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
      },
    ],
    title: "Những ngày xanh của lớp",
  },
];

type MediaItemInput = {
  caption?: string | null;
  title?: string | null;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "LINK" | "FILE";
  url: string;
};

function mediaItems(items: MediaItemInput[]) {
  return items.map((item) => ({
    caption: item.caption ?? undefined,
    title: item.title ?? undefined,
    type: item.type,
    url: item.url,
  }));
}

async function loadClass(slug: string) {
  try {
    return await prisma.class.findUnique({
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
        memoryPosts: {
          include: { media: { orderBy: { sortOrder: "asc" } } },
          orderBy: { updatedAt: "desc" },
          where: { publishedAt: { not: null } },
        },
        students: {
          include: { profile: true },
          orderBy: { name: "asc" },
        },
      },
      where: { slug },
    });
  } catch {
    return null;
  }
}

export default async function ClassPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const classroom = await loadClass(slug);
  const className = classroom?.name ?? slug.toUpperCase();
  const students = classroom
    ? classroom.students.map((student) => ({
        avatar:
          student.profile?.coverImage ??
          student.profile?.avatar ??
          classroom.cardBackgroundImage ??
          fallbackHero,
        backgroundPosition:
          student.profile?.coverImageCrop ?? student.profile?.avatarCrop ?? "center",
        id: student.profile?.id ?? student.id,
        name: student.profile?.fullName ?? student.name ?? student.email,
        nickname: student.profile?.nickname ?? "",
      }))
    : fallbackStudents;
  const posts = classroom?.memoryPosts.length
    ? classroom.memoryPosts
    : fallbackPosts;
  const introductionPost =
    classroom?.memoryPosts.find((post) => post.type === "CLASS_INTRO") ?? posts[0];
  const storyPosts = posts.filter((post) => post.id !== introductionPost.id);
  const coverImage = classroom?.coverImage ?? fallbackHero;
  const albumImage = classroom?.cardBackgroundImage ?? coverImage;
  const albumItems: GalleryMediaItem[] = posts.flatMap((post) =>
    mediaItems(post.media),
  );

  if (!albumItems.some((item) => item.type === "IMAGE" || item.type === "VIDEO")) {
    albumItems.unshift({
      title: `Album ${className}`,
      type: "IMAGE",
      url: albumImage,
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${displayImageUrl(coverImage) ?? coverImage})`,
            backgroundPosition: classroom?.coverImageCrop ?? "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/38 to-transparent" />
        <ImageLightboxButton
          className="absolute right-5 top-5 z-20"
          imageUrl={coverImage}
          label="Xem ảnh bìa"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <Sparkles aria-hidden className="h-4 w-4" />
            Trang lớp học
          </p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">
            {className}
          </h1>
          <p className="slogan-type mt-5 max-w-3xl text-3xl leading-snug text-slate-100 sm:text-4xl">
            {classroom?.slogan ??
              "Code có thể sai rồi sửa, nhưng thanh xuân thì phải lưu lại thật đẹp."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-white/12 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
              href="/"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Trang chủ
            </Link>
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
                <p className="text-sm font-medium uppercase text-emerald-700">
                  Bài viết giới thiệu
                </p>
                <h2 className="text-2xl font-semibold">{introductionPost.title}</h2>
              </div>
            </div>
            <RichContent content={introductionPost.content} format={introductionPost.contentFormat} />
            <MediaStrip items={mediaItems(introductionPost.media)} />
            {classroom?.achievements ? (
              <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50/60 p-5">
                <h3 className="text-xl font-semibold text-slate-950">Thành tích</h3>
                <RichContent className="mt-3 text-slate-700" content={classroom.achievements} />
              </div>
            ) : null}
          </article>

          <aside className="feature-story-aside min-w-0 rounded-lg border border-cyan-100 bg-white/72 p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-medium uppercase text-emerald-700">Lưu bút</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                Bài viết và chia sẻ
              </h2>
            </div>
            <div className="feature-story-list grid gap-4">
              {storyPosts.length ? (
                storyPosts.slice(0, 4).map((post) => (
                  <MemoryPostCard compact key={post.id} label="Lưu bút lớp" post={post} />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  Chưa có bài lưu bút được công khai.
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-100">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Camera aria-hidden className="h-6 w-6 text-emerald-700" />
              <h2 className="text-3xl font-semibold">Album lớp</h2>
            </div>
            {classroom?.externalMediaUrl ? (
              <a
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-800"
                href={classroom.externalMediaUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink aria-hidden className="h-4 w-4" />
                Album ngoài
              </a>
            ) : null}
          </div>
          {classroom?.albums.length ? (
            <AlbumShowcase
              albums={classroom.albums.map((album) => ({
                ...album,
                items: mediaItems(album.items),
              }))}
            />
          ) : (
            <MediaGallery items={albumItems} title={`Album ${className}`} />
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase text-emerald-700">
              Thành viên
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Gương mặt trong lớp</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {students.map((student) => (
              <BackgroundCard
                backgroundImage={student.avatar}
                backgroundPosition={student.backgroundPosition}
                className="min-h-80 p-5 shadow-xl shadow-slate-900/15"
                key={student.id}
                overlayClassName="bg-gradient-to-t from-slate-950/12 via-transparent to-transparent"
                showImageAction
              >
                <div className="flex min-h-64 flex-col justify-end">
                  <Link
                    className="rounded-lg bg-white/94 p-4 shadow-lg backdrop-blur transition hover:bg-emerald-50"
                    href={`/student/${student.id}`}
                  >
                    <h3 className="text-lg font-semibold text-slate-950">{student.name}</h3>
                    {student.nickname ? (
                      <p className="mt-1 text-sm font-medium text-emerald-700">
                        {student.nickname}
                      </p>
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
