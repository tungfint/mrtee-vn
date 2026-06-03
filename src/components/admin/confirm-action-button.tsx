"use client";

import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

type ServerAction = (formData: FormData) => Promise<void>;

export function ConfirmActionButton({
  className,
  formAction,
  label = "Xóa",
  message,
}: {
  className?: string;
  formAction?: ServerAction;
  label?: string;
  message: string;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50",
        className,
      )}
      formAction={formAction}
      formNoValidate
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      <Trash2 aria-hidden className="h-4 w-4" />
      {label}
    </button>
  );
}
