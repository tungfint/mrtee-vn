"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { regenerateStudentPageTokenAction } from "@/app/(dashboard)/dashboard/admin/actions";

export type StudentLinkRow = {
  articleHref: string;
  contextId: string;
  contextLabel: string;
  id: string;
  infoHref: string;
  publicHref: string;
  scope: "CLASS" | "TEAM";
  studentName: string;
  studentSlug: string;
  token: string;
};

type StudentLinkContext = {
  id: string;
  label: string;
};

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export function StudentLinksManager({
  contexts,
  rows,
}: {
  contexts: StudentLinkContext[];
  rows: StudentLinkRow[];
}) {
  const [query, setQuery] = useState("");
  const [contextId, setContextId] = useState("all");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesContext = contextId === "all" || row.contextId === contextId;
      const matchesQuery =
        !normalizedQuery ||
        [
          row.studentName,
          row.studentSlug,
          row.contextLabel,
          row.publicHref,
          row.infoHref,
          row.articleHref,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesContext && matchesQuery;
    });
  }, [contextId, query, rows]);

  function exportCsv() {
    const header = [
      "hoc_sinh",
      "ngu_canh",
      "slug",
      "token",
      "trang_public",
      "link_thong_tin",
      "link_bai_viet",
    ];
    const body = filteredRows.map((row) =>
      [
        row.studentName,
        row.contextLabel,
        row.studentSlug,
        row.token,
        row.publicHref,
        row.infoHref,
        row.articleHref,
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [header.join(","), ...body].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `mrtee-student-links-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1fr_260px_auto]">
        <input
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm theo tên, slug, lớp, đội tuyển..."
          value={query}
        />
        <select
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          onChange={(event) => setContextId(event.target.value)}
          value={contextId}
        >
          <option value="all">Tất cả</option>
          {contexts.map((context) => (
            <option key={context.id} value={context.id}>
              {context.label}
            </option>
          ))}
        </select>
        <button
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          onClick={exportCsv}
          type="button"
        >
          Xuất CSV ({filteredRows.length})
        </button>
      </div>

      <div className="text-sm text-slate-500">
        Đang hiển thị {filteredRows.length}/{rows.length} học sinh. Link thông tin và link bài viết dùng chung token.
      </div>

      <div className="grid gap-3">
        {filteredRows.length ? (
          filteredRows.map((row) => (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4" key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{row.studentName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{row.contextLabel}</p>
                  <p className="mt-1 font-code text-xs text-slate-500">token: {row.token}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" href={row.publicHref}>
                    Trang public
                  </Link>
                  <Link className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-800" href={row.infoHref}>
                    Link thông tin
                  </Link>
                  <Link className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800" href={row.articleHref}>
                    Link bài viết
                  </Link>
                  <form action={regenerateStudentPageTokenAction}>
                    <input name="studentPageId" type="hidden" value={row.id} />
                    <button
                      className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 font-medium text-amber-800 hover:bg-amber-100"
                      type="submit"
                    >
                      Tạo link mới
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600">
                <code className="rounded bg-white px-2 py-1">{row.publicHref}</code>
                <code className="rounded bg-white px-2 py-1">{row.infoHref}</code>
                <code className="rounded bg-white px-2 py-1">{row.articleHref}</code>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">Không có học sinh phù hợp với bộ lọc.</p>
        )}
      </div>
    </div>
  );
}
