import { Plus } from "lucide-react";
import Link from "next/link";

import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { OrderableContentGrid } from "@/components/admin/orderable-content-grid";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteTeamAction, reorderTeamsAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  await requireAdmin();

  const teams = await prisma.team.findMany({
    include: {
      _count: { select: { memoryPosts: true, members: true } },
      monitor: { select: { email: true, name: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { category: "asc" }, { year: "desc" }],
  });

  return (
    <AdminShell
      description="Chọn đội tuyển/năm cần chỉnh sửa hoặc tạo khối đội tuyển mới. Mỗi năm có thông tin, thành viên, gallery và bài viết riêng."
      title="Quản lý đội tuyển"
    >
      <AdminPanel title="Đội tuyển">
        <OrderableContentGrid
          action={reorderTeamsAction}
          addCard={(
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
          )}
          deleteAction={deleteTeamAction}
          deleteFieldName="teamId"
          deleteLabel="Xóa đội"
          deleteMessage="Album, bài viết, link học sinh và liên kết thành viên của đội này sẽ bị xóa. Hồ sơ học sinh vẫn được giữ nếu không xóa riêng."
          items={teams.map((team) => ({
            backgroundImage: team.cardBackgroundImage ?? team.coverImage,
            backgroundPosition: team.cardBackgroundImageCrop ?? team.coverImageCrop,
            description: `${team._count.members} thành viên · ${team._count.memoryPosts} bài viết`,
            href: `/dashboard/teams/${team.id}/edit`,
            id: team.id,
            meta: team.monitor
              ? `Đội trưởng: ${team.monitor.name ?? team.monitor.email}`
              : "Chưa chọn đội trưởng",
            title: `${team.category} · ${team.year}`,
          }))}
        />
      </AdminPanel>
    </AdminShell>
  );
}
