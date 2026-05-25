import { Music2, Trash2 } from "lucide-react";

import {
  ActionFeedback,
  AdminPanel,
  AdminShell,
  Field,
  FormGrid,
  inputClass,
  textareaClass,
} from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

import {
  createPlaylistAction,
  deletePlaylistAction,
  updatePlaylistAction,
} from "../actions";

export const dynamic = "force-dynamic";

function trackLines(
  tracks: { artist: string | null; sortOrder: number; title: string; url: string }[],
) {
  return [...tracks]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((track) => `${track.title} | ${track.url} | ${track.artist ?? ""}`)
    .join("\n");
}

export default async function AdminMusicPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  await requireAdmin();
  const feedback = await searchParams;
  const playlists = await prisma.musicPlaylist.findMany({
    include: { tracks: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ isSiteDefault: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <AdminShell
      description="Tạo danh sách nhạc nền cho website hoặc chọn playlist dùng riêng trong từng Album. Link audio Google Drive có thể dán trực tiếp khi file đã public."
      title="Nhạc nền"
    >
      <ActionFeedback message={feedback.message} status={feedback.status} />
      <AdminPanel title="Danh sách phát">
        <div className="grid gap-4">
          {playlists.map((playlist) => (
            <details
              className="overflow-hidden rounded-md border border-slate-200 bg-slate-50"
              key={playlist.id}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100">
                <span className="flex items-center gap-2">
                  <Music2 aria-hidden className="h-4 w-4 text-emerald-700" />
                  {playlist.name}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {playlist.tracks.length} bài · {playlist.isSiteDefault ? "Mặc định website" : "Playlist album"}
                </span>
              </summary>
              <form action={updatePlaylistAction} className="grid gap-4 border-t border-slate-200 p-4">
                <input name="playlistId" type="hidden" value={playlist.id} />
                <FormGrid>
                  <Field label="Tên playlist">
                    <input className={inputClass} defaultValue={playlist.name} name="name" required />
                  </Field>
                  <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
                    <input defaultChecked={playlist.isSiteDefault} name="isSiteDefault" type="checkbox" />
                    Phát mặc định trên website
                  </label>
                </FormGrid>
                <Field label="Mô tả">
                  <textarea className={textareaClass} defaultValue={playlist.description ?? ""} name="description" />
                </Field>
                <Field label="Các bài nhạc">
                  <textarea className={textareaClass} defaultValue={trackLines(playlist.tracks)} name="tracks" />
                </Field>
                <p className="text-xs text-slate-500">
                  Mỗi dòng: Tên bài | URL audio hoặc link share Google Drive | Nghệ sĩ
                </p>
                <div className="flex gap-2">
                  <button className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800" type="submit">
                    Lưu playlist
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    formAction={deletePlaylistAction}
                    formNoValidate
                    type="submit"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </form>
            </details>
          ))}
        </div>
      </AdminPanel>
      <AdminPanel title="Thêm playlist">
        <form action={createPlaylistAction} className="grid gap-4">
          <FormGrid>
            <Field label="Tên playlist">
              <input className={inputClass} name="name" required />
            </Field>
            <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
              <input name="isSiteDefault" type="checkbox" />
              Phát mặc định trên website
            </label>
          </FormGrid>
          <Field label="Mô tả">
            <textarea className={textareaClass} name="description" />
          </Field>
          <Field label="Các bài nhạc">
            <textarea
              className={textareaClass}
              name="tracks"
              placeholder="Tên bài | https://drive.google.com/file/d/.../view?usp=sharing | Nghệ sĩ"
            />
          </Field>
          <button className="w-fit rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800" type="submit">
            Tạo playlist
          </button>
        </form>
      </AdminPanel>
    </AdminShell>
  );
}
