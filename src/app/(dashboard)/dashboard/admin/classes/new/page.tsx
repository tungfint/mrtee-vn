import Link from "next/link";

import {
  AdminPanel,
  AdminShell,
  ActionFeedback,
  Field,
  FormGrid,
  ImageStandards,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/admin-shell";
import { ImageField } from "@/components/admin/image-field";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createClassAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewClassPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  await requireAdmin();
  const feedback = await searchParams;

  const monitorUsers = await prisma.user.findMany({
    orderBy: { email: "asc" },
    select: { email: true, id: true, name: true, role: true },
  });

  return (
    <AdminShell
      description="Tạo lớp mới trước, sau đó vào trang chi tiết của lớp để import thành viên và thêm bài viết."
      title="Thêm lớp mới"
    >
      <div className="mb-4">
        <Link
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          href="/dashboard/admin/classes"
        >
          Quay lại danh sách lớp
        </Link>
      </div>
      <ActionFeedback message={feedback.message} status={feedback.status} />

      <AdminPanel
        description="Slug là phần URL, ví dụ tin2023 cho /tin2023."
        title="Thông tin lớp"
      >
        <form action={createClassAction} className="space-y-4">
          <FormGrid>
            <Field label="Tên lớp">
              <input className={inputClass} name="name" required />
            </Field>
            <Field label="Slug">
              <input className={inputClass} name="slug" />
            </Field>
            <Field label="Lớp trưởng">
              <select className={selectClass} defaultValue="none" name="monitorId">
                <option value="none">Chưa chọn</option>
                {monitorUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name ?? user.email} · {user.role}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Slogan">
              <input className={inputClass} name="slogan" />
            </Field>
            <Field label="Thứ tự trên trang chủ">
              <input className={inputClass} defaultValue={0} name="displayOrder" type="number" />
            </Field>
          </FormGrid>
          <FormGrid>
            <ImageField
              cropName="coverImageCrop"
              label="Ảnh bìa lớp"
              name="coverImage"
              recommendedSize="1920 x 720px"
            />
            <ImageField
              cropName="cardBackgroundImageCrop"
              label="Ảnh nền block/card lớp"
              name="cardBackgroundImage"
              recommendedSize="1200 x 800px"
            />
          </FormGrid>
          <Field label="Link media ngoài">
            <input
              className={inputClass}
              name="externalMediaUrl"
              placeholder="Google Drive, Flickr, YouTube playlist..."
            />
          </Field>
          <Field label="Giới thiệu ngắn">
            <textarea className={textareaClass} name="introduction" />
          </Field>
          <Field label="Thành tích">
            <textarea className={textareaClass} name="achievements" />
          </Field>
          <ImageStandards />
          <button
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            type="submit"
          >
            Thêm lớp
          </button>
        </form>
      </AdminPanel>
    </AdminShell>
  );
}
