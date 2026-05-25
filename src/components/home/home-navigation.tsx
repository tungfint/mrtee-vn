"use client";

import { motion } from "framer-motion";
import {
  BookOpenText,
  GraduationCap,
  Newspaper,
  Trophy,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { BackgroundCard } from "@/components/ui/background-card";

const links = [
  {
    title: "Tin2023",
    description: "Kỷ niệm, hồ sơ học sinh và thành tích của lớp.",
    href: "/tin2023",
    icon: UsersRound,
    backgroundImage:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Tin2326",
    description: "Không gian lưu giữ hành trình cấp ba của lớp.",
    href: "/tin2326",
    icon: GraduationCap,
    backgroundImage:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "HSG Tin",
    description: "Đội tuyển học sinh giỏi Tin học theo từng năm.",
    href: "/hsg-tin",
    icon: Trophy,
    backgroundImage:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "FTC",
    description: "Dự án, robot, hình ảnh và dấu mốc thi đấu.",
    href: "/ftc",
    icon: Trophy,
    backgroundImage:
      "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "AI",
    description: "Các hoạt động nghiên cứu, thử nghiệm và sản phẩm AI.",
    href: "/ai",
    icon: BookOpenText,
    backgroundImage:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Blog",
    description: "Bài viết chia sẻ nghề giáo, công nghệ và học tập.",
    href: "/blog",
    icon: Newspaper,
    backgroundImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
  },
];

export function HomeNavigation() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((item, index) => {
        const Icon = item.icon;

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
                className="h-full min-h-56 p-5 shadow-xl shadow-slate-900/15 group-hover:shadow-emerald-900/20"
                overlayClassName="bg-slate-950/58 group-hover:bg-slate-950/48"
              >
                <div className="mb-12 flex h-10 w-10 items-center justify-center rounded-md bg-white/90 text-emerald-700 shadow-sm">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  {item.description}
                </p>
              </BackgroundCard>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
