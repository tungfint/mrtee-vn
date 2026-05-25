"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ActionFeedback({
  message,
  status,
}: {
  message?: string;
  status?: string;
}) {
  const searchParams = useSearchParams();
  const token = `${status ?? ""}:${message ?? ""}:${searchParams.get("feedback") ?? ""}`;
  const visibleFeedback = Boolean(
    message && (status === "success" || status === "error"),
  );
  const [dismissedToken, setDismissedToken] = useState<string | null>(null);
  const visible = visibleFeedback && dismissedToken !== token;

  useEffect(() => {
    if (!visibleFeedback || dismissedToken === token) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDismissedToken(token);
      const url = new URL(window.location.href);
      url.searchParams.delete("message");
      url.searchParams.delete("status");
      window.history.replaceState({}, "", url.toString());
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [dismissedToken, token, visibleFeedback]);

  if (!visible || !message || (status !== "success" && status !== "error")) {
    return null;
  }

  const success = status === "success";
  const Icon = success ? CheckCircle2 : CircleAlert;

  return (
    <div
      className={
        success
          ? "fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-md border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-900 shadow-xl shadow-slate-900/10"
          : "fixed right-5 top-5 z-50 flex max-w-sm items-start gap-3 rounded-md border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-900 shadow-xl shadow-slate-900/10"
      }
      role={success ? "status" : "alert"}
    >
      <Icon
        aria-hidden
        className={success ? "mt-0.5 h-4 w-4 shrink-0 text-emerald-600" : "mt-0.5 h-4 w-4 shrink-0 text-rose-600"}
      />
      <p className="leading-6">{message}</p>
      <button
        aria-label="Đóng thông báo"
        className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
        onClick={() => setDismissedToken(token)}
        type="button"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
