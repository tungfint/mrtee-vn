import { Images, Plus } from "lucide-react";
import Link from "next/link";

import { AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { ConfirmActionButton } from "@/components/admin/confirm-action-button";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteAlbumAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminAlbumsPage() {
  await requireAdmin();

  const [albums, classes, teams] = await Promise.all([
    prisma.album.findMany({
      include: {
        _count: { select: { items: true } },
        class: { select: { id: true, name: true } },
        playlist: { select: { name: true } },
        team: { select: { category: true, id: true, year: true } },
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
    prisma.class.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.team.findMany({
      orderBy: [{ category: "asc" }, { year: "desc" }],
      select: { category: true, id: true, year: true },
    }),
  ]);

  return (
    <AdminShell
      description="Album được quản lý trong từng lớp hoặc từng năm đội tuyển để lớp trưởng/đội trưởng có thể cùng cập nhật đúng nội dung được phân công."
      title="Quản lý Album"
    >
      <AdminPanel title="Tạo album trong một trang nội dung">
        <div className="grid gap-3 sm:grid-cols-2">
          {classes.map((classroom) => (
            <Link
              className="flex items-center gap-3 rounded-md border border-slate-200 p-3 text-sm font-medium text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
              href={`/dashboard/classes/${classroom.id}/edit#class-albums`}
              key={classroom.id}
            >
              <Plus aria-hidden className="h-4 w-4 text-emerald-700" />
              {classroom.name}
            </Link>
          ))}
          {teams.map((team) => (
            <Link
              className="flex items-center gap-3 rounded-md border border-slate-200 p-3 text-sm font-medium text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
              href={`/dashboard/teams/${team.id}/edit#team-albums`}
              key={team.id}
            >
              <Plus aria-hidden className="h-4 w-4 text-emerald-700" />
              {team.category} {team.year}
            </Link>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel
        description="Mở album tại trang cha để sửa media, folder Drive hoặc playlist đi cùng."
        title="Các album hiện có"
      >
        <div className="grid gap-3">
          {albums.length ? (
            albums.map((album) => {
              const href = album.class
                ? `/dashboard/classes/${album.class.id}/edit#class-albums`
                : `/dashboard/teams/${album.team?.id}/edit#team-albums`;
              const owner = album.class?.name ?? `${album.team?.category} ${album.team?.year}`;

              return (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4 hover:border-emerald-300"
                  key={album.id}
                >
                  <Link className="flex min-w-0 flex-1 items-center gap-3" href={href}>
                    <Images aria-hidden className="h-5 w-5 shrink-0 text-emerald-700" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{album.title}</p>
                      <p className="text-sm text-slate-500">{owner}</p>
                    </div>
                  </Link>
                  <p className="text-sm text-slate-600">
                    {album._count.items} media · {album.playlist?.name ?? "Không playlist"} ·{" "}
                    {album.published ? "Public" : "Private"}
                  </p>
                  <form action={deleteAlbumAction}>
                    <input name="albumId" type="hidden" value={album.id} />
                    <ConfirmActionButton
                      label="Xóa album"
                      message={`Xóa album "${album.title}"? Toàn bộ media item trong album cũng sẽ bị xóa. Thao tác này không thể hoàn tác.`}
                    />
                  </form>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">Chưa có album nào.</p>
          )}
        </div>
      </AdminPanel>
    </AdminShell>
  );
}
