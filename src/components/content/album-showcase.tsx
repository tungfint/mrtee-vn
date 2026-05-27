"use client";

import { FolderOpen, Grid2X2, Images, Music2 } from "lucide-react";
import { useState } from "react";

import type { AudioPlaylist } from "@/components/audio/site-music-player";
import { MediaGallery, type GalleryMediaItem } from "@/components/content/media-gallery";
import { driveFolderEmbedUrl } from "@/lib/media-urls";

type AlbumViewMode = "SLIDE" | "GRID";

export type PublicAlbum = {
  description?: string | null;
  constrainGridHeight?: boolean;
  id: string;
  imageFolderUrl?: string | null;
  items: GalleryMediaItem[];
  playlist?: AudioPlaylist | null;
  title: string;
  videoFolderUrl?: string | null;
  viewMode?: AlbumViewMode;
};

function AlbumCard({ album }: { album: PublicAlbum }) {
  const [viewMode, setViewMode] = useState<AlbumViewMode>(album.viewMode ?? "SLIDE");
  const imageFolder = driveFolderEmbedUrl(album.imageFolderUrl);
  const videoFolder = driveFolderEmbedUrl(album.videoFolderUrl);

  return (
    <article className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{album.title}</h3>
          {album.description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{album.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <button
              className={
                viewMode === "SLIDE"
                  ? "inline-flex items-center gap-2 rounded bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 shadow-sm ring-1 ring-emerald-200"
                  : "inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              }
              onClick={() => setViewMode("SLIDE")}
              type="button"
            >
              <Images aria-hidden className="h-4 w-4" />
              Xem slide
            </button>
            <button
              className={
                viewMode === "GRID"
                  ? "inline-flex items-center gap-2 rounded bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900 shadow-sm ring-1 ring-emerald-200"
                  : "inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              }
              onClick={() => setViewMode("GRID")}
              type="button"
            >
              <Grid2X2 aria-hidden className="h-4 w-4" />
              Xem grid
            </button>
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
      </div>
      {album.items.length ? (
        <MediaGallery
          constrainGridHeight={album.constrainGridHeight}
          items={album.items}
          title={album.title}
          viewMode={viewMode}
        />
      ) : null}
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
}

export function AlbumShowcase({ albums }: { albums: PublicAlbum[] }) {
  return (
    <div className="grid gap-8">
      {albums.map((album) => (
        <AlbumCard album={album} key={album.id} />
      ))}
    </div>
  );
}
