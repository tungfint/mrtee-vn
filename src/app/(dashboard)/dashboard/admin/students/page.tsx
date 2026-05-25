import { Role } from "@prisma/client";

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
import {
  createStudentAction,
  updateStudentAction,
  upsertStudentYearRecordAction,
} from "../actions";

export const dynamic = "force-dynamic";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function AdminStudentsPage() {
  await requireAdmin();

  const [classes, users] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      include: {
        classroom: { select: { name: true } },
        profile: { include: { yearRecords: { orderBy: { year: "desc" } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminShell
      description="Trang này là form con để chỉnh thông tin học sinh. Admin chính nên đi từ Lớp học hoặc Đội tuyển."
      title="Quản lý học sinh"
    >
      <div className="grid gap-5">
        <AdminPanel
          description="Mật khẩu mặc định nếu bỏ trống là Mrtee@2026."
          title="Thêm học sinh hoặc lớp trưởng"
        >
          <form action={createStudentAction} className="space-y-4">
            <FormGrid>
              <Field label="Email">
                <input className={inputClass} name="email" required />
              </Field>
              <Field label="Họ và tên">
                <input className={inputClass} name="fullName" required />
              </Field>
              <Field label="Mật khẩu">
                <input className={inputClass} name="password" type="password" />
              </Field>
              <Field label="Vai trò">
                <select className={selectClass} name="role" defaultValue="STUDENT">
                  {Object.values(Role).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lớp">
                <select className={selectClass} name="classId" defaultValue="none">
                  <option value="none">Không gán lớp</option>
                  {classes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Trường">
                <input className={inputClass} name="school" />
              </Field>
              <Field label="Nickname">
                <input className={inputClass} name="nickname" />
              </Field>
              <Field label="Ngày sinh">
                <input className={inputClass} name="dob" type="date" />
              </Field>
              <Field label="Đại học">
                <input className={inputClass} name="university" />
              </Field>
              <Field label="Sau đại học / Công việc">
                <input className={inputClass} name="postGraduateWork" />
              </Field>
            </FormGrid>
            <FormGrid>
              <ImageField
                cropName="avatarCrop"
                label="Ảnh cá nhân"
                name="avatar"
                recommendedSize="800 x 800px"
              />
              <ImageField
                cropName="photoWithTeacherCrop"
                label="Ảnh với thầy"
                name="photoWithTeacher"
                recommendedSize="1200 x 900px"
              />
              <ImageField
                cropName="customPhoto1Crop"
                label="Ảnh tự chọn 1"
                name="customPhoto1"
                recommendedSize="1200 x 900px"
              />
              <ImageField
                cropName="customPhoto2Crop"
                label="Ảnh tự chọn 2"
                name="customPhoto2"
                recommendedSize="1200 x 900px"
              />
              <ImageField
                cropName="coverImageCrop"
                label="Ảnh cover"
                name="coverImage"
                recommendedSize="1920 x 720px"
              />
            </FormGrid>
            <Field label="Mục tiêu tương lai">
              <textarea className={textareaClass} name="futureGoal" />
            </Field>
            <Field label="Lưu bút ngắn">
              <textarea className={textareaClass} name="yearbookMessage" />
            </Field>
            <button
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              type="submit"
            >
              Thêm tài khoản
            </button>
          </form>
        </AdminPanel>

        <AdminPanel title="Tài khoản hiện có">
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                key={user.id}
              >
                <form action={updateStudentAction} className="space-y-4">
                  <input name="userId" type="hidden" value={user.id} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {user.profile?.fullName ?? user.name ?? user.email}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {user.email} · {user.role}
                        {user.classroom ? ` · ${user.classroom.name}` : ""}
                      </p>
                    </div>
                    <button
                      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      type="submit"
                    >
                      Lưu profile
                    </button>
                  </div>
                  <FormGrid>
                    <Field label="Email">
                      <input
                        className={inputClass}
                        defaultValue={user.email}
                        name="email"
                        required
                      />
                    </Field>
                    <Field label="Họ và tên">
                      <input
                        className={inputClass}
                        defaultValue={user.profile?.fullName ?? user.name ?? ""}
                        name="fullName"
                        required
                      />
                    </Field>
                    <Field label="Vai trò">
                      <select
                        className={selectClass}
                        defaultValue={user.role}
                        name="role"
                      >
                        {Object.values(Role).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Lớp">
                      <select
                        className={selectClass}
                        defaultValue={user.classId ?? "none"}
                        name="classId"
                      >
                        <option value="none">Không gán lớp</option>
                        {classes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Trường">
                      <input
                        className={inputClass}
                        defaultValue={user.profile?.school ?? ""}
                        name="school"
                      />
                    </Field>
                    <Field label="Nickname">
                      <input
                        className={inputClass}
                        defaultValue={user.profile?.nickname ?? ""}
                        name="nickname"
                      />
                    </Field>
                    <Field label="Ngày sinh">
                      <input
                        className={inputClass}
                        defaultValue={dateValue(user.profile?.dob)}
                        name="dob"
                        type="date"
                      />
                    </Field>
                    <Field label="Đại học">
                      <input
                        className={inputClass}
                        defaultValue={user.profile?.university ?? ""}
                        name="university"
                      />
                    </Field>
                    <Field label="Sau đại học / Công việc">
                      <input
                        className={inputClass}
                        defaultValue={user.profile?.postGraduateWork ?? ""}
                        name="postGraduateWork"
                      />
                    </Field>
                  </FormGrid>
                  <FormGrid>
                    <ImageField
                      cropName="avatarCrop"
                      defaultCrop={user.profile?.avatarCrop}
                      defaultValue={user.profile?.avatar}
                      label="Ảnh cá nhân"
                      name="avatar"
                      recommendedSize="800 x 800px"
                    />
                    <ImageField
                      cropName="photoWithTeacherCrop"
                      defaultCrop={user.profile?.photoWithTeacherCrop}
                      defaultValue={user.profile?.photoWithTeacher}
                      label="Ảnh với thầy"
                      name="photoWithTeacher"
                      recommendedSize="1200 x 900px"
                    />
                    <ImageField
                      cropName="customPhoto1Crop"
                      defaultCrop={user.profile?.customPhoto1Crop}
                      defaultValue={user.profile?.customPhoto1}
                      label="Ảnh tự chọn 1"
                      name="customPhoto1"
                      recommendedSize="1200 x 900px"
                    />
                    <ImageField
                      cropName="customPhoto2Crop"
                      defaultCrop={user.profile?.customPhoto2Crop}
                      defaultValue={user.profile?.customPhoto2}
                      label="Ảnh tự chọn 2"
                      name="customPhoto2"
                      recommendedSize="1200 x 900px"
                    />
                    <ImageField
                      cropName="coverImageCrop"
                      defaultCrop={user.profile?.coverImageCrop}
                      defaultValue={user.profile?.coverImage}
                      label="Ảnh cover"
                      name="coverImage"
                      recommendedSize="1920 x 720px"
                    />
                  </FormGrid>
                  <Field label="Mục tiêu tương lai">
                    <textarea
                      className={textareaClass}
                      defaultValue={user.profile?.futureGoal ?? ""}
                      name="futureGoal"
                    />
                  </Field>
                  <Field label="Lưu bút ngắn">
                    <textarea
                      className={textareaClass}
                      defaultValue={user.profile?.yearbookMessage ?? ""}
                      name="yearbookMessage"
                    />
                  </Field>
                </form>

                {user.profile ? (
                  <section className="mt-5 rounded-md border border-slate-200 bg-white p-4">
                    <h4 className="font-semibold">Thông tin theo từng năm</h4>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {user.profile.yearRecords.map((record) => (
                        <span
                          className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
                          key={record.id}
                        >
                          {record.year} · {record.className ?? "Chưa có lớp"} ·{" "}
                          {record.school ?? "Chưa có trường"}
                        </span>
                      ))}
                    </div>
                    <form
                      action={upsertStudentYearRecordAction}
                      className="mt-4 grid gap-3"
                    >
                      <input
                        name="studentProfileId"
                        type="hidden"
                        value={user.profile.id}
                      />
                      <FormGrid>
                        <Field label="Năm">
                          <input
                            className={inputClass}
                            name="year"
                            required
                            type="number"
                          />
                        </Field>
                        <Field label="Họ và tên">
                          <input
                            className={inputClass}
                            defaultValue={user.profile.fullName}
                            name="fullName"
                            required
                          />
                        </Field>
                        <Field label="Lớp">
                          <input className={inputClass} name="className" />
                        </Field>
                        <Field label="Trường">
                          <input className={inputClass} name="school" />
                        </Field>
                        <Field label="Email">
                          <input
                            className={inputClass}
                            defaultValue={user.email}
                            name="email"
                          />
                        </Field>
                        <Field label="Nickname">
                          <input className={inputClass} name="nickname" />
                        </Field>
                        <Field label="Ngày sinh">
                          <input className={inputClass} name="dob" type="date" />
                        </Field>
                        <Field label="Đại học">
                          <input className={inputClass} name="university" />
                        </Field>
                        <Field label="Sau đại học / Công việc">
                          <input className={inputClass} name="postGraduateWork" />
                        </Field>
                      </FormGrid>
                      <FormGrid>
                        <ImageField
                          label="Ảnh cá nhân theo năm"
                          name="avatar"
                          recommendedSize="800 x 800px"
                        />
                        <ImageField
                          label="Ảnh với thầy theo năm"
                          name="photoWithTeacher"
                          recommendedSize="1200 x 900px"
                        />
                        <ImageField
                          label="Ảnh tự chọn 1 theo năm"
                          name="customPhoto1"
                          recommendedSize="1200 x 900px"
                        />
                        <ImageField
                          label="Ảnh tự chọn 2 theo năm"
                          name="customPhoto2"
                          recommendedSize="1200 x 900px"
                        />
                        <ImageField
                          label="Ảnh cover theo năm"
                          name="coverImage"
                          recommendedSize="1920 x 720px"
                        />
                      </FormGrid>
                      <Field label="Mục tiêu tương lai">
                        <textarea className={textareaClass} name="futureGoal" />
                      </Field>
                      <Field label="Lưu bút ngắn">
                        <textarea className={textareaClass} name="shortMessage" />
                      </Field>
                      <button
                        className="w-fit rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                        type="submit"
                      >
                        Lưu thông tin năm
                      </button>
                    </form>
                  </section>
                ) : null}
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
