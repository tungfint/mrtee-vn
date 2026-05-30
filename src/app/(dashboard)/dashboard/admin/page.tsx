import {
  GraduationCap,
  House,
  Images,
  Pencil,
  Plus,
  Music2,
  Newspaper,
  BookOpenText,
  Trophy,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const cards = [
  {
    href: "/dashboard/admin/home",
    label: "Trang chủ",
    description:
      "Quản lý nhanh bài viết nổi bật, album hình ảnh và album video đang xuất hiện ở ngoài trang chủ.",
    icon: House,
    key: "home",
    addHref: "/dashboard/admin/home",
    addLabel: "Thêm/sửa trang chủ",
    editHref: "/dashboard/admin/home",
  },
  {
    href: "/dashboard/admin/classes",
    label: "Lớp học",
    description:
      "Quản lý theo từng lớp: thông tin lớp, ảnh, thành viên, import CSV/Excel và bài viết trong lớp.",
    icon: GraduationCap,
    key: "classes",
    addHref: "/dashboard/admin/classes/new",
    editHref: "/dashboard/admin/classes",
  },
  {
    href: "/dashboard/admin/students",
    label: "Học sinh",
    description:
      "Tạo link thông tin, link bài viết, đổi token và xuất danh sách link để gửi riêng cho học sinh.",
    icon: UsersRound,
    key: "students",
    addHref: "/dashboard/admin/students",
    addLabel: "Tạo link",
    editHref: "/dashboard/admin/students",
  },
  {
    href: "/dashboard/admin/teams",
    label: "Đội tuyển",
    description:
      "Quản lý trang giới thiệu đội tuyển, từng năm, thành viên, ảnh/video và bài viết theo năm.",
    icon: Trophy,
    key: "teams",
    addHref: "/dashboard/admin/teams/new",
    editHref: "/dashboard/admin/teams",
  },
  {
    href: "/dashboard/admin/posts",
    label: "Bài viết blog",
    description:
      "Thêm và sửa các bài viết blog ngoài trang chủ, đặt ảnh cover, ảnh nền card và trạng thái xuất bản.",
    icon: Newspaper,
    key: "posts",
    addHref: "/dashboard/admin/posts",
    addLabel: "Thêm bài",
    editHref: "/dashboard/admin/posts",
  },
  {
    href: "/dashboard/admin/memories",
    label: "Giới thiệu / lưu bút",
    description:
      "Thêm và sửa bài giới thiệu lớp, bài chia sẻ đội tuyển, lưu bút và bài viết gắn với học sinh.",
    icon: BookOpenText,
    key: "memories",
    addHref: "/dashboard/admin/memories",
    addLabel: "Thêm bài",
    editHref: "/dashboard/admin/memories",
  },
  {
    href: "/dashboard/admin/albums",
    label: "Album",
    description:
      "Theo dõi album của lớp và đội tuyển, mở nhanh nơi sửa slideshow, folder Drive và playlist.",
    icon: Images,
    key: "albums",
    addHref: "/dashboard/admin/albums",
    addLabel: "Thêm album",
    editHref: "/dashboard/admin/albums",
  },
  {
    href: "/dashboard/admin/music",
    label: "Nhạc nền",
    description:
      "Tạo playlist phát trên website, sắp bài và chọn danh sách mặc định cho người xem.",
    icon: Music2,
    key: "playlists",
    addHref: "/dashboard/admin/music",
    addLabel: "Thêm playlist",
    editHref: "/dashboard/admin/music",
  },
];

export default async function AdminPage() {
  await requireAdmin();

  const [classes, students, teams, albums, playlists, posts, memories, home] = await Promise.all([
    prisma.class.count(),
    prisma.studentPage.count(),
    prisma.team.count(),
    prisma.album.count(),
    prisma.musicPlaylist.count(),
    prisma.post.count(),
    prisma.memoryPost.count(),
    Promise.all([
      prisma.post.count({ where: { showOnHome: true } }),
      prisma.memoryPost.count({ where: { showOnHome: true } }),
      prisma.album.count({ where: { showOnHome: true } }),
    ]).then(([posts, memories, homeAlbums]) => posts + memories + homeAlbums),
  ]);

  const counts = { albums, classes, home, memories, playlists, posts, students, teams };

  return (
    <AdminShell
      description="Khu vực dành riêng cho ADMIN. Mọi nội dung được tổ chức quanh trang chủ, lớp học, học sinh, đội tuyển, album và nhạc nền."
      title="Quản trị nội dung"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={card.href}
            >
              <div className="mb-8 flex items-start justify-between gap-3">
                <Link
                  className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                  href={card.href}
                >
                  <Icon aria-hidden className="h-5 w-5" />
                </Link>
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                    href={card.addHref}
                  >
                    <Plus aria-hidden className="h-3.5 w-3.5" />
                    {card.addLabel ?? "Thêm"}
                  </Link>
                  <Link
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    href={card.editHref}
                  >
                    <Pencil aria-hidden className="h-3.5 w-3.5" />
                    Sửa
                  </Link>
                </div>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Link className="text-lg font-semibold hover:text-emerald-800" href={card.href}>
                    {card.label}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>
                </div>
                <span className="text-3xl font-semibold text-emerald-700">
                  {counts[card.key as keyof typeof counts]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
