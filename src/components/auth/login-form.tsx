"use client";

import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";

type LoginFormProps = {
  callbackUrl: string;
  googleEnabled?: boolean;
};

export function LoginForm({
  callbackUrl,
  googleEnabled = false,
}: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@mrtee.vn");
  const [password, setPassword] = useState("Mrtee@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email/mật khẩu chưa đúng hoặc database chưa có tài khoản test.");
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4">
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Mật khẩu
          <span className="relative mt-2 block">
            <input
              className="h-11 w-full rounded-md border border-slate-300 px-3 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setShowPassword((value) => !value)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden className="h-4 w-4" />
              ) : (
                <Eye aria-hidden className="h-4 w-4" />
              )}
            </button>
          </span>
        </label>

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <Button className="w-full" disabled={loading} type="submit">
          {loading ? "Đang đăng nhập..." : "Đăng nhập bằng email"}
        </Button>
      </form>

      {googleEnabled ? (
        <Button
          className="w-full"
          onClick={() => signIn("google", { callbackUrl })}
          type="button"
          variant="outline"
        >
          Đăng nhập bằng Google
        </Button>
      ) : null}
    </div>
  );
}
