import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const [monitoredClasses, monitoredTeams] = await Promise.all([
    prisma.class.findMany({
      orderBy: { name: "asc" },
      where:
        session.user.role === "ADMIN"
          ? undefined
          : { monitorId: session.user.id },
    }),
    prisma.team.findMany({
      orderBy: [{ category: "asc" }, { year: "desc" }],
      where:
        session.user.role === "ADMIN"
          ? undefined
          : { monitorId: session.user.id },
    }),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium uppercase text-emerald-700">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Khu vực quản trị</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Admin có toàn quyền. Lớp trưởng hoặc đội trưởng chỉ nhìn thấy các lớp
          và đội tuyển được phân công để chỉnh thông tin, thành viên và bài viết.
          Học sinh cập nhật hồ sơ cá nhân của mình.
        </p>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-2 font-semibold">{session.user.email}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Vai trò</p>
            <p className="mt-2 font-semibold text-emerald-700">
              {session.user.role}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Lớp đang học</p>
            <p className="mt-2 font-semibold">
              {session.user.classId ?? "Không có"}
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          {session.user.role === "ADMIN" ? (
            <Link
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              href="/dashboard/admin"
            >
              Trang quản trị admin
            </Link>
          ) : null}
          <Link
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            href="/dashboard/profile/edit"
          >
            Sửa profile
          </Link>
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Lớp được phân công</h2>
            <div className="mt-4 grid gap-3">
              {monitoredClasses.length ? (
                monitoredClasses.map((classroom) => (
                  <Link
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
                    href={`/dashboard/classes/${classroom.id}/edit`}
                    key={classroom.id}
                  >
                    {classroom.name}
                    <span className="ml-2 text-slate-500">
                      /{classroom.slug}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Chưa có lớp nào được phân công cho tài khoản này.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">Đội tuyển được phân công</h2>
            <div className="mt-4 grid gap-3">
              {monitoredTeams.length ? (
                monitoredTeams.map((team) => (
                  <Link
                    className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-emerald-300 hover:bg-emerald-50"
                    href={`/dashboard/teams/${team.id}/edit`}
                    key={team.id}
                  >
                    {team.category} {team.year}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Chưa có đội tuyển nào được phân công cho tài khoản này.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
