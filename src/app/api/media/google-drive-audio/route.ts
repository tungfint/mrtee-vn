import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const safeValue = /^[A-Za-z0-9_-]+$/;
const forwardedHeaders = [
  "accept-ranges",
  "cache-control",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
];

async function streamDriveAudio(request: NextRequest, includeBody: boolean) {
  const id = request.nextUrl.searchParams.get("id");
  const resourceKey = request.nextUrl.searchParams.get("resourcekey");

  if (!id || !safeValue.test(id) || (resourceKey && !safeValue.test(resourceKey))) {
    return new Response("Invalid Google Drive file.", { status: 400 });
  }

  const driveUrl = new URL("https://drive.usercontent.google.com/download");
  driveUrl.searchParams.set("id", id);
  driveUrl.searchParams.set("export", "download");
  driveUrl.searchParams.set("confirm", "t");
  if (resourceKey) {
    driveUrl.searchParams.set("resourcekey", resourceKey);
  }

  const upstreamHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) {
    upstreamHeaders.set("Range", range);
  }

  const response = await fetch(driveUrl, {
    cache: "no-store",
    headers: upstreamHeaders,
    method: includeBody ? "GET" : "HEAD",
  });

  if (!response.ok && response.status !== 206) {
    return new Response("Google Drive audio is unavailable.", {
      status: response.status,
    });
  }

  const headers = new Headers();
  for (const name of forwardedHeaders) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("Cache-Control", "private, max-age=3600");

  return new Response(includeBody ? response.body : null, {
    headers,
    status: response.status,
  });
}

export async function GET(request: NextRequest) {
  return streamDriveAudio(request, true);
}

export async function HEAD(request: NextRequest) {
  return streamDriveAudio(request, false);
}
