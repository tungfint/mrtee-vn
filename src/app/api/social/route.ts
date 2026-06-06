import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function targetFromRequest(request: Request) {
  const url = new URL(request.url);
  const targetType = url.searchParams.get("targetType")?.trim();
  const targetId = url.searchParams.get("targetId")?.trim();

  if (!targetType || !targetId) {
    return null;
  }

  return { targetId, targetType };
}

export async function GET(request: Request) {
  const target = targetFromRequest(request);
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 12), 1), 50);

  if (!target) {
    return NextResponse.json({ error: "Missing target" }, { status: 400 });
  }

  const [reactionGroups, comments] = await Promise.all([
    prisma.socialReaction.groupBy({
      _count: { reactionType: true },
      by: ["reactionType"],
      where: target,
    }),
    prisma.socialComment.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      where: target,
    }),
  ]);

  return NextResponse.json({
    comments: comments.map((comment) => ({
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      id: comment.id,
    })),
    reactions: Object.fromEntries(
      reactionGroups.map((group) => [group.reactionType, group._count.reactionType]),
    ),
  });
}
