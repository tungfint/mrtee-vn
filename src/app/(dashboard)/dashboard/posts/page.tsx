export default function ManagePostsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase text-emerald-700">
          Blog ADMIN
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Quản lý bài viết</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Proxy RBAC đã giới hạn route này cho ADMIN.
        </p>
      </div>
    </main>
  );
}
