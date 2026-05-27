"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { submitStudentInputAction } from "@/app/(public)/student-input-actions";

type ContentFormat = "MARKDOWN" | "HTML";

type StudentInputData = {
  avatar?: string | null;
  cityCountry?: string | null;
  company?: string | null;
  coverImage?: string | null;
  customPhoto1?: string | null;
  customPhoto2?: string | null;
  dob?: string;
  fullName: string;
  futureGoal?: string | null;
  hobbies?: string | null;
  nickname?: string | null;
  photoWithTeacher?: string | null;
  postGraduateWork?: string | null;
  school?: string | null;
  university?: string | null;
  workField?: string | null;
  yearbookFormat?: ContentFormat;
  yearbookMessage?: string | null;
};

function inputClass() {
  return "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
}

function textareaClass() {
  return "min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextPreview({ content, format }: { content: string; format: ContentFormat }) {
  if (!content.trim()) {
    return <p className="text-sm text-slate-500">Nội dung preview sẽ hiển thị tại đây.</p>;
  }

  if (format === "HTML") {
    return (
      <div
        className="markdown"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export function StudentInputForm({
  contextLabel,
  initialData,
  pageId,
  publicHref,
  saved,
  token,
}: {
  contextLabel: string;
  initialData: StudentInputData;
  pageId: string;
  publicHref: string;
  saved?: boolean;
  token: string;
}) {
  const [data, setData] = useState(initialData);
  const [previewOpen, setPreviewOpen] = useState(true);
  const previewImages = useMemo(
    () =>
      [
        data.avatar,
        data.photoWithTeacher,
        data.customPhoto1,
        data.customPhoto2,
      ].filter(Boolean) as string[],
    [data],
  );

  function update(key: keyof StudentInputData, value: string) {
    setData((current) => ({ ...current, [key]: value }));
  }

  const yearbookFormat = data.yearbookFormat ?? "MARKDOWN";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase text-emerald-700">
            Link nhập thông tin
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold">{data.fullName}</h1>
              <p className="mt-2 text-sm text-slate-500">{contextLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                href={`${publicHref}/baiviet/${token}`}
              >
                Nhập bài viết
              </a>
              <a
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                href={publicHref}
                target="_blank"
              >
                Xem trang public
              </a>
            </div>
          </div>
          {saved ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              Đã lưu thông tin. Em có thể tiếp tục sửa và gửi lại nếu cần.
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
        <form action={submitStudentInputAction} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <input name="pageId" type="hidden" value={pageId} />
          <input name="token" type="hidden" value={token} />

          <section className="grid gap-4 md:grid-cols-2">
            <Field label="Họ và tên">
              <input className={inputClass()} name="fullName" onChange={(event) => update("fullName", event.target.value)} required value={data.fullName} />
            </Field>
            <Field label="Nickname">
              <input className={inputClass()} name="nickname" onChange={(event) => update("nickname", event.target.value)} value={data.nickname ?? ""} />
            </Field>
            <Field label="Ngày sinh">
              <input className={inputClass()} name="dob" onChange={(event) => update("dob", event.target.value)} type="date" value={data.dob ?? ""} />
            </Field>
            <Field label="Trường">
              <input className={inputClass()} name="school" onChange={(event) => update("school", event.target.value)} value={data.school ?? ""} />
            </Field>
            <Field label="Đại học">
              <input className={inputClass()} name="university" onChange={(event) => update("university", event.target.value)} value={data.university ?? ""} />
            </Field>
            <Field label="Sau đại học / công việc">
              <input className={inputClass()} name="postGraduateWork" onChange={(event) => update("postGraduateWork", event.target.value)} value={data.postGraduateWork ?? ""} />
            </Field>
            <Field label="Thành phố - Quốc gia đang ở">
              <input className={inputClass()} name="cityCountry" onChange={(event) => update("cityCountry", event.target.value)} placeholder="Ví dụ: Hà Nội, Việt Nam" value={data.cityCountry ?? ""} />
            </Field>
            <Field label="Lĩnh vực đang làm">
              <input className={inputClass()} name="workField" onChange={(event) => update("workField", event.target.value)} placeholder="Ví dụ: Software Engineering" value={data.workField ?? ""} />
            </Field>
            <Field label="Công ty đang làm">
              <input className={inputClass()} name="company" onChange={(event) => update("company", event.target.value)} value={data.company ?? ""} />
            </Field>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {[
              ["avatar", "Ảnh cá nhân"],
              ["photoWithTeacher", "Ảnh với thầy"],
              ["customPhoto1", "Ảnh tự chọn 1"],
              ["customPhoto2", "Ảnh tự chọn 2"],
              ["coverImage", "Ảnh bìa"],
            ].map(([key, label]) => (
              <Field key={key} label={`${label} - URL hoặc upload file`}>
                <input
                  className={inputClass()}
                  name={key}
                  onChange={(event) => update(key as keyof StudentInputData, event.target.value)}
                  placeholder="Dán link ảnh Google Drive/Cloudinary..."
                  value={(data[key as keyof StudentInputData] as string | null) ?? ""}
                />
                <input accept="image/*" className="mt-2 w-full rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm" name={`${key}File`} type="file" />
              </Field>
            ))}
          </section>

          <Field label="Sở thích">
            <textarea className={textareaClass()} name="hobbies" onChange={(event) => update("hobbies", event.target.value)} value={data.hobbies ?? ""} />
          </Field>
          <Field label="Mục tiêu tương lai">
            <textarea className={textareaClass()} name="futureGoal" onChange={(event) => update("futureGoal", event.target.value)} value={data.futureGoal ?? ""} />
          </Field>

          <section className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Field label="Định dạng lưu bút">
                <select
                  className={inputClass()}
                  name="yearbookFormat"
                  onChange={(event) => update("yearbookFormat", event.target.value)}
                  value={yearbookFormat}
                >
                  <option value="MARKDOWN">Markdown</option>
                  <option value="HTML">HTML</option>
                </select>
              </Field>
              <button
                className="self-end rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                onClick={() => setPreviewOpen((value) => !value)}
                type="button"
              >
                {previewOpen ? "Ẩn preview" : "Preview"}
              </button>
            </div>
            <Field label="Lưu bút">
              <textarea
                className={`${textareaClass()} min-h-40 font-code`}
                name="yearbookMessage"
                onChange={(event) => update("yearbookMessage", event.target.value)}
                value={data.yearbookMessage ?? ""}
              />
            </Field>
            {previewOpen ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <TextPreview content={data.yearbookMessage ?? ""} format={yearbookFormat} />
              </div>
            ) : null}
          </section>

          <button className="w-fit rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800" type="submit">
            Gửi thông tin
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
          <p className="text-sm font-semibold uppercase text-emerald-700">Preview</p>
          <div
            className="mt-4 aspect-[16/10] rounded-lg bg-cover bg-center"
            style={{
              backgroundImage: data.coverImage ? `url(${data.coverImage})` : "linear-gradient(135deg,#0f172a,#047857)",
            }}
          />
          <h2 className="mt-4 text-2xl font-semibold">{data.fullName || "Họ và tên"}</h2>
          {data.nickname ? <p className="mt-1 font-medium text-emerald-700">{data.nickname}</p> : null}
          <dl className="mt-4 grid gap-2 text-sm text-slate-600">
            {data.cityCountry ? <div><dt className="font-semibold text-slate-900">Nơi ở</dt><dd>{data.cityCountry}</dd></div> : null}
            {data.workField ? <div><dt className="font-semibold text-slate-900">Lĩnh vực</dt><dd>{data.workField}</dd></div> : null}
            {data.company ? <div><dt className="font-semibold text-slate-900">Công ty</dt><dd>{data.company}</dd></div> : null}
          </dl>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
            <TextPreview content={data.yearbookMessage ?? ""} format={yearbookFormat} />
          </div>
          {previewImages.length ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {previewImages.map((image, index) => (
                <div className="aspect-square rounded-md bg-cover bg-center" key={`${image}-${index}`} style={{ backgroundImage: `url(${image})` }} />
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
