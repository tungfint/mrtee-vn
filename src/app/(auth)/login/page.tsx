import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <LogIn aria-hidden className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold">Đăng nhập mrtee.vn</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          NextAuth đã sẵn sàng cho Credentials và Google. Form đăng nhập chi
          tiết sẽ được nối với server action/API ở bước tiếp theo.
        </p>
        <div className="mt-6 grid gap-3">
          <Button className="w-full" type="button">
            Đăng nhập bằng Google
          </Button>
          <Button className="w-full" type="button" variant="outline">
            Đăng nhập bằng email
          </Button>
        </div>
      </section>
    </main>
  );
}
