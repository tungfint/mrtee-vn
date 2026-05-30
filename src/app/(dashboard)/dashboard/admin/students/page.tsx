import { Role, StudentPageScope } from "@prisma/client";

import {
  AdminPanel,
  AdminShell,
  Field,
  FormGrid,
  inputClass,
  selectClass,
  textareaClass,
} from "@/components/admin/admin-shell";
import { StudentLinksManager, type StudentLinkRow } from "@/components/admin/student-links-manager";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { createStudentAction, importStudentPagesAction } from "../actions";

export const dynamic = "force-dynamic";

function siteUrl() {
  return (process.env.NEXTAUTH_URL ?? "https://mrtee.vn").replace(/\/$/, "");
}

export default async function AdminStudentsPage() {
  await requireAdmin();

  const [classes, teams, users, studentPages] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.team.findMany({ orderBy: [{ category: "asc" }, { year: "desc" }] }),
    prisma.user.findMany({
      include: {
        classroom: { select: { name: true } },
        profile: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
    }),
    prisma.studentPage.findMany({
      include: {
        class: { select: { name: true, slug: true } },
        studentProfile: { select: { fullName: true } },
        team: { select: { category: true, year: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const linkContexts = [
    ...classes.map((item) => ({
      id: `${StudentPageScope.CLASS}:${item.id}`,
      label: `${item.name} /${item.slug}`,
    })),
    ...teams.map((team) => {
      const slug = team.category.toLowerCase().replace("_", "-");

      return {
        id: `${StudentPageScope.TEAM}:${team.id}`,
        label: `${slug}/${team.year}`,
      };
    }),
  ];

  const linkRows: StudentLinkRow[] = studentPages.map((page) => {
    const isClass = page.scope === StudentPageScope.CLASS;
    const contextPath = isClass
      ? `/${page.class?.slug ?? ""}`
      : `/${page.team?.category.toLowerCase().replace("_", "-")}/${page.team?.year}`;
    const publicHref = `${contextPath}/${page.studentSlug}`;
    const absolutePublicHref = `${siteUrl()}${publicHref}`;

    return {
      articleHref: `${absolutePublicHref}/baiviet/${page.inputToken}`,
      contextId: isClass
        ? `${StudentPageScope.CLASS}:${page.classId}`
        : `${StudentPageScope.TEAM}:${page.teamId}`,
      contextLabel: isClass
        ? `${page.class?.name ?? "Lớp học"} /${page.class?.slug ?? ""}`
        : `${page.team?.category.toLowerCase().replace("_", "-")}/${page.team?.year}`,
      id: page.id,
      infoHref: `${absolutePublicHref}/thongtin/${page.inputToken}`,
      publicHref: absolutePublicHref,
      scope: page.scope,
      studentName: page.studentProfile.fullName || page.fullNameSnapshot,
      studentSlug: page.studentSlug,
      token: page.inputToken,
    };
  });

  return (
    <AdminShell
      description="Quản lý học sinh, tạo link nhập thông tin, link nhập bài viết, đổi token và xuất danh sách link để gửi riêng cho từng học sinh."
      title="Quản lý học sinh"
    >
      <div className="grid gap-5">
        <AdminPanel
          description="Chọn một lớp hoặc một đội tuyển, sau đó nhập mỗi học sinh một dòng. Hệ thống sẽ dùng lại hồ sơ đã có theo email hoặc họ tên để tránh nhập thông tin nhiều lần. Có thể ghi 'Tên học sinh | slug-rieng | email' nếu muốn chỉ rõ hồ sơ."
          title="Import học sinh và tạo link"
        >
          <form action={importStudentPagesAction} className="grid gap-4">
            <Field label="Lớp / đội tuyển">
              <select className={selectClass} name="studentPageContext" required>
                <optgroup label="Lớp học">
                  {classes.map((item) => (
                    <option key={item.id} value={`${StudentPageScope.CLASS}:${item.id}`}>
                      {item.name} /{item.slug}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Đội tuyển">
                  {teams.map((team) => {
                    const slug = team.category.toLowerCase().replace("_", "-");

                    return (
                      <option key={team.id} value={`${StudentPageScope.TEAM}:${team.id}`}>
                        {slug}/{team.year}
                      </option>
                    );
                  })}
                </optgroup>
              </select>
            </Field>
            <Field label="Danh sách học sinh">
              <textarea
                className={`${textareaClass} min-h-40`}
                name="studentPageNames"
                placeholder={"Nguyễn Thanh Tùng\nLê Văn An\nLê Văn An | levanan2 | an@example.com"}
                required
              />
            </Field>
            <button
              className="w-fit rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              type="submit"
            >
              Tạo link học sinh
            </button>
          </form>
        </AdminPanel>

        <AdminPanel
          description="Lọc theo tên, lớp, đội tuyển rồi xuất CSV. Link thông tin và link bài viết dùng chung token; bấm tạo link mới để đổi token cho học sinh đó."
          title="Link thông tin và bài viết"
        >
          <StudentLinksManager contexts={linkContexts} rows={linkRows} />
        </AdminPanel>

        <AdminPanel
          description="Tạo tài khoản nhanh khi cần gán học sinh vào hệ thống đăng nhập. Mật khẩu mặc định nếu bỏ trống là Mrtee@2026."
          title="Tạo tài khoản học sinh"
        >
          <form action={createStudentAction} className="grid gap-4">
            <FormGrid>
              <Field label="Email">
                <input className={inputClass} name="email" required type="email" />
              </Field>
              <Field label="Họ và tên">
                <input className={inputClass} name="fullName" required />
              </Field>
              <Field label="Mật khẩu">
                <input className={inputClass} name="password" type="password" />
              </Field>
              <Field label="Vai trò">
                <select className={selectClass} defaultValue={Role.STUDENT} name="role">
                  {Object.values(Role).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Lớp">
                <select className={selectClass} defaultValue="none" name="classId">
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
            </FormGrid>
            <button
              className="w-fit rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              type="submit"
            >
              Tạo tài khoản
            </button>
          </form>
        </AdminPanel>

        <AdminPanel title="Tài khoản gần đây">
          <div className="grid gap-3">
            {users.map((user) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
                key={user.id}
              >
                <h3 className="font-semibold">
                  {user.profile?.fullName ?? user.name ?? user.email}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {user.email} · {user.role}
                  {user.classroom ? ` · ${user.classroom.name}` : ""}
                </p>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
