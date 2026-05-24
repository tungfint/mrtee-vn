import { Medal, PlayCircle, UsersRound } from "lucide-react";

import { MediaStrip } from "@/components/content/media-strip";
import { RichContent } from "@/components/content/rich-content";
import { BackgroundCard } from "@/components/ui/background-card";

const years = [2020, 2021, 2022, 2023, 2024, 2025];

const teamStories = [
  {
    title: "Ngày đầu vào đội tuyển",
    format: "MARKDOWN" as const,
    content: `
Buổi đầu tiên luôn hơi hồi hộp: đề khó, deadline gần, nhưng cả nhóm dần tìm
được nhịp làm việc chung.

## Điều còn nhớ

- Một bài toán tưởng đơn giản nhưng mất cả buổi tối.
- Những lần review code theo nhóm.
- Cảm giác nhẹ nhõm sau mỗi vòng thi.
`,
    media: [
      {
        type: "IMAGE" as const,
        url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
        title: "Góc luyện tập",
      },
      {
        type: "LINK" as const,
        url: "https://github.com",
        title: "Repository bài tập mẫu",
      },
    ],
  },
  {
    title: "Một video chia sẻ sau mùa thi",
    format: "HTML" as const,
    content:
      "<p>Thành viên đội tuyển có thể gửi bài chia sẻ riêng, kèm ảnh, video, audio hoặc link sản phẩm.</p>",
    media: [
      {
        type: "VIDEO" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        caption: "Video demo gắn với bài viết",
      },
    ],
  },
];

function formatTeamName(category: string) {
  if (category === "hsg-tin") return "HSG Tin";
  if (category === "ftc") return "FTC";
  if (category === "ai") return "AI";
  return category;
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const teamName = formatTeamName(category);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-slate-950/55" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <Medal aria-hidden className="h-4 w-4" />
            Đội tuyển
          </p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">
            {teamName}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">
            Hồ sơ đội tuyển theo từng năm, gồm thành viên, thành tích, gallery
            và các bài chia sẻ của học sinh.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <button
              key={year}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-800"
              type="button"
            >
              {year}
            </button>
          ))}
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <BackgroundCard
            backgroundImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80"
            className="min-h-72 p-6 lg:col-span-2"
            overlayClassName="bg-emerald-950/62"
          >
            <UsersRound aria-hidden className="mb-20 h-7 w-7 text-emerald-100" />
            <h2 className="text-3xl font-semibold text-white">
              Thành viên và thành tích 2025
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-50">
              Mỗi năm có danh sách đội hình, mô tả hành trình, giải thưởng và
              thư viện ảnh riêng.
            </p>
          </BackgroundCard>

          <BackgroundCard
            backgroundImage="https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=900&q=80"
            className="min-h-72 p-6"
            overlayClassName="bg-slate-950/62"
          >
            <PlayCircle aria-hidden className="mb-20 h-7 w-7 text-emerald-100" />
            <h2 className="text-3xl font-semibold text-white">Gallery</h2>
            <p className="mt-3 text-sm leading-7 text-slate-100">
              Ảnh, video, audio và link sản phẩm có thể gắn trực tiếp vào từng
              bài.
            </p>
          </BackgroundCard>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase text-emerald-700">
              Lưu bút đội tuyển
            </p>
            <h2 className="mt-2 text-3xl font-semibold">
              Bài viết và chia sẻ
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {teamStories.map((post) => (
              <article
                key={post.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5"
              >
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <RichContent
                  className="mt-4"
                  content={post.content}
                  format={post.format}
                />
                <MediaStrip items={post.media} />
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
