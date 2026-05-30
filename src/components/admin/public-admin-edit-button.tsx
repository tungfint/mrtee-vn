"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type EditTarget = {
  href: string;
  label: string;
};

export function PublicAdminEditButton() {
  const pathname = usePathname();
  const [target, setTarget] = useState<EditTarget | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadTarget() {
      try {
        const response = await fetch(`/api/admin/edit-target?path=${encodeURIComponent(pathname)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (alive) setTarget(null);
          return;
        }

        const data = (await response.json()) as EditTarget;
        if (alive) setTarget(data);
      } catch {
        if (alive) setTarget(null);
      }
    }

    loadTarget();

    return () => {
      alive = false;
    };
  }, [pathname]);

  if (!target) {
    return null;
  }

  return (
    <Link
      className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-950/20 ring-1 ring-white/20 hover:bg-slate-800"
      href={target.href}
    >
      <Pencil aria-hidden className="h-4 w-4" />
      {target.label}
    </Link>
  );
}

