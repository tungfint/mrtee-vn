import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const reactionTypes = ["LIKE", "HEART", "HAHA", "SMILE", "ANGRY", "SAD"] as const;
type ReactionType = (typeof reactionTypes)[number];
const validReactionTypes = new Set<string>(reactionTypes);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const targetType = typeof body?.targetType === "string" ? body.targetType.trim() : "";
  const targetId = typeof body?.targetId === "string" ? body.targetId.trim() : "";
  const visitorKey = typeof body?.visitorKey === "string" ? body.visitorKey.trim() : "";
  const reactionType = typeof body?.reactionType === "string" ? body.reactionType.trim() : "";

  if (!targetType || !targetId || !visitorKey || !validReactionTypes.has(reactionType)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.socialReaction.upsert({
    create: {
      reactionType: reactionType as ReactionType,
      targetId,
      targetType,
      visitorKey,
    },
    update: {
      reactionType: reactionType as ReactionType,
    },
    where: {
      targetType_targetId_visitorKey: {
        targetId,
        targetType,
        visitorKey,
      },
    },
  });

  const reactionGroups = await prisma.socialReaction.groupBy({
    _count: { reactionType: true },
    by: ["reactionType"],
    where: { targetId, targetType },
  });

  return NextResponse.json({
    reactions: Object.fromEntries(
      reactionGroups.map((group) => [group.reactionType, group._count.reactionType]),
    ),
  });
}
