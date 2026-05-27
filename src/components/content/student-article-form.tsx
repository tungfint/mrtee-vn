"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { submitStudentArticleAction } from "@/app/(public)/student-input-actions";

type ContentFormat = "MARKDOWN" | "HTML";

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const textareaClass =
  "min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function Preview({ content, format }: { content: string; format: ContentFormat }) {
  if (!content.trim()) {
    return <p className="text-sm text-slate-500">Bài viết preview sẽ hiển thị tại đây.</p>;
  }

  if (format === "HTML") {
    return <div className="markdown" dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export function StudentArticleForm({
  contextLabel,
  pageId,
  publicHref,
  saved,
  studentName,
  token,
}: {
  contextLabel: string;
  pageId: string;
  publicHref: string;
  saved?: boolean;
  studentName: string;
  token: string;
}) {
  const [format, setFormat] = useState<ContentFormat>("MARKDOWN");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [previewOpen, setPreviewOpen] = useState(true);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase text-emerald-700">Nhập bài viết</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">{studentName}</h1>
              <p className="mt-2 text-sm text-slate-500">{contextLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" href={`${publicHref}/thongtin/${token}`}>
                Nhập thông tin
              </a>
              <a className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100" href={publicHref} target="_blank">
                Xem trang public
              </a>
            </div>
          </div>
          {saved ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Đã gửi bài viết. Em có thể tiếp tục gửi bài viết khác nếu cần.
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:px-10">
        <form action={submitStudentArticleAction} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <input name="pageId" type="hidden" value={pageId} />
          <input name="token" type="hidden" value={token} />
          <label className="block text-sm font-medium text-slate-700">
            Tiêu đề bài viết
            <input className={`${inputClass} mt-2`} name="title" onChange={(event) => setTitle(event.target.value)} required value={title} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Tóm tắt
            <textarea className={`${textareaClass} mt-2 min-h-20`} name="excerpt" onChange={(event) => setExcerpt(event.target.value)} value={excerpt} />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Định dạng
              <select className={`${inputClass} mt-2`} name="contentFormat" onChange={(event) => setFormat(event.target.value as ContentFormat)} value={format}>
                <option value="MARKDOWN">Markdown</option>
                <option value="HTML">HTML</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Ảnh bìa - URL hoặc upload
              <input className={`${inputClass} mt-2`} name="coverImage" placeholder="Dán link ảnh..." />
              <input accept="image/*" className="mt-2 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm" name="coverImageFile" type="file" />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Link bài viết / tài liệu / album đính kèm
              <input className={`${inputClass} mt-2`} name="attachmentUrl" placeholder="https://..." />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Tên link đính kèm
              <input className={`${inputClass} mt-2`} name="attachmentTitle" placeholder="Ví dụ: Bài blog của em" />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Nội dung bài viết
            <textarea className={`${textareaClass} mt-2 min-h-72 font-code`} name="content" onChange={(event) => setContent(event.target.value)} required value={content} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800" type="submit">
              Gửi bài viết
            </button>
            <button className="rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100" onClick={() => setPreviewOpen((value) => !value)} type="button">
              {previewOpen ? "Ẩn preview" : "Preview"}
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
          <p className="text-sm font-semibold uppercase text-emerald-700">Preview</p>
          <h2 className="mt-3 text-2xl font-semibold">{title || "Tiêu đề bài viết"}</h2>
          {excerpt ? <p className="mt-2 text-sm leading-6 text-slate-600">{excerpt}</p> : null}
          {previewOpen ? (
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
              <Preview content={content} format={format} />
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
