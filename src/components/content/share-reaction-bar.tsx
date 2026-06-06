"use client";

import {
  Angry,
  Check,
  Frown,
  Heart,
  Laugh,
  MessageCircle,
  Share2,
  Smile,
  ThumbsUp,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type ReactionType = "LIKE" | "HEART" | "HAHA" | "SMILE" | "ANGRY" | "SAD";

type SocialComment = {
  authorName: string;
  content: string;
  createdAt: string;
  id: string;
};

const reactions: {
  icon: typeof ThumbsUp;
  key: ReactionType;
  label: string;
}[] = [
  { icon: ThumbsUp, key: "LIKE", label: "Like" },
  { icon: Heart, key: "HEART", label: "Tim" },
  { icon: Laugh, key: "HAHA", label: "Ha ha" },
  { icon: Smile, key: "SMILE", label: "Vui" },
  { icon: Angry, key: "ANGRY", label: "Tức giận" },
  { icon: Frown, key: "SAD", label: "Buồn" },
];

function localReactionKey(targetType: string, targetId: string) {
  return `mrtee:reaction:${targetType}:${targetId}`;
}

function normalizedUrl(pathOrUrl?: string) {
  if (typeof window === "undefined") {
    return pathOrUrl ?? "";
  }

  if (!pathOrUrl) {
    return window.location.href;
  }

  return new URL(pathOrUrl, window.location.origin).toString();
}

function parseTarget(id: string) {
  const [targetType, ...rest] = id.split(":");
  const targetId = rest.join(":");

  return {
    targetId: targetId || id,
    targetType: targetId ? targetType : "page",
  };
}

function visitorKey() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem("mrtee:visitor");

  if (existing) {
    return existing;
  }

  const next = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  window.localStorage.setItem("mrtee:visitor", next);
  return next;
}

function formatCommentTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ShareReactionBar({
  className,
  id,
  title,
  url,
}: {
  className?: string;
  compact?: boolean;
  id: string;
  title: string;
  url?: string;
}) {
  const target = useMemo(() => parseTarget(id), [id]);
  const shareUrl = useMemo(() => normalizedUrl(url), [url]);
  const reactionStorageKey = useMemo(
    () => localReactionKey(target.targetType, target.targetId),
    [target.targetId, target.targetType],
  );
  const [authorName, setAuthorName] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [copied, setCopied] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(reactionStorageKey) as ReactionType | null;
  });

  useEffect(() => {
    let ignore = false;

    async function loadSocialData() {
      const params = new URLSearchParams(target);
      const response = await fetch(`/api/social?${params.toString()}`);

      if (!response.ok || ignore) {
        return;
      }

      const data = await response.json();
      setReactionCounts(data.reactions ?? {});
      setComments(data.comments ?? []);
    }

    void loadSocialData();

    return () => {
      ignore = true;
    };
  }, [target]);

  async function sharePage() {
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function chooseReaction(reactionType: ReactionType) {
    setSelectedReaction(reactionType);
    window.localStorage.setItem(reactionStorageKey, reactionType);

    const response = await fetch("/api/social/reaction", {
      body: JSON.stringify({
        reactionType,
        targetId: target.targetId,
        targetType: target.targetType,
        visitorKey: visitorKey(),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      setReactionCounts(data.reactions ?? {});
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authorName.trim() || !commentText.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    const response = await fetch("/api/social/comment", {
      body: JSON.stringify({
        authorName,
        content: commentText,
        targetId: target.targetId,
        targetType: target.targetType,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setIsSubmittingComment(false);

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setComments((current) => [data.comment, ...current].slice(0, 12));
    setCommentText("");
  }

  const selectedReactionConfig = reactions.find((reaction) => reaction.key === selectedReaction);
  const SelectedReactionIcon = selectedReactionConfig?.icon;
  const totalReactionCount = reactions.reduce((total, reaction) => total + (reactionCounts[reaction.key] ?? 0), 0);

  return (
    <div className={cn("group relative z-[80] ml-auto w-fit max-w-full text-slate-950", className)}>
      <div className="flex w-fit items-center gap-1 rounded-lg border border-slate-200 bg-white/92 p-1.5 shadow-sm backdrop-blur transition group-hover:rounded-b-none group-focus-within:rounded-b-none">
        <button
          aria-label={copied ? "Đã copy link" : "Share"}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md bg-emerald-700 px-2 text-white transition hover:bg-emerald-800"
          onClick={sharePage}
          title={copied ? "Đã copy link" : "Share"}
          type="button"
        >
          {copied ? <Check aria-hidden className="h-4 w-4" /> : <Share2 aria-hidden className="h-4 w-4" />}
        </button>

        {SelectedReactionIcon ? (
          <span className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 text-xs font-semibold text-emerald-900">
            <SelectedReactionIcon
              aria-hidden
              className={cn("h-4 w-4", selectedReaction === "HEART" ? "fill-current" : "")}
            />
            {selectedReaction ? reactionCounts[selectedReaction] ?? 0 : null}
          </span>
        ) : totalReactionCount ? (
          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700">
            {totalReactionCount}
          </span>
        ) : null}

        <button
          aria-expanded={commentOpen}
          aria-label="Bình luận"
          className={cn(
            "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border px-2 text-xs font-semibold transition",
            commentOpen
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-800",
          )}
          onClick={() => setCommentOpen((value) => !value)}
          title="Bình luận"
          type="button"
        >
          <MessageCircle aria-hidden className="h-4 w-4" />
          {comments.length ? <span>{comments.length}</span> : null}
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-full right-0 grid w-[min(88vw,360px)] origin-bottom-right gap-2 rounded-t-lg rounded-l-lg border border-slate-200 bg-white/96 p-2 opacity-0 shadow-lg backdrop-blur transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
        <div className="flex flex-wrap justify-end gap-1.5">
          {reactions.map((reaction) => {
            const Icon = reaction.icon;
            const active = selectedReaction === reaction.key;
            const count = reactionCounts[reaction.key] ?? 0;

            return (
              <button
                aria-label={reaction.label}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border px-2 text-xs font-semibold transition",
                  active
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-800",
                )}
                key={reaction.key}
                onClick={() => chooseReaction(reaction.key)}
                title={reaction.label}
                type="button"
              >
                <Icon aria-hidden className={cn("h-4 w-4", active && reaction.key === "HEART" ? "fill-current" : "")} />
                {count ? <span>{count}</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      {commentOpen ? (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-30 w-[min(88vw,340px)] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          <form className="grid gap-2" onSubmit={submitComment}>
            <input
              className="h-9 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              maxLength={60}
              onChange={(event) => setAuthorName(event.target.value)}
              placeholder="Tên"
              value={authorName}
            />
            <textarea
              className="min-h-20 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
              maxLength={800}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Comment"
              value={commentText}
            />
            <button
              className="w-fit rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmittingComment}
              type="submit"
            >
              Gửi
            </button>
          </form>

          {comments.length ? (
            <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto border-t border-slate-100 pt-3">
              {comments.map((comment) => (
                <div className="rounded-md bg-slate-50 px-3 py-2 text-sm" key={comment.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{comment.authorName}</p>
                    <p className="text-[11px] text-slate-500">{formatCommentTime(comment.createdAt)}</p>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-slate-600">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
