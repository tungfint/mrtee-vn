"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Newspaper,
  Trophy,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { BackgroundCard } from "@/components/ui/background-card";

type HomeNavigationItem = {
  backgroundImage?: string | null;
  backgroundPosition?: string | null;
  description: string;
  href: string;
  kind: "class" | "team" | "blog";
  title: string;
};

const fallbackLinks: HomeNavigationItem[] = [
  {
    title: "Tin2023",
    description: "Không gian lưu giữ hành trình của chúng ta.",
    href: "/tin2023",
    kind: "class",
    backgroundImage:
      "https://drive.google.com/open?id=1rnXV8ZvdHMOxiEunF_jEy4e9F_Z_WYDt&usp=drive_fs?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tin2326",
    description: "Kỷ niệm quý báu không thể nào quên.",
    href: "/tin2326",
    kind: "class",
    backgroundImage:
      "https://drive.google.com/open?id=17wypm_VMME-9YY6QK4DwX4InLsM1vvOt&usp=drive_fs?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Đội tuyển HSG Tin",
    description: "Những cao thủ trong làng Tin học và những thành tích đáng tự hào.",
    href: "/hsg-tin",
    kind: "team",
    backgroundImage:
      "https://drive.google.com/open?id=1lLtHbzFEI_n77YHEy71_qBF7zyr791Gq&usp=drive_fs?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Đội tuyển Robotics FTC",
    description: "Chúng ta và em bot và những hành trình đáng nhớ!",
    href: "/ftc",
    kind: "team",
    backgroundImage:
      "https://drive.google.com/open?id=1Y8Zdj0kMM_QppxzTsH1N7UqZprZT-Rnb&usp=drive_fs?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Đội tuyển AI",
    description: "Chinh phục những thử thách mới.",
    href: "/ai",
    kind: "team",
    backgroundImage:
      "https://drive.google.com/open?id=11XTbGqwgxzRd8J4NwfUEy6_FpRdxEfDK&usp=drive_fs?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Blog",
    description: "Những chia sẻ, những câu chuyện và những kỷ niệm của chúng ta.",
    href: "/blog",
    kind: "blog",
    backgroundImage:
      "https://drive.google.com/open?id=11wSOdKPYsSX2NkfEVfhGiXxUWuPZ8Ur5&usp=drive_fs?auto=format&fit=crop&w=900&q=80",
  },
];

function iconFor(item: HomeNavigationItem) {
  if (item.kind === "team") return Trophy;
  if (item.kind === "blog") return Newspaper;
  return item.title.toLowerCase().includes("2326") ? GraduationCap : UsersRound;
}

export function HomeNavigation({ items = fallbackLinks }: { items?: HomeNavigationItem[] }) {
  const links = items.length ? items : fallbackLinks;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((item, index) => {
        const Icon = iconFor(item);

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
          >
            <Link
              href={item.href}
              className="group block h-full transition hover:-translate-y-0.5"
            >
              <BackgroundCard
                backgroundImage={item.backgroundImage}
                backgroundPosition={item.backgroundPosition}
                className="h-full min-h-56 p-5 shadow-xl shadow-slate-900/15 group-hover:shadow-emerald-900/20"
                overlayClassName="bg-gradient-to-t from-white/18 via-transparent to-transparent"
              >
                <div className="flex min-h-48 flex-col justify-end">
                  <div className="mb-auto flex h-10 w-10 items-center justify-center rounded-md bg-white/90 text-emerald-700 shadow-sm">
                    <Icon aria-hidden className="h-5 w-5" />
                  </div>
                  <div className="rounded-md bg-white/74 p-4 text-slate-950 shadow-lg backdrop-blur-[2px] transition group-hover:bg-white/84">
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700">
                      {item.description}
                    </p>
                  </div>
                </div>
              </BackgroundCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
