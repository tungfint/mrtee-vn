"use client";

import { ChevronDown, MessageCircle, RefreshCw, Send, UsersRound } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ChatComment = {
  authorName: string;
  content: string;
  createdAt: string;
  id: string;
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CollectionChatPanel({
  className,
  subtitle,
  targetId,
  title = "Chat chung",
}: {
  className?: string;
  subtitle?: string;
  targetId: string;
  title?: string;
}) {
  const [authorName, setAuthorName] = useState("");
  const [comments, setComments] = useState<ChatComment[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      limit: "36",
      targetId,
      targetType: "chat",
    });
    const response = await fetch(`/api/social?${params.toString()}`);
    setIsLoading(false);

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setComments(data.comments ?? []);
  }, [targetId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadComments();
    }, 20000);

    return () => window.clearInterval(interval);
  }, [isOpen, loadComments]);

  function toggleChat() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      void loadComments();
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!authorName.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/social/comment", {
      body: JSON.stringify({
        authorName,
        content,
        targetId,
        targetType: "chat",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    setIsSubmitting(false);

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setComments((current) => [data.comment, ...current].slice(0, 36));
    setContent("");
  }

  return (
    <section className={cn("mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-10", className)}>
      <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
        <button
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-emerald-50/60 sm:px-5"
          onClick={toggleChat}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <MessageCircle aria-hidden className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-950">{title}</span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">
                {subtitle ?? "Nơi mọi người để lại lời nhắn, cập nhật và trò chuyện chung."}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {comments.length ? (
              <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
                <UsersRound aria-hidden className="h-3.5 w-3.5" />
                {comments.length}
              </span>
            ) : null}
            <ChevronDown
              aria-hidden
              className={cn("h-5 w-5 text-slate-500 transition", isOpen ? "rotate-180" : "")}
            />
          </span>
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="order-2 grid max-h-[420px] gap-3 overflow-y-auto pr-1 lg:order-1">
                  {comments.length ? (
                    comments.map((comment) => (
                      <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm" key={comment.id}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">{comment.authorName}</p>
                          <time className="text-xs text-slate-500">{formatTime(comment.createdAt)}</time>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{comment.content}</p>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                      Chưa có lời nhắn nào. Hãy mở đầu cuộc trò chuyện.
                    </div>
                  )}
                </div>

                <div className="order-1 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:order-2">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Gửi lời nhắn</p>
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:text-emerald-700"
                      disabled={isLoading}
                      onClick={() => void loadComments()}
                      title="Làm mới"
                      type="button"
                    >
                      <RefreshCw aria-hidden className={cn("h-4 w-4", isLoading ? "animate-spin" : "")} />
                    </button>
                  </div>
                  <form className="grid gap-3" onSubmit={submitComment}>
                    <input
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      maxLength={60}
                      onChange={(event) => setAuthorName(event.target.value)}
                      placeholder="Tên của bạn"
                      value={authorName}
                    />
                    <textarea
                      className="min-h-28 rounded-md border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                      maxLength={800}
                      onChange={(event) => setContent(event.target.value)}
                      placeholder="Nhập comment hoặc lời nhắn..."
                      value={content}
                    />
                    <button
                      className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isSubmitting}
                      type="submit"
                    >
                      <Send aria-hidden className="h-4 w-4" />
                      Gửi
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
