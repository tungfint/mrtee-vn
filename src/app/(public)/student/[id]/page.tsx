import { CalendarDays, GraduationCap, Heart, Sparkles } from "lucide-react";

import { MediaStrip } from "@/components/content/media-strip";
import { RichContent } from "@/components/content/rich-content";
import { BackgroundCard } from "@/components/ui/background-card";

const student = {
  fullName: "Nguyễn Minh Anh",
  nickname: "Min",
  dob: "12/08/2008",
  hobbies: "Thiết kế web, chụp ảnh, đọc truyện khoa học viễn tưởng",
  futureGoal: "Khoa học máy tính - Đại học Bách khoa",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  photoWithTeacher:
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
  customPhoto1:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  customPhoto2:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
};

const imageSlots = [
  { label: "Ảnh đại diện", url: student.avatar },
  { label: "Ảnh cùng thầy", url: student.photoWithTeacher },
  { label: "Khoảnh khắc 1", url: student.customPhoto1 },
  { label: "Khoảnh khắc 2", url: student.customPhoto2 },
];

const yearbookPosts = [
  {
    title: "Một buổi chiều ở phòng Tin",
    format: "MARKDOWN" as const,
    content: `
Em nhớ nhất là những buổi cả nhóm ở lại sửa project đến khi trời tối. Có lúc
code chạy sai rất lâu, nhưng khi tìm được lỗi thì cả bàn cùng reo lên.

> Cảm ơn thầy vì đã cho tụi em được thử, được sai và được làm lại.
`,
    media: [
      {
        type: "IMAGE" as const,
        url: student.customPhoto1,
        title: "Góc làm project",
      },
      {
        type: "LINK" as const,
        url: "https://drive.google.com",
        title: "Thư mục ảnh kỷ niệm",
      },
    ],
  },
  {
    title: "Lưu bút bằng HTML",
    format: "HTML" as const,
    content:
      "<p>Một bài lưu bút khác có thể dùng <strong>HTML đã được làm sạch</strong>, nhúng link, ảnh hoặc video theo cấu trúc media đi kèm.</p>",
    media: [
      {
        type: "VIDEO" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        caption: "Một video ngắn trong bài lưu bút",
      },
    ],
  },
];

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${student.avatar})` }}
        />
        <div className="absolute inset-0 bg-slate-950/58" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <Sparkles aria-hidden className="h-4 w-4" />
            Hồ sơ học sinh #{id}
          </p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">
            {student.fullName}
          </h1>
          <p className="mt-3 text-xl text-emerald-100">{student.nickname}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {imageSlots.map((slot) => (
            <BackgroundCard
              key={slot.label}
              backgroundImage={slot.url}
              className="aspect-[4/5] p-4 shadow-xl shadow-slate-900/15"
              overlayClassName="bg-slate-950/34"
            >
              <div className="flex h-full items-end">
                <span className="rounded-md bg-white/92 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                  {slot.label}
                </span>
              </div>
            </BackgroundCard>
          ))}
        </div>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <CalendarDays
                  aria-hidden
                  className="mt-0.5 h-4 w-4 text-emerald-700"
                />
                <div>
                  <dt className="text-slate-500">Ngày sinh</dt>
                  <dd className="font-medium">{student.dob}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Heart
                  aria-hidden
                  className="mt-0.5 h-4 w-4 text-emerald-700"
                />
                <div>
                  <dt className="text-slate-500">Sở thích</dt>
                  <dd className="font-medium">{student.hobbies}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <GraduationCap
                  aria-hidden
                  className="mt-0.5 h-4 w-4 text-emerald-700"
                />
                <div>
                  <dt className="text-slate-500">Mục tiêu tương lai</dt>
                  <dd className="font-medium">{student.futureGoal}</dd>
                </div>
              </div>
            </dl>
          </div>

          <div className="space-y-5">
            <div>
              <p className="text-sm font-medium uppercase text-emerald-700">
                Lưu bút
              </p>
              <h2 className="mt-2 text-3xl font-semibold">
                Những bài viết của học sinh
              </h2>
            </div>
            {yearbookPosts.map((post) => (
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
