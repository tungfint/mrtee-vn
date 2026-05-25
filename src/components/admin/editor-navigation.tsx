import { ChevronRight } from "lucide-react";

export type EditorNavItem = {
  href: string;
  label: string;
};

export function EditorNavigation({ items }: { items: EditorNavItem[] }) {
  return (
    <nav className="sticky top-4 z-20 flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:flex-col">
      <p className="hidden px-3 py-2 text-xs font-semibold uppercase text-slate-400 lg:block">
        Chuyển nhanh
      </p>
      {items.map((item) => (
        <a
          className="inline-flex shrink-0 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
          href={item.href}
          key={item.href}
        >
          {item.label}
          <ChevronRight aria-hidden className="hidden h-4 w-4 lg:block" />
        </a>
      ))}
    </nav>
  );
}
