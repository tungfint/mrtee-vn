import Link from "next/link";

import { BackgroundCard } from "@/components/ui/background-card";

const samplePosts = [
  {
    slug: "hanh-trinh-tin-hoc",
    title: "Hành trình Tin học và những bài học nhỏ",
    excerpt: "Ghi chú mẫu cho layout blog hỗ trợ markdown/rich text.",
    backgroundImage:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "mot-tiet-hoc-dac-biet",
    title: "Một tiết học đặc biệt",
    excerpt: "Những câu chuyện nhỏ sau lớp học, dự án và đội tuyển.",
    backgroundImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-medium uppercase text-emerald-700">Blog</p>
        <h1 className="mt-2 text-3xl font-semibold">Tin tức và chia sẻ</h1>
        <div className="mt-8 space-y-4">
          {samplePosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block transition hover:-translate-y-0.5"
            >
              <BackgroundCard
                backgroundImage={post.backgroundImage}
                className="min-h-56 p-6"
                overlayClassName="bg-slate-950/58 group-hover:bg-slate-950/48"
              >
                <div className="flex min-h-40 flex-col justify-end">
                  <h2 className="text-2xl font-semibold text-white">
                    {post.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-100">
                    {post.excerpt}
                  </p>
                </div>
              </BackgroundCard>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
