export default function EditProfilePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase text-emerald-700">
          Hồ sơ cá nhân
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Chỉnh sửa profile</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Route này dành cho STUDENT tự cập nhật đúng 4 ảnh, thông tin cơ bản
          và lưu bút của chính mình.
        </p>
      </div>
    </main>
  );
}
