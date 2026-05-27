import { CollectionPage, type CollectionMember, type CollectionStory } from "@/components/content/collection-page";
import type { GalleryMediaItem } from "@/components/content/media-gallery";
import { prisma } from "@/lib/prisma";
import { collectVideoItems, toGalleryItems, uniqueMediaItems } from "@/lib/public-media";

export const dynamic = "force-dynamic";

const fallbackHero =
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80";

const fallbackClassVideo: GalleryMediaItem = {
  title: "Video kỷ niệm lớp học",
  type: "VIDEO",
  url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
};

const fallbackAchievements =
  "## Dấu mốc đáng nhớ\n\n- Cùng nhau hoàn thành những dự án đầu tiên.\n- Lưu lại ảnh, video và các câu chuyện của lớp.\n- Tiếp tục viết thêm những kỷ niệm mới trong các năm tiếp theo.";

const fallbackStudents: CollectionMember[] = [
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

function fallbackStories(className: string): CollectionStory[] {
  return [
    {
      content: `${className} có rất nhiều khoảnh khắc nhỏ đáng nhớ: một buổi học muộn, một lần debug cả nhóm, một cuộc thi và những câu chuyện sau giờ học.`,
      contentFormat: "MARKDOWN" as const,
      excerpt: "Một câu chuyện nhỏ được giữ lại để phần lưu bút luôn có hình hài trọn vẹn.",
      id: "fallback-story-1",
      media: [],
      slug: null,
      title: "Một ngày đáng nhớ",
    },
    {
      content: "Những bức ảnh, đoạn video và lời nhắn sẽ tiếp tục được cập nhật khi lớp có thêm nội dung mới.",
      contentFormat: "MARKDOWN" as const,
      excerpt: "Không gian chờ cho những bài viết, lời nhắn và kỷ niệm mới của lớp.",
      id: "fallback-story-2",
      media: [],
      slug: null,
      title: "Góc lưu bút",
    },
    {
      content: "Mỗi thành viên đều có một hành trình riêng, nhưng khi đặt cạnh nhau sẽ thành câu chuyện chung của cả lớp.",
      contentFormat: "MARKDOWN" as const,
      excerpt: "Một block minh họa để giữ bố cục đồng đều khi dữ liệu thật chưa đủ.",
      id: "fallback-story-3",
      media: [],
      slug: null,
      title: "Những người bạn",
    },
    {
      content: "Trang này sẽ đẹp hơn khi được lấp đầy bằng ảnh thật, video thật và những câu chuyện do chính lớp viết.",
      contentFormat: "MARKDOWN" as const,
      excerpt: "Nội dung minh họa có thể được thay thế sau trong trang quản trị.",
      id: "fallback-story-4",
      media: [],
      slug: null,
      title: "Chờ câu chuyện tiếp theo",
    },
  ];
}

function fallbackPosts(className: string, introduction?: string | null): CollectionStory[] {
  return [
    {
      content:
        introduction ||
        `${className} là một góc nhỏ có rất nhiều tiếng cười, những buổi chạy deadline dự án, những tiết Tin có lúc nghiêm túc tuyệt đối và có lúc đầy những câu hỏi bất ngờ.\n\n## Dấu mốc đáng nhớ\n\n- Cùng nhau hoàn thành các dự án web đầu tiên.\n- Có nhóm tham gia đội tuyển và hoạt động STEM.\n- Lưu lại ảnh, video, file âm thanh và liên kết kỷ niệm theo từng năm.`,
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
      slug: null,
      title: introduction ? `Giới thiệu ${className}` : "Những ngày xanh của lớp",
    },
  ];
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
  const coverImage = classroom?.coverImage ?? fallbackHero;
  const albumImage = classroom?.cardBackgroundImage ?? coverImage;
  const posts = classroom?.memoryPosts.length
    ? classroom.memoryPosts
    : fallbackPosts(className, classroom?.introduction);
  const introductionPost =
    classroom?.memoryPosts.find((post) => post.type === "CLASS_INTRO") ?? posts[0];
  const storyPosts = [
    ...posts.filter((post) => post.id !== introductionPost.id),
    ...fallbackStories(className),
  ].slice(0, 4);
  const realStudents: CollectionMember[] = classroom
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
    : [];
  const members = [...realStudents, ...fallbackStudents].slice(0, Math.max(4, realStudents.length));
  const albumItems = uniqueMediaItems(posts.flatMap((post) => toGalleryItems(post.media ?? [])));

  if (!albumItems.some((item) => item.type === "IMAGE" || item.type === "VIDEO")) {
    albumItems.unshift({
      title: `Album ${className}`,
      type: "IMAGE",
      url: albumImage,
    });
  }

  return (
    <CollectionPage
      achievements={{
        content: classroom?.achievements ?? fallbackAchievements,
      }}
      albumExternalUrl={classroom?.externalMediaUrl}
      albumItems={albumItems}
      albums={classroom?.albums.map((album) => ({
        ...album,
        constrainGridHeight: true,
        items: toGalleryItems(album.items),
      }))}
      albumTitle="Album lớp"
      backHref="/"
      backLabel="Trang chủ"
      badgeLabel="Trang lớp học"
      description={
        classroom?.slogan ??
        "Code có thể sai rồi sửa, nhưng thanh xuân thì phải lưu lại thật đẹp."
      }
      heroImage={coverImage}
      heroImagePosition={classroom?.coverImageCrop}
      intro={{
        content: introductionPost.content,
        format: introductionPost.contentFormat,
        media: toGalleryItems(introductionPost.media ?? []),
        title: introductionPost.title,
      }}
      members={members}
      memberEyebrow="Thành viên"
      memberTitle="Gương mặt trong lớp"
      pageKind="class"
      stories={storyPosts}
      storyEmptyText="Chưa có bài lưu bút được công khai."
      storyLabel="Lưu bút lớp"
      title={className}
      videoItems={collectVideoItems(
        albumItems,
        classroom?.albums.map((album) => album.items) ?? [],
        fallbackClassVideo,
      )}
      videoSectionEyebrow="Video lớp"
      videoSectionTitle={`Video tổng hợp của ${className}`}
      videoTitle={`Tất cả video ${className}`}
    />
  );
}
