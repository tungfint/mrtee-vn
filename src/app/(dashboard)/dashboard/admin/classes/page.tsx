import { Plus, UsersRound } from "lucide-react";
import Link from "next/link";

import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { BackgroundCard } from "@/components/ui/background-card";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  await requireAdmin();

  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { memoryPosts: true, students: true } },
      monitor: { select: { email: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <AdminShell
      description="Chọn lớp cần chỉnh sửa hoặc tạo lớp mới. Form chi tiết được tách sang trang riêng để dễ nhìn và dễ thao tác hơn."
      title="Quản lý lớp học"
    >
      <AdminPanel title="Lớp học">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            className="flex min-h-56 flex-col justify-between rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-5 text-emerald-900 shadow-sm transition hover:-translate-y-1 hover:bg-emerald-100"
            href="/dashboard/admin/classes/new"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm">
              <Plus aria-hidden className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Thêm lớp mới</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Tạo lớp, chọn lớp trưởng, ảnh bìa, ảnh nền và thông tin ban đầu.
              </p>
            </div>
          </Link>

          {classes.map((item) => (
            <Link href={`/dashboard/classes/${item.id}/edit`} key={item.id}>
              <BackgroundCard
                backgroundImage={item.cardBackgroundImage ?? item.coverImage}
                backgroundPosition={
                  item.cardBackgroundImageCrop ?? item.coverImageCrop ?? "center"
                }
                className="min-h-56 p-5 shadow-xl shadow-slate-900/10"
                overlayClassName="bg-slate-950/55"
              >
                <div className="flex min-h-44 flex-col justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/95 text-emerald-700 shadow-sm">
                    <UsersRound aria-hidden className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg bg-white/92 p-4 shadow-lg backdrop-blur">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {item._count.students} thành viên ·{" "}
                      {item._count.memoryPosts} bài viết
                    </p>
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {item.monitor
                        ? `Lớp trưởng: ${item.monitor.name ?? item.monitor.email}`
                        : "Chưa chọn lớp trưởng"}
                    </p>
                  </div>
                </div>
              </BackgroundCard>
            </Link>
          ))}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
