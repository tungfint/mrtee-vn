"use client";

import { FolderOpen, Music2 } from "lucide-react";

import { MediaGallery, type GalleryMediaItem } from "@/components/content/media-gallery";
import type { AudioPlaylist } from "@/components/audio/site-music-player";
import { driveFolderEmbedUrl } from "@/lib/media-urls";

type PublicAlbum = {
  description?: string | null;
  id: string;
  imageFolderUrl?: string | null;
  items: GalleryMediaItem[];
  playlist?: AudioPlaylist | null;
  title: string;
  videoFolderUrl?: string | null;
};

export function AlbumShowcase({ albums }: { albums: PublicAlbum[] }) {
  return (
    <div className="grid gap-8">
      {albums.map((album) => {
        const imageFolder = driveFolderEmbedUrl(album.imageFolderUrl);
        const videoFolder = driveFolderEmbedUrl(album.videoFolderUrl);

        return (
          <article className="grid gap-5" key={album.id}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">{album.title}</h3>
                {album.description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{album.description}</p>
                ) : null}
              </div>
              {album.playlist?.tracks.length ? (
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("mrtee:playlist", { detail: album.playlist }),
                    );
                  }}
                  type="button"
                >
                  <Music2 aria-hidden className="h-4 w-4" />
                  Nghe playlist album
                </button>
              ) : null}
            </div>
            {album.items.length ? <MediaGallery items={album.items} title={album.title} /> : null}
            {imageFolder || videoFolder ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {imageFolder ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <p className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
                      <FolderOpen aria-hidden className="h-4 w-4 text-emerald-700" />
                      Folder ảnh
                    </p>
                    <iframe className="h-80 w-full border-0" src={imageFolder} title={`${album.title} - Folder ảnh`} />
                  </div>
                ) : null}
                {videoFolder ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <p className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
                      <FolderOpen aria-hidden className="h-4 w-4 text-emerald-700" />
                      Folder video
                    </p>
                    <iframe className="h-80 w-full border-0" src={videoFolder} title={`${album.title} - Folder video`} />
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
