import { Mail, MapPin, UserRound } from "lucide-react";
import type { ReactNode } from "react";

import { PublicAdminShortcuts } from "@/components/admin/public-admin-shortcuts";
import { MrTeeLogo } from "@/components/brand/mrtee-logo";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicAdminShortcuts />
      <div className="flex-1">{children}</div>
      <footer className="shrink-0 border-t border-slate-200 bg-white text-slate-700">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 md:grid-cols-[1.1fr_1fr] lg:px-10">
          <div>
            <MrTeeLogo />
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Nơi lưu giữ kỷ niệm của các lớp học, đội tuyển và các thế hệ học sinh của thầy Tùng.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            <p className="flex items-center gap-2 font-semibold text-slate-950">
              <UserRound aria-hidden className="h-4 w-4 text-emerald-700" />
              Nguyễn Thanh Tùng
            </p>
            <p className="flex items-center gap-2">
              <MapPin aria-hidden className="h-4 w-4 text-emerald-700" />
              THPT Chuyên Hà Nội - Amsterdam
            </p>
            <a className="flex items-center gap-2 hover:text-emerald-800" href="mailto:tungnt@hnams.edu.vn">
              <Mail aria-hidden className="h-4 w-4 text-emerald-700" />
              tungnt@hnams.edu.vn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
