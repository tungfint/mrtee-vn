import { MrTeeLogo } from "@/components/brand/mrtee-logo";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <MrTeeLogo className="mb-6" />
        <h1 className="text-2xl font-semibold">Đăng nhập mrtee.vn</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Dùng tài khoản seed để kiểm thử nhanh các vai trò ADMIN, MONITOR và
          STUDENT.
        </p>
        <LoginForm
          callbackUrl={callbackUrl ?? "/dashboard"}
          googleEnabled={googleEnabled}
        />
      </section>
    </main>
  );
}
