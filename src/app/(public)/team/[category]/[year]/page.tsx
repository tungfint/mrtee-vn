import { TeamCategory } from "@prisma/client";
import { notFound } from "next/navigation";

import { CollectionPage, type CollectionMember, type CollectionStory } from "@/components/content/collection-page";
import type { GalleryMediaItem } from "@/components/content/media-gallery";
import { prisma } from "@/lib/prisma";
import { collectVideoItems, toGalleryItems, uniqueMediaItems } from "@/lib/public-media";

export const dynamic = "force-dynamic";

const fallbackHero =
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1800&q=80";

const fallbackTeamVideo: GalleryMediaItem = {
  title: "Video kỷ niệm đội tuyển",
  type: "VIDEO",
  url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
};

const fallbackTeamAchievements =
  "## Dấu mốc đáng nhớ\n\n- Cùng nhau luyện tập, thi đấu và hoàn thành các dự án.\n- Lưu lại ảnh, video và câu chuyện của từng mùa hoạt động.\n- Tiếp tục cập nhật thành tích sau mỗi năm học.";

const fallbackTeamMembers: CollectionMember[] = [
  {
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-team-1",
    name: "Thành viên đội tuyển",
    nickname: "Coder",
    role: "Thành viên",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-team-2",
    name: "Gương mặt tiêu biểu",
    nickname: "Maker",
    role: "Thành viên",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-team-3",
    name: "Bạn đồng hành",
    nickname: "Teammate",
    role: "Thành viên",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
    backgroundPosition: "center",
    id: "demo-team-4",
    name: "Người kể chuyện",
    nickname: "Story",
    role: "Thành viên",
  },
];

function categoryFromSlug(category: string) {
  if (category === "hsg-tin") return TeamCategory.HSG_TIN;
  if (category === "ftc") return TeamCategory.FTC;
  if (category === "ai") return TeamCategory.AI;
  return null;
}

function formatTeamName(category: string) {
  if (category === "hsg-tin") return "Học sinh giỏi Tin";
  if (category === "ftc") return "FTC Robotics";
  if (category === "ai") return "AI Lab";
  return category;
}

function fallbackTeamStories(teamName: string, year: number): CollectionStory[] {
  return [
    {
      content: `${teamName} ${year} có những buổi luyện tập, thử nghiệm và hoàn thiện sản phẩm cùng nhau.`,
      contentFormat: "MARKDOWN" as const,
      excerpt: "Một câu chuyện minh họa cho hành trình luyện tập và thi đấu của đội tuyển.",
      id: "fallback-team-story-1",
      media: [],
      slug: null,
      title: "Một buổi luyện tập",
    },
    {
      content: "Những khoảnh khắc sau cuộc thi thường là phần đáng nhớ nhất của cả hành trình.",
      contentFormat: "MARKDOWN" as const,
      excerpt: "Không gian chờ cho ảnh, video và bài viết thật của đội tuyển.",
      id: "fallback-team-story-2",
      media: [],
      slug: null,
      title: "Sau cuộc thi",
    },
    {
      content: "Mỗi thành viên đóng góp một phần riêng để tạo nên tinh thần chung của đội.",
      contentFormat: "MARKDOWN" as const,
      excerpt: "Một block minh họa để giữ bố cục đồng đều khi dữ liệu chưa đủ.",
      id: "fallback-team-story-3",
      media: [],
      slug: null,
      title: "Tinh thần đồng đội",
    },
    {
      content: "Trang này sẽ tiếp tục được cập nhật bằng thành tích, hình ảnh và câu chuyện thật.",
      contentFormat: "MARKDOWN" as const,
      excerpt: "Nội dung minh họa có thể được thay thế sau trong trang quản trị.",
      id: "fallback-team-story-4",
      media: [],
      slug: null,
      title: "Chờ câu chuyện tiếp theo",
    },
  ];
}

function galleryItems(
  team: {
    galleryImages: string[];
    memoryPosts: { media: Parameters<typeof toGalleryItems>[0] }[];
  },
  fallbackImage: string,
) {
  const items: GalleryMediaItem[] = team.galleryImages.map((url, index) => ({
    title: `Khoảnh khắc ${index + 1}`,
    type: "IMAGE",
    url,
  }));

  for (const post of team.memoryPosts) {
    items.push(...toGalleryItems(post.media));
  }

  if (!items.some((item) => item.type === "IMAGE" || item.type === "VIDEO")) {
    items.unshift({ title: "Ảnh đội tuyển", type: "IMAGE", url: fallbackImage });
  }

  return uniqueMediaItems(items);
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
  const title = `${teamName} ${team.year}`;
  const heroImage =
    team.backgroundImage ?? team.coverImage ?? team.cardBackgroundImage ?? fallbackHero;
  const albumItems = galleryItems(team, heroImage);
  const realMembers: CollectionMember[] = team.members.map((member) => ({
    avatar: member.studentProfile.coverImage ?? member.studentProfile.avatar,
    backgroundPosition:
      member.studentProfile.coverImageCrop ?? member.studentProfile.avatarCrop ?? "center",
    id: member.studentProfile.id,
    name: member.studentProfile.fullName,
    nickname: member.studentProfile.nickname,
    role: member.role,
  }));
  const members = [...realMembers, ...fallbackTeamMembers].slice(0, Math.max(4, realMembers.length));

  return (
    <CollectionPage
      achievements={{
        content: team.achievements ?? fallbackTeamAchievements,
      }}
      albumItems={albumItems}
      albums={team.albums.map((album) => ({
        ...album,
        constrainGridHeight: true,
        items: toGalleryItems(album.items),
      }))}
      albumTitle="Album đội tuyển"
      backHref={`/${category}`}
      backLabel="Các năm"
      badgeLabel="Trang đội tuyển"
      description={
        team.description ??
        "Hồ sơ hoạt động, album và lưu bút của đội tuyển trong năm học này."
      }
      heroImage={heroImage}
      heroImagePosition={team.backgroundImageCrop ?? team.coverImageCrop}
      intro={{
        content: team.introContent ?? team.description ?? title,
        format: team.introFormat,
        title,
      }}
      members={members}
      memberEyebrow="Thành viên"
      memberTitle="Gương mặt trong đội"
      pageKind="team"
      stories={[...team.memoryPosts, ...fallbackTeamStories(teamName, team.year)].slice(0, 4)}
      storyEmptyText="Chưa có bài viết được công khai trong năm này."
      storyLabel={`${team.year} · Chia sẻ`}
      title={title}
      videoItems={collectVideoItems(
        albumItems,
        team.albums.map((album) => album.items),
        fallbackTeamVideo,
      )}
      videoSectionEyebrow="Video đội tuyển"
      videoSectionTitle={`Video tổng hợp ${title}`}
      videoTitle={`Tất cả video ${title}`}
      yearLinks={availableYears.map((available) => ({
        active: available.year === team.year,
        href: `/${category}/${available.year}`,
        label: String(available.year),
      }))}
    />
  );
}
