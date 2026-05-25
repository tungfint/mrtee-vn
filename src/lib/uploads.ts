import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const imageExtensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const mediaExtensions: Record<string, string> = {
  ...imageExtensions,
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function extensionFor(file: File) {
  const fromMime = mediaExtensions[file.type];

  if (fromMime) {
    return fromMime;
  }

  const fromName = file.name.split(".").pop()?.toLowerCase();
  return fromName?.replace(/[^a-z0-9]/g, "") || "jpg";
}

async function storePublicFile(file: File) {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${extensionFor(file)}`;
  const filepath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function uploadPublicImage(file: File) {
  if (!file.size) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File upload phải là ảnh.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Ảnh upload tối đa 8MB.");
  }

  return storePublicFile(file);
}

export async function uploadPublicMedia(file: File) {
  if (!file.size) {
    return null;
  }

  const allowed =
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    file.type.startsWith("audio/");

  if (!allowed) {
    throw new Error("Media upload phải là ảnh, video hoặc âm thanh.");
  }

  const maxSize = file.type.startsWith("image/") ? 8 : 20;

  if (file.size > maxSize * 1024 * 1024) {
    throw new Error(`Media upload tối đa ${maxSize}MB.`);
  }

  return storePublicFile(file);
}
