import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const maxNameLength = 60;
const maxCommentLength = 800;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const targetType = typeof body?.targetType === "string" ? body.targetType.trim() : "";
  const targetId = typeof body?.targetId === "string" ? body.targetId.trim() : "";
  const authorName = typeof body?.authorName === "string" ? body.authorName.trim() : "";
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!targetType || !targetId || !authorName || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const comment = await prisma.socialComment.create({
    data: {
      authorName: authorName.slice(0, maxNameLength),
      content: content.slice(0, maxCommentLength),
      targetId,
      targetType,
    },
  });

  return NextResponse.json({
    comment: {
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      id: comment.id,
    },
  });
}
