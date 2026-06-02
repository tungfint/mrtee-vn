import {
  ArrowLeft,
  BookOpenText,
  Camera,
  ExternalLink,
  Medal,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { PublicAdminSectionEditButton } from "@/components/admin/public-admin-section-edit-button";
import { MrTeeLogo } from "@/components/brand/mrtee-logo";
import { AlbumShowcase, type PublicAlbum } from "@/components/content/album-showcase";
import { MediaGallery, type GalleryMediaItem } from "@/components/content/media-gallery";
import { MediaStrip } from "@/components/content/media-strip";
import { MemoryPostCard } from "@/components/content/memory-post-card";
import { RichContent } from "@/components/content/rich-content";
import { BackgroundCard } from "@/components/ui/background-card";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl } from "@/lib/media-urls";
import type { PublicMediaInput } from "@/lib/public-media";
import { cn } from "@/lib/utils";

type ContentFormat = "MARKDOWN" | "HTML";

export type CollectionStory = {
  backgroundImage?: string | null;
  backgroundImageCrop?: string | null;
  content: string;
  contentFormat?: ContentFormat;
  coverImage?: string | null;
  coverImageCrop?: string | null;
  excerpt?: string | null;
  id: string;
  media?: PublicMediaInput[];
  slug?: string | null;
  title: string;
};

export type CollectionMember = {
  avatar?: string | null;
  backgroundPosition?: string | null;
  href?: string;
  id: string;
  name: string;
  nickname?: string | null;
  role?: string | null;
};

type YearLink = {
  href: string;
  label: string;
  active?: boolean;
};

type CollectionPageProps = {
  achievements: {
    content: string;
    title?: string;
  };
  albumExternalUrl?: string | null;
  albumItems: GalleryMediaItem[];
  albums?: PublicAlbum[];
  albumTitle: string;
  backHref: string;
  backLabel: string;
  badgeLabel: string;
  description: string;
  heroImage: string;
  heroImagePosition?: string | null;
  intro: {
    content: string;
    format?: ContentFormat;
    media?: GalleryMediaItem[];
    title: string;
  };
  members: CollectionMember[];
  memberEyebrow: string;
  memberTitle: string;
  pageKind: "class" | "team";
  storyEmptyText: string;
  storyLabel: string;
  stories: CollectionStory[];
  title: string;
  videoItems: GalleryMediaItem[];
  videoSectionEyebrow: string;
  videoSectionTitle: string;
  videoTitle: string;
  yearLinks?: YearLink[];
};

export function CollectionPage({
  achievements,
  albumExternalUrl,
  albumItems,
  albums,
  albumTitle,
  backHref,
  backLabel,
  badgeLabel,
  description,
  heroImage,
  heroImagePosition,
  intro,
  members,
  memberEyebrow,
  memberTitle,
  pageKind,
  storyEmptyText,
  storyLabel,
  stories,
  title,
  videoItems,
  videoSectionEyebrow,
  videoSectionTitle,
  videoTitle,
  yearLinks = [],
}: CollectionPageProps) {
  const BadgeIcon = pageKind === "team" ? Medal : Sparkles;
  const compactHero = pageKind === "team";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative min-h-[440px] overflow-hidden bg-slate-950 text-white lg:min-h-[501px]">
        <div
          className="absolute inset-0 scale-[1.02] bg-cover"
          style={{
            backgroundImage: `url(${displayImageUrl(heroImage) ?? heroImage})`,
            backgroundPosition: heroImagePosition ?? "center",
          }}
        />
        <div
          className={cn(
            "absolute inset-0",
            compactHero
              ? "bg-gradient-to-r from-slate-950/72 via-slate-950/24 to-transparent"
              : "bg-gradient-to-r from-slate-950/88 via-slate-950/48 to-slate-950/12",
          )}
        />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/48 to-transparent" />
        <ImageLightboxButton
          className="absolute right-5 top-5 z-20"
          imageUrl={heroImage}
          label="Xem ảnh bìa"
        />
        <div className="relative mx-auto flex min-h-[min(66vh,640px)] max-w-7xl flex-col px-5 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between border-b border-white/16 py-5">
            <MrTeeLogo className="rounded-md bg-white/90 px-2 py-1 shadow-sm ring-1 ring-white/60" size="sm" />
            <p className="font-code hidden text-sm font-semibold text-cyan-50 sm:block">
              If you never try, you&apos;ll never know!
            </p>
          </header>
          <div className={cn("flex flex-1 py-10", compactHero ? "items-end" : "items-end sm:py-14")}>
            <div
              className={cn(
                "rounded-lg bg-slate-950/24 ring-1 ring-white/14 backdrop-blur-[2px]",
                compactHero ? "max-w-xl p-4" : "max-w-4xl p-5 sm:p-6",
              )}
            >
              <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
                <BadgeIcon aria-hidden className="h-4 w-4" />
                {badgeLabel}
              </p>
              <h1 className={cn("mt-4 font-semibold", compactHero ? "text-3xl sm:text-4xl" : "text-4xl sm:text-6xl")}>
                {title}
              </h1>
              <p
                className={cn(
                  "mt-5 max-w-3xl text-slate-100",
                  compactHero ? "line-clamp-2 text-sm leading-7 sm:text-base" : "text-base leading-8 sm:text-lg",
                )}
              >
                {description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-white/20 py-5">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-white/12 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20"
              href={backHref}
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {backLabel}
            </Link>
            {yearLinks.map((link) => (
              <Link
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition",
                  link.active
                    ? "bg-white font-semibold text-slate-950"
                    : "bg-white/12 font-medium text-white ring-1 ring-white/20 hover:bg-white/20",
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="feature-story-layout mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
          <article className="gallery-scroll max-h-[920px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-cyan-100/70 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
                <BookOpenText aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">
                  Bài viết giới thiệu
                </p>
                <h2 className="text-2xl font-semibold">{intro.title}</h2>
              </div>
            </div>
            <RichContent content={intro.content} format={intro.format} />
            <MediaStrip items={intro.media ?? []} />
            <div className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-800">
                <Trophy aria-hidden className="h-5 w-5" />
                <h3 className="text-lg font-semibold">{achievements.title ?? "Thành tích"}</h3>
              </div>
              <RichContent className="text-slate-700" content={achievements.content} />
            </div>
          </article>

          <aside className="feature-story-aside gallery-scroll max-h-[920px] min-w-0 overflow-y-auto rounded-lg border border-cyan-100 bg-white/78 p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <UsersRound aria-hidden className="h-6 w-6 text-emerald-700" />
              <div>
                <p className="text-sm font-medium uppercase text-emerald-700">Lưu bút</p>
                <h2 className="text-2xl font-semibold text-slate-950">Bài viết và chia sẻ</h2>
              </div>
            </div>
            <div className="feature-story-list grid gap-4">
              {stories.length ? (
                stories.map((post) => (
                  <MemoryPostCard compact key={post.id} label={storyLabel} post={post} />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
                  {storyEmptyText}
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="gallery-scroll max-h-[1180px] overflow-y-auto border-b border-slate-200 bg-slate-100 lg:max-h-[1260px]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Camera aria-hidden className="h-6 w-6 text-emerald-700" />
              <h2 className="text-3xl font-semibold">{albumTitle}</h2>
            </div>
            <PublicAdminSectionEditButton label="Sửa album ảnh" section="albums" />
            {albumExternalUrl ? (
              <a
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
                href={albumExternalUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink aria-hidden className="h-4 w-4" />
                Album ngoài
              </a>
            ) : null}
          </div>
          {albums?.length ? (
            <AlbumShowcase albums={albums} />
          ) : (
            <MediaGallery constrainGridHeight items={albumItems} title={albumTitle} />
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Camera aria-hidden className="h-6 w-6 text-emerald-700" />
              <div>
              <p className="text-sm font-medium uppercase text-emerald-700">
                {videoSectionEyebrow}
              </p>
              <h2 className="text-3xl font-semibold text-slate-950">{videoSectionTitle}</h2>
              </div>
            </div>
            <PublicAdminSectionEditButton label="Sửa video" section="videos" />
          </div>
          <AlbumShowcase
            albums={[
              {
                id: `${title}-videos`,
                imageFolderUrl: null,
                items: videoItems,
                playlist: null,
                title: videoTitle,
                videoFolderUrl: null,
                viewMode: "GRID",
              },
            ]}
          />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase text-emerald-700">{memberEyebrow}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{memberTitle}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => (
              <Link
                className="group block h-full transition hover:-translate-y-0.5"
                href={member.href ?? `/student/${member.id}`}
                key={member.id}
              >
                <BackgroundCard
                  backgroundImage={member.avatar}
                  backgroundPosition={member.backgroundPosition}
                  className="min-h-80 p-5 shadow-xl shadow-slate-900/12 group-hover:shadow-emerald-900/20"
                  overlayClassName="bg-gradient-to-t from-slate-950/12 via-transparent to-transparent"
                  showImageAction={false}
                >
                  <div className="flex min-h-64 flex-col justify-end">
                    <div
                      className="rounded-lg bg-white/94 p-4 shadow-lg backdrop-blur transition group-hover:bg-emerald-50"
                  >
                    {member.role ? (
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        {member.role}
                      </p>
                    ) : null}
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">{member.name}</h3>
                    {member.nickname ? (
                      <p className="mt-1 text-sm font-medium text-emerald-700">
                        {member.nickname}
                      </p>
                    ) : null}
                    </div>
                  </div>
                </BackgroundCard>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
