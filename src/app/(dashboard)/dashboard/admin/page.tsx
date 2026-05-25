import { GraduationCap, Trophy } from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const cards = [
  {
    href: "/dashboard/admin/classes",
    label: "Lớp học",
    description:
      "Quản lý theo từng lớp: thông tin lớp, ảnh, thành viên, import CSV/Excel và bài viết trong lớp.",
    icon: GraduationCap,
    key: "classes",
  },
  {
    href: "/dashboard/admin/teams",
    label: "Đội tuyển",
    description:
      "Quản lý trang giới thiệu đội tuyển, từng năm, thành viên, ảnh/video và bài viết theo năm.",
    icon: Trophy,
    key: "teams",
  },
];

export default async function AdminPage() {
  await requireAdmin();

  const [classes, teams] = await Promise.all([
    prisma.class.count(),
    prisma.team.count(),
  ]);

  const counts = { classes, teams };

  return (
    <AdminShell
      description="Khu vực dành riêng cho ADMIN. Mọi nội dung được tổ chức quanh hai mảng chính: lớp học và đội tuyển."
      title="Quản trị nội dung"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              href={card.href}
              key={card.href}
            >
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <Icon aria-hidden className="h-5 w-5" />
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{card.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>
                </div>
                <span className="text-3xl font-semibold text-emerald-700">
                  {counts[card.key as keyof typeof counts]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </AdminShell>
  );
}
