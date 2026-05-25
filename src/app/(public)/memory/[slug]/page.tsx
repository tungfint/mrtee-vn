import { ArrowLeft, BookOpenText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaStrip } from "@/components/content/media-strip";
import { RichContent } from "@/components/content/rich-content";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function teamSlug(category?: string) {
  if (category === "HSG_TIN") return "hsg-tin";
  if (category === "FTC") return "ftc";
  if (category === "AI") return "ai";
  return null;
}

export default async function MemoryPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.memoryPost.findFirst({
    include: {
      class: { select: { name: true, slug: true } },
      media: { orderBy: { sortOrder: "asc" } },
      studentProfile: { select: { fullName: true, id: true } },
      team: { select: { category: true, year: true } },
    },
    where: { publishedAt: { not: null }, slug },
  });

  if (!post) {
    notFound();
  }

  const relatedTeamSlug = teamSlug(post.team?.category);
  const backLink = post.class
    ? `/${post.class.slug}`
    : relatedTeamSlug && post.team
      ? `/${relatedTeamSlug}/${post.team.year}`
      : post.studentProfile
        ? `/student/${post.studentProfile.id}`
        : "/";
  const context = post.class?.name ??
    (relatedTeamSlug && post.team ? `${post.team.category.replace("_", " ")} ${post.team.year}` : null) ??
    post.studentProfile?.fullName ??
    "mrtee.vn";
  const heroImage = post.coverImage ?? post.backgroundImage;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="relative overflow-hidden bg-slate-950 text-white">
        {heroImage ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-42"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            <ImageLightboxButton
              className="absolute right-5 top-5 z-20"
              imageUrl={heroImage}
              label="Xem ảnh"
            />
          </>
        ) : null}
        <div className="absolute inset-0 bg-slate-950/56" />
        <div className="relative mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-100 hover:text-white"
            href={backLink}
          >
            <ArrowLeft aria-hidden className="h-4 w-4" />
            Quay lại {context}
          </Link>
          <p className="mt-10 inline-flex items-center gap-2 text-sm font-medium uppercase text-emerald-100">
            <BookOpenText aria-hidden className="h-4 w-4" />
            Bài viết và chia sẻ
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{post.title}</h1>
          {post.excerpt ? (
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100">{post.excerpt}</p>
          ) : null}
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <RichContent content={post.content} format={post.contentFormat} />
        <MediaStrip
          items={post.media.map((item) => ({
            caption: item.caption ?? undefined,
            title: item.title ?? undefined,
            type: item.type,
            url: item.url,
          }))}
        />
      </article>
    </main>
  );
}
