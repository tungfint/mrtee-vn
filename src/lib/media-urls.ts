type GoogleDriveFile = {
  directImage: boolean;
  id: string;
  resourceKey: string | null;
};

function googleDriveFile(url: string): GoogleDriveFile | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "drive.google.com") {
      return null;
    }

    const pathMatch = parsed.pathname.match(/^\/file\/d\/([^/]+)/);
    const id =
      pathMatch?.[1] ??
      (["/open", "/uc", "/thumbnail"].includes(parsed.pathname)
        ? parsed.searchParams.get("id")
        : null);

    if (!id) {
      return null;
    }

    return {
      directImage: parsed.pathname === "/thumbnail" || parsed.pathname === "/uc",
      id,
      resourceKey: parsed.searchParams.get("resourcekey"),
    };
  } catch {
    return null;
  }
}

export function displayImageUrl(url: string | null | undefined) {
  if (!url) {
    return url;
  }

  const file = googleDriveFile(url);

  if (!file || file.directImage) {
    return url;
  }

  const params = new URLSearchParams({ id: file.id, sz: "w2000" });

  if (file.resourceKey) {
    params.set("resourcekey", file.resourceKey);
  }

  return `https://drive.google.com/thumbnail?${params.toString()}`;
}

export function drivePreviewUrl(url: string) {
  const file = googleDriveFile(url);

  if (!file) {
    return null;
  }

  const suffix = file.resourceKey
    ? `?resourcekey=${encodeURIComponent(file.resourceKey)}`
    : "";

  return `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/preview${suffix}`;
}

export function playableAudioUrl(url: string) {
  const file = googleDriveFile(url);

  if (!file) {
    return url;
  }

  const params = new URLSearchParams({ id: file.id });

  if (file.resourceKey) {
    params.set("resourcekey", file.resourceKey);
  }

  return `/api/media/google-drive-audio?${params.toString()}`;
}

export function driveFolderEmbedUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "drive.google.com") {
      return null;
    }

    const folderId =
      parsed.pathname.match(/\/folders\/([^/]+)/)?.[1] ??
      parsed.searchParams.get("id");

    return folderId
      ? `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#grid`
      : null;
  } catch {
    return null;
  }
}

export function embeddedVideoUrl(url: string) {
  const driveUrl = drivePreviewUrl(url);

  if (driveUrl) {
    return driveUrl;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (parsed.hostname === "youtube.com" || parsed.hostname === "www.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function mediaPreviewImageUrl(url: string) {
  const driveFile = googleDriveFile(url);

  if (driveFile) {
    const params = new URLSearchParams({ id: driveFile.id, sz: "w1200" });

    if (driveFile.resourceKey) {
      params.set("resourcekey", driveFile.resourceKey);
    }

    return `https://drive.google.com/thumbnail?${params.toString()}`;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return `https://img.youtube.com/vi/${parsed.pathname.slice(1)}/hqdefault.jpg`;
    }

    if (parsed.hostname === "youtube.com" || parsed.hostname === "www.youtube.com") {
      const videoId = parsed.pathname.startsWith("/embed/")
        ? parsed.pathname.split("/")[2]
        : parsed.searchParams.get("v");
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export function displayImageSourcesInHtml(content: string) {
  return content.replace(
    /(<img\b[^>]*?\bsrc=["'])([^"']+)(["'])/gi,
    (_match, opening: string, url: string, closing: string) =>
      `${opening}${displayImageUrl(url) ?? url}${closing}`,
  );
}
