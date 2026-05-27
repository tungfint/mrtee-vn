import {
  GraduationCap,
  House,
  Images,
  LayoutDashboard,
  Music2,
  Newspaper,
  Trophy,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export { ActionFeedback } from "@/components/admin/action-feedback";

const adminLinks = [
  { href: "/dashboard/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/dashboard/admin/home", label: "Trang chủ", icon: House },
  { href: "/dashboard/admin/classes", label: "Lớp học", icon: GraduationCap },
  { href: "/dashboard/admin/students", label: "Học sinh", icon: UsersRound },
  { href: "/dashboard/admin/teams", label: "Đội tuyển", icon: Trophy },
  { href: "/dashboard/admin/albums", label: "Album", icon: Images },
  { href: "/dashboard/admin/posts", label: "Blog", icon: Newspaper },
  { href: "/dashboard/admin/memories", label: "Bài viết kỷ niệm", icon: Newspaper },
  { href: "/dashboard/admin/music", label: "Nhạc nền", icon: Music2 },
];

export function AdminShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <Link
            className="mb-3 block rounded-md px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            href="/dashboard"
          >
            mrtee.vn admin
          </Link>
          <nav className="grid gap-1">
            {adminLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden className="h-4 w-4 text-emerald-700" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section>
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase text-emerald-700">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

export function AdminPanel({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

export function ImageStandards() {
  return (
    <details className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-slate-800">
        Chuẩn kích thước ảnh và cách crop
      </summary>
      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
        <p><strong>Ảnh bìa trang:</strong> 1920 x 720px, tỉ lệ 8:3.</p>
        <p><strong>Ảnh nền block:</strong> 1200 x 800px, tỉ lệ 3:2.</p>
        <p><strong>Cover bài viết:</strong> 1600 x 900px, tỉ lệ 16:9.</p>
        <p><strong>Ảnh cá nhân:</strong> 800 x 800px, tỉ lệ 1:1.</p>
        <p><strong>Ảnh với thầy / tự chọn:</strong> 1200 x 900px, tỉ lệ 4:3.</p>
        <p><strong>Lưu ý:</strong> đặt khuôn mặt ở vùng crop đã chọn trước khi lưu.</p>
      </div>
    </details>
  );
}

export function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export const textareaClass =
  "min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

export const selectClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
