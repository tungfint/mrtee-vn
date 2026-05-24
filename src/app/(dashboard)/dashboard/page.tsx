export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-medium uppercase text-emerald-700">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Khu vực quản trị</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          ADMIN quản lý toàn bộ dữ liệu. MONITOR chỉnh sửa lớp được phân công.
          STUDENT cập nhật hồ sơ cá nhân của mình.
        </p>
      </div>
    </main>
  );
}
