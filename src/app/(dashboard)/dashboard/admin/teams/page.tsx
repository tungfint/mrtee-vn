import { Plus, Trophy } from "lucide-react";
import Link from "next/link";

import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { BackgroundCard } from "@/components/ui/background-card";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  await requireAdmin();

  const teams = await prisma.team.findMany({
    include: {
      _count: { select: { memoryPosts: true, members: true } },
      monitor: { select: { email: true, name: true } },
    },
    orderBy: [{ category: "asc" }, { year: "desc" }],
  });

  return (
    <AdminShell
      description="Chọn đội tuyển/năm cần chỉnh sửa hoặc tạo khối đội tuyển mới. Mỗi năm có thông tin, thành viên, gallery và bài viết riêng."
      title="Quản lý đội tuyển"
    >
      <AdminPanel title="Đội tuyển">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            className="flex min-h-56 flex-col justify-between rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-5 text-emerald-900 shadow-sm transition hover:-translate-y-1 hover:bg-emerald-100"
            href="/dashboard/admin/teams/new"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm">
              <Plus aria-hidden className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Thêm đội tuyển</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Tạo khối đội tuyển theo nhóm và năm, chọn đội trưởng và ảnh bìa.
              </p>
            </div>
          </Link>

          {teams.map((team) => (
            <Link href={`/dashboard/teams/${team.id}/edit`} key={team.id}>
              <BackgroundCard
                backgroundImage={team.cardBackgroundImage ?? team.coverImage}
                backgroundPosition={
                  team.cardBackgroundImageCrop ?? team.coverImageCrop ?? "center"
                }
                className="min-h-56 p-5 shadow-xl shadow-slate-900/10"
                overlayClassName="bg-slate-950/55"
              >
                <div className="flex min-h-44 flex-col justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/95 text-emerald-700 shadow-sm">
                    <Trophy aria-hidden className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg bg-white/92 p-4 shadow-lg backdrop-blur">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {team.category} · {team.year}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {team._count.members} thành viên ·{" "}
                      {team._count.memoryPosts} bài viết
                    </p>
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {team.monitor
                        ? `Đội trưởng: ${team.monitor.name ?? team.monitor.email}`
                        : "Chưa chọn đội trưởng"}
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
