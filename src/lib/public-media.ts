import type { GalleryMediaItem } from "@/components/content/media-gallery";

export type PublicMediaInput = {
  caption?: string | null;
  title?: string | null;
  type: GalleryMediaItem["type"];
  url: string;
};

export function toGalleryItems(items: PublicMediaInput[]): GalleryMediaItem[] {
  return items.map((item) => ({
    caption: item.caption ?? undefined,
    title: item.title ?? undefined,
    type: item.type,
    url: item.url,
  }));
}

export function uniqueMediaItems<T extends { url: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.url.trim();

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function collectVideoItems(
  primaryItems: GalleryMediaItem[],
  albumItems: PublicMediaInput[][],
  fallback: GalleryMediaItem,
) {
  const videos = uniqueMediaItems([
    ...primaryItems.filter((item) => item.type === "VIDEO"),
    ...albumItems.flatMap((items) => toGalleryItems(items)).filter((item) => item.type === "VIDEO"),
  ]);

  return videos.length ? videos : [fallback];
}
