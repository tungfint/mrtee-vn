import { AlbumViewMode, type AlbumItem, type MusicPlaylist } from "@prisma/client";

import {
  Field,
  FormGrid,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/admin-shell";

type ManagedAlbum = {
  id: string;
  title: string;
  description: string | null;
  imageFolderUrl: string | null;
  videoFolderUrl: string | null;
  published: boolean;
  showOnHome: boolean;
  sortOrder: number;
  viewMode: AlbumViewMode;
  playlistId: string | null;
  items: AlbumItem[];
};

type AlbumAction = (formData: FormData) => Promise<void>;

function itemLines(items: AlbumItem[], types: AlbumItem["type"][]) {
  return [...items]
    .filter((item) => types.includes(item.type))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map(
      (item) =>
        `${item.type} | ${item.url} | ${item.title ?? ""} | ${item.caption ?? ""}`,
    )
    .join("\n");
}

function AlbumFields({
  album,
  playlists,
}: {
  album?: ManagedAlbum;
  playlists: Pick<MusicPlaylist, "id" | "name">[];
}) {
  return (
    <>
      <FormGrid>
        <Field label="Tên Album">
          <input
            className={inputClass}
            defaultValue={album?.title ?? ""}
            name="title"
            required
          />
        </Field>
        <Field label="Thứ tự hiển thị">
          <input
            className={inputClass}
            defaultValue={album?.sortOrder ?? 0}
            min="0"
            name="sortOrder"
            type="number"
          />
        </Field>
        <Field label="Playlist đi cùng album">
          <select
            className={selectClass}
            defaultValue={album?.playlistId ?? "none"}
            name="playlistId"
          >
            <option value="none">Không chọn playlist</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Chế độ xem">
          <select
            className={selectClass}
            defaultValue={album?.viewMode ?? AlbumViewMode.SLIDE}
            name="viewMode"
          >
            <option value={AlbumViewMode.SLIDE}>Slide</option>
            <option value={AlbumViewMode.GRID}>Grid</option>
          </select>
        </Field>
        <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
          <input defaultChecked={album?.published ?? true} name="published" type="checkbox" />
          Public album
        </label>
        <label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700">
          <input defaultChecked={album?.showOnHome ?? false} name="showOnHome" type="checkbox" />
          Hiển thị ở trang chủ
        </label>
      </FormGrid>
      <Field label="Mô tả album">
        <textarea
          className={textareaClass}
          defaultValue={album?.description ?? ""}
          name="description"
        />
      </Field>
      <FormGrid>
        <Field label="Folder ảnh Google Drive">
          <input
            className={inputClass}
            defaultValue={album?.imageFolderUrl ?? ""}
            name="imageFolderUrl"
            placeholder="Dán link share folder ảnh Google Drive"
          />
        </Field>
        <Field label="Folder video Google Drive">
          <input
            className={inputClass}
            defaultValue={album?.videoFolderUrl ?? ""}
            name="videoFolderUrl"
            placeholder="Dán link share folder video Google Drive"
          />
        </Field>
      </FormGrid>
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Ảnh trình chiếu (tự động chạy)">
          <textarea
            className={textareaClass}
            defaultValue={album ? itemLines(album.items, ["IMAGE"]) : ""}
            name="albumImages"
            placeholder={"IMAGE | link share ảnh | Tiêu đề | Chú thích\nIMAGE | link ảnh tiếp theo | Tiêu đề | Chú thích"}
          />
        </Field>
        <Field label="Video (người xem tự bấm phát)">
          <textarea
            className={textareaClass}
            defaultValue={album ? itemLines(album.items, ["VIDEO"]) : ""}
            name="albumVideos"
            placeholder={"VIDEO | link YouTube hoặc Google Drive | Tiêu đề | Chú thích\nVIDEO | link video tiếp theo | Tiêu đề | Chú thích"}
          />
        </Field>
      </div>
      <Field label="Audio / Link / File đính kèm">
        <textarea
          className={textareaClass}
          defaultValue={album ? itemLines(album.items, ["AUDIO", "LINK", "FILE"]) : ""}
          name="albumExtras"
          placeholder={"AUDIO | link share nhạc | Tiêu đề | Chú thích\nLINK | https://... | Tài liệu tham khảo |"}
        />
      </Field>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Dán trực tiếp link share Google Drive. Folder public sẽ hiển thị dạng thư mục duyệt ảnh/video;
        ảnh sẽ chạy slideshow riêng, còn video luôn chờ người xem bấm phát.
      </p>
    </>
  );
}

export function AlbumManager({
  albums,
  createAction,
  deleteAction,
  ownerId,
  ownerKey,
  playlists,
  updateAction,
}: {
  albums: ManagedAlbum[];
  createAction: AlbumAction;
  deleteAction: AlbumAction;
  ownerId: string;
  ownerKey: "classId" | "teamId";
  playlists: Pick<MusicPlaylist, "id" | "name">[];
  updateAction: AlbumAction;
}) {
  return (
    <div className="grid gap-4">
      {albums.map((album) => (
        <details
          className="overflow-hidden rounded-md border border-slate-200 bg-slate-50"
          key={album.id}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-100">
            {album.title}
            <span className="text-xs font-medium text-slate-500">
              {album.published ? "Public" : "Private"} · {album.items.length} media
            </span>
          </summary>
          <form action={updateAction} className="grid gap-4 border-t border-slate-200 p-4">
            <input name={ownerKey} type="hidden" value={ownerId} />
            <input name="albumId" type="hidden" value={album.id} />
            <AlbumFields album={album} playlists={playlists} />
            <div className="flex gap-2">
              <button
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                type="submit"
              >
                Lưu album
              </button>
              <button
                className="rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                formAction={deleteAction}
                formNoValidate
                type="submit"
              >
                Xóa album
              </button>
            </div>
          </form>
        </details>
      ))}
      <form
        action={createAction}
        className="grid gap-4 rounded-md border border-emerald-200 bg-emerald-50/50 p-4"
      >
        <input name={ownerKey} type="hidden" value={ownerId} />
        <h3 className="text-lg font-semibold">Thêm album mới</h3>
        <AlbumFields playlists={playlists} />
        <button
          className="w-fit rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          type="submit"
        >
          Thêm album
        </button>
      </form>
    </div>
  );
}
