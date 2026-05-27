"use client";

import { GripVertical, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";

import { BackgroundCard } from "@/components/ui/background-card";

type OrderableItem = {
  backgroundImage?: string | null;
  backgroundPosition?: string | null;
  description: string;
  href: string;
  id: string;
  meta: string;
  title: string;
};

type OrderAction = (formData: FormData) => Promise<void>;

export function OrderableContentGrid({
  action,
  addCard,
  items,
}: {
  action: OrderAction;
  addCard: ReactNode;
  items: OrderableItem[];
}) {
  const [orderedItems, setOrderedItems] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function moveItem(targetId: string) {
    if (!draggedId || draggedId === targetId) return;

    setOrderedItems((current) => {
      const draggedIndex = current.findIndex((item) => item.id === draggedId);
      const targetIndex = current.findIndex((item) => item.id === targetId);

      if (draggedIndex < 0 || targetIndex < 0) return current;

      const next = [...current];
      const [dragged] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, dragged);
      return next;
    });
  }

  function saveOrder() {
    const formData = new FormData();
    formData.set("orderedIds", JSON.stringify(orderedItems.map((item) => item.id)));
    startTransition(() => {
      void action(formData);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Kéo thả các thẻ để đổi thứ tự hiển thị trên website.
        </p>
        <button
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
          disabled={isPending}
          onClick={saveOrder}
          type="button"
        >
          <Save aria-hidden className="h-4 w-4" />
          {isPending ? "Đang lưu..." : "Lưu thứ tự"}
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {addCard}
        {orderedItems.map((item) => (
          <article
            className="group relative"
            draggable
            key={item.id}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => {
              event.preventDefault();
              moveItem(item.id);
            }}
            onDragStart={() => setDraggedId(item.id)}
          >
            <a className="block" href={item.href}>
              <BackgroundCard
                backgroundImage={item.backgroundImage}
                backgroundPosition={item.backgroundPosition ?? "center"}
                className="min-h-56 p-5 shadow-xl shadow-slate-900/10"
                overlayClassName="bg-slate-950/55"
              >
                <div className="flex min-h-44 flex-col justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/95 text-emerald-700 shadow-sm">
                    <GripVertical aria-hidden className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg bg-white/74 p-4 shadow-lg backdrop-blur-[2px] transition group-hover:bg-white/84">
                    <h2 className="text-xl font-semibold text-slate-950">{item.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
                    <p className="mt-1 text-xs font-medium text-emerald-700">{item.meta}</p>
                  </div>
                </div>
              </BackgroundCard>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
