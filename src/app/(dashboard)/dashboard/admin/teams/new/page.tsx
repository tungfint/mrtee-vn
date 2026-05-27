import { ContentFormat, TeamCategory } from "@prisma/client";
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
import { createTeamAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NewTeamPage({
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
      description="Tạo khối đội tuyển theo năm. Sau khi tạo, vào trang chi tiết để import thành viên và thêm bài viết."
      title="Thêm đội tuyển"
    >
      <div className="mb-4">
        <Link
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          href="/dashboard/admin/teams"
        >
          Quay lại danh sách đội tuyển
        </Link>
      </div>
      <ActionFeedback message={feedback.message} status={feedback.status} />

      <AdminPanel title="Thông tin đội tuyển">
        <form action={createTeamAction} className="space-y-4">
          <FormGrid>
            <Field label="Nhóm">
              <select className={selectClass} defaultValue="HSG_TIN" name="category">
                {Object.values(TeamCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Năm">
              <input className={inputClass} name="year" required type="number" />
            </Field>
            <Field label="Đội trưởng">
              <select className={selectClass} defaultValue="none" name="monitorId">
                <option value="none">Chưa chọn</option>
                {monitorUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name ?? user.email} · {user.role}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Định dạng giới thiệu">
              <select className={selectClass} defaultValue="MARKDOWN" name="introFormat">
                {Object.values(ContentFormat).map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Thứ tự trên trang chủ">
              <input className={inputClass} defaultValue={0} name="displayOrder" type="number" />
            </Field>
          </FormGrid>
          <FormGrid>
            <ImageField
              cropName="coverImageCrop"
              label="Ảnh bìa đội tuyển"
              name="coverImage"
              recommendedSize="1920 x 720px"
            />
            <ImageField
              cropName="cardBackgroundImageCrop"
              label="Ảnh nền block năm"
              name="cardBackgroundImage"
              recommendedSize="1200 x 800px"
            />
            <ImageField
              cropName="backgroundImageCrop"
              label="Ảnh nền hero"
              name="backgroundImage"
              recommendedSize="1920 x 1080px"
            />
          </FormGrid>
          <Field label="Mô tả ngắn">
            <textarea className={textareaClass} name="description" />
          </Field>
          <Field label="Giới thiệu chung / trang chủ đội tuyển">
            <textarea
              className={textareaClass}
              name="introContent"
              placeholder="Nội dung Markdown/HTML cho phần giới thiệu chung."
            />
          </Field>
          <Field label="Thành tích">
            <textarea className={textareaClass} name="achievements" />
          </Field>
          <Field label="Gallery image URLs, mỗi dòng một link">
            <textarea className={textareaClass} name="galleryImages" />
          </Field>
          <ImageStandards />
          <button
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            type="submit"
          >
            Thêm đội tuyển
          </button>
        </form>
      </AdminPanel>
    </AdminShell>
  );
}
