import { ContentFormat } from "@prisma/client";

import {
  AdminPanel,
  AdminShell,
  Field,
  FormGrid,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/admin-shell";
import { ImageField } from "@/components/admin/image-field";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createPostAction, updatePostAction } from "../actions";

export const dynamic = "force-dynamic";

function dateTimeValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 16) : "";
}

export default async function AdminPostsPage() {
  await requireAdmin();

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AdminShell
      description="Tạo và chỉnh sửa bài viết blog. Nội dung có thể là Markdown hoặc HTML."
      title="Quản lý blog"
    >
      <div className="grid gap-5">
        <AdminPanel title="Thêm bài blog">
          <form action={createPostAction} className="space-y-4">
            <FormGrid>
              <Field label="Tiêu đề">
                <input className={inputClass} name="title" required />
              </Field>
              <Field label="Slug">
                <input className={inputClass} name="slug" />
              </Field>
              <Field label="Định dạng">
                <select
                  className={selectClass}
                  defaultValue="MARKDOWN"
                  name="contentFormat"
                >
                  {Object.values(ContentFormat).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ngày publish">
                <input className={inputClass} name="publishedAt" type="datetime-local" />
              </Field>
            </FormGrid>
            <FormGrid>
              <ImageField
                cropName="coverImageCrop"
                label="Ảnh cover"
                name="coverImage"
                recommendedSize="1600 x 900px"
              />
              <ImageField
                cropName="backgroundImageCrop"
                label="Ảnh nền card"
                name="backgroundImage"
                recommendedSize="1920 x 1080px"
              />
            </FormGrid>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input name="published" type="checkbox" />
              Xuất bản
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input name="showOnHome" type="checkbox" />
              Hiển thị ở trang chủ
            </label>
            <Field label="Tóm tắt">
              <textarea className={textareaClass} name="excerpt" />
            </Field>
            <Field label="Nội dung">
              <textarea className="min-h-80 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" name="content" required />
            </Field>
            <button
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              type="submit"
            >
              Thêm bài
            </button>
          </form>
        </AdminPanel>

        <AdminPanel title="Bài blog hiện có">
          <div className="grid gap-4">
            {posts.map((post) => (
              <form
                action={updatePostAction}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={post.id}
              >
                <input name="id" type="hidden" value={post.id} />
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{post.title}</h3>
                    <p className="text-sm text-slate-500">
                      /blog/{post.slug} ·{" "}
                      {post.publishedAt ? "Đã xuất bản" : "Bản nháp"}
                    </p>
                  </div>
                  <button
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    type="submit"
                  >
                    Lưu bài
                  </button>
                </div>
                <div className="space-y-4">
                  <FormGrid>
                    <Field label="Tiêu đề">
                      <input
                        className={inputClass}
                        defaultValue={post.title}
                        name="title"
                        required
                      />
                    </Field>
                    <Field label="Slug">
                      <input
                        className={inputClass}
                        defaultValue={post.slug}
                        name="slug"
                      />
                    </Field>
                    <Field label="Định dạng">
                      <select
                        className={selectClass}
                        defaultValue={post.contentFormat}
                        name="contentFormat"
                      >
                        {Object.values(ContentFormat).map((format) => (
                          <option key={format} value={format}>
                            {format}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Ngày publish">
                      <input
                        className={inputClass}
                        defaultValue={dateTimeValue(post.publishedAt)}
                        name="publishedAt"
                        type="datetime-local"
                      />
                    </Field>
                  </FormGrid>
                  <FormGrid>
                    <ImageField
                      cropName="coverImageCrop"
                      defaultCrop={post.coverImageCrop}
                      defaultValue={post.coverImage}
                      label="Ảnh cover"
                      name="coverImage"
                      recommendedSize="1600 x 900px"
                    />
                    <ImageField
                      cropName="backgroundImageCrop"
                      defaultCrop={post.backgroundImageCrop}
                      defaultValue={post.backgroundImage}
                      label="Ảnh nền card"
                      name="backgroundImage"
                      recommendedSize="1920 x 1080px"
                    />
                  </FormGrid>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      defaultChecked={Boolean(post.publishedAt)}
                      name="published"
                      type="checkbox"
                    />
                    Xuất bản
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      defaultChecked={post.showOnHome}
                      name="showOnHome"
                      type="checkbox"
                    />
                    Hiển thị ở trang chủ
                  </label>
                  <Field label="Tóm tắt">
                    <textarea
                      className={textareaClass}
                      defaultValue={post.excerpt ?? ""}
                      name="excerpt"
                    />
                  </Field>
                  <Field label="Nội dung">
                    <textarea
                      className="min-h-80 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      defaultValue={post.content}
                      name="content"
                      required
                    />
                  </Field>
                </div>
              </form>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
