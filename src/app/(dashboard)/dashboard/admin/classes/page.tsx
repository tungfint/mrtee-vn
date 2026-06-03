import { Plus } from "lucide-react";
import Link from "next/link";

import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { OrderableContentGrid } from "@/components/admin/orderable-content-grid";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteClassAction, reorderClassesAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  await requireAdmin();

  const classes = await prisma.class.findMany({
    include: {
      _count: { select: { members: true, memoryPosts: true, students: true } },
      monitor: { select: { email: true, name: true } },
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  });

  return (
    <AdminShell
      description="Chọn lớp cần chỉnh sửa hoặc tạo lớp mới. Form chi tiết được tách sang trang riêng để dễ nhìn và dễ thao tác hơn."
      title="Quản lý lớp học"
    >
      <AdminPanel title="Lớp học">
        <OrderableContentGrid
          action={reorderClassesAction}
          addCard={(
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
          )}
          deleteAction={deleteClassAction}
          deleteFieldName="classId"
          deleteLabel="Xóa lớp"
          deleteMessage="Album, bài viết, link học sinh và liên kết thành viên của lớp này sẽ bị xóa. Tài khoản/hồ sơ học sinh vẫn được giữ nếu không xóa riêng."
          items={classes.map((item) => ({
            backgroundImage: item.cardBackgroundImage ?? item.coverImage,
            backgroundPosition: item.cardBackgroundImageCrop ?? item.coverImageCrop,
            description: `${item._count.members || item._count.students} thành viên · ${item._count.memoryPosts} bài viết`,
            href: `/dashboard/classes/${item.id}/edit`,
            id: item.id,
            meta: item.monitor
              ? `Lớp trưởng: ${item.monitor.name ?? item.monitor.email}`
              : "Chưa chọn lớp trưởng",
            title: item.name,
          }))}
        />
      </AdminPanel>
    </AdminShell>
  );
}
