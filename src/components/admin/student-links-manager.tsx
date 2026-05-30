"use client";

import { useMemo, useState, useTransition } from "react";

import {
  deleteStudentProfilesAction,
  deleteStudentPagesAction,
  regenerateStudentPageTokenAction,
} from "@/app/(dashboard)/dashboard/admin/actions";

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

function messageFor(row: StudentLinkRow) {
  return [
    `Chào ${row.studentName},`,
    `Em vào link này để nhập/cập nhật thông tin hồ sơ trên mrtee.vn: ${row.infoHref}`,
    `Nếu muốn gửi bài viết/lưu bút riêng, dùng link: ${row.articleHref}`,
  ].join("\n");
}

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-70"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      type="button"
    >
      {copied ? "Đã copy" : label}
    </button>
  );
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const filteredIds = filteredRows.map((row) => row.id);
  const selectedVisibleCount = filteredIds.filter((id) => selectedIds.includes(id)).length;

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, id]))
        : current.filter((item) => item !== id),
    );
  }

  function selectVisibleRows() {
    setSelectedIds((current) => Array.from(new Set([...current, ...filteredIds])));
  }

  function exportCsv() {
    const header = [
      "hoc_sinh",
      "ngu_canh",
      "slug",
      "token",
      "trang_public",
      "link_thong_tin",
      "link_bai_viet",
      "tin_nhan_gui_hoc_sinh",
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
        messageFor(row),
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

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <span className="font-medium">Đã chọn {selectedIds.length} link.</span>
        <button
          className="rounded-md border border-amber-300 bg-white px-3 py-2 font-medium hover:bg-amber-100"
          onClick={selectVisibleRows}
          type="button"
        >
          Chọn tất cả đang lọc ({filteredRows.length})
        </button>
        <button
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
          onClick={() => setSelectedIds([])}
          type="button"
        >
          Bỏ chọn
        </button>
        <form
          action={deleteStudentPagesAction}
          onSubmit={(event) => {
            if (!selectedIds.length) {
              event.preventDefault();
              return;
            }

            if (!window.confirm(`Gỡ ${selectedIds.length} mục đã chọn khỏi lớp/đội tương ứng? Hồ sơ gốc vẫn được giữ lại.`)) {
              event.preventDefault();
            }
          }}
        >
          <input name="studentPageIds" type="hidden" value={JSON.stringify(selectedIds)} />
          <button
            className="rounded-md border border-rose-300 bg-white px-3 py-2 font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedIds.length}
            type="submit"
          >
            Gỡ khỏi lớp/đội
          </button>
        </form>
        <form
          action={deleteStudentProfilesAction}
          onSubmit={(event) => {
            if (!selectedIds.length) {
              event.preventDefault();
              return;
            }

            if (!window.confirm(`XÓA SẠCH ${selectedIds.length} mục đã chọn? Thao tác này sẽ xóa tài khoản, hồ sơ, link, bài viết và liên kết lớp/đội của học sinh. Không thể hoàn tác.`)) {
              event.preventDefault();
            }
          }}
        >
          <input name="studentPageIds" type="hidden" value={JSON.stringify(selectedIds)} />
          <button
            className="rounded-md bg-rose-700 px-3 py-2 font-medium text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!selectedIds.length}
            type="submit"
          >
            Xóa sạch hồ sơ/tài khoản
          </button>
        </form>
        {selectedVisibleCount ? (
          <span className="text-xs text-amber-800">{selectedVisibleCount} link đang chọn nằm trong bộ lọc hiện tại.</span>
        ) : null}
      </div>

      <div className="grid gap-3">
        {filteredRows.length ? (
          filteredRows.map((row) => (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4" key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <input
                    aria-label={`Chọn ${row.studentName}`}
                    checked={selectedIds.includes(row.id)}
                    className="mt-1 h-4 w-4 shrink-0"
                    onChange={(event) => toggleSelected(row.id, event.target.checked)}
                    type="checkbox"
                  />
                  <div className="min-w-0">
                  <h3 className="font-semibold">{row.studentName}</h3>
                  <p className="mt-1 text-sm text-slate-500">{row.contextLabel}</p>
                  <p className="mt-1 font-code text-xs text-slate-500">token: {row.token}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <a className="rounded-md border border-slate-300 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-100" href={row.publicHref} rel="noreferrer" target="_blank">
                    Trang public
                  </a>
                  <a className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white hover:bg-slate-800" href={row.infoHref} rel="noreferrer" target="_blank">
                    Link thông tin
                  </a>
                  <a className="rounded-md bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800" href={row.articleHref} rel="noreferrer" target="_blank">
                    Link bài viết
                  </a>
                  <CopyButton label="Copy link thông tin" value={row.infoHref} />
                  <CopyButton label="Copy tin nhắn" value={messageFor(row)} />
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
