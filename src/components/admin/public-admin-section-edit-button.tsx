"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type EditSection = "albums" | "videos";

type EditTarget = {
  href: string;
  label: string;
};

export function PublicAdminSectionEditButton({
  className = "",
  label,
  section,
}: {
  className?: string;
  label: string;
  section: EditSection;
}) {
  const pathname = usePathname();
  const [target, setTarget] = useState<EditTarget | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadTarget() {
      try {
        const params = new URLSearchParams({ path: pathname, section });
        const response = await fetch(`/api/admin/edit-target?${params.toString()}`, {
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
  }, [pathname, section]);

  if (!target) return null;

  return (
    <Link
      className={`inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-800 ${className}`}
      href={target.href}
    >
      <Pencil aria-hidden className="h-4 w-4" />
      {label || target.label}
    </Link>
  );
}
