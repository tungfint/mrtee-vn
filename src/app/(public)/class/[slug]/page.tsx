import { BookOpenText, Camera, Headphones, Sparkles } from "lucide-react";
import Link from "next/link";

import { MediaStrip } from "@/components/content/media-strip";
import { RichContent } from "@/components/content/rich-content";
import { BackgroundCard } from "@/components/ui/background-card";

const classArticle = {
  title: "Những ngày xanh của Tin2023",
  content: `
Tin2023 là một góc nhỏ rất nhiều tiếng cười, những buổi chạy deadline dự án,
những tiết Tin có lúc nghiêm túc tuyệt đối và có lúc đầy những câu hỏi rất bất
ngờ.

## Dấu mốc đáng nhớ

- Cùng nhau hoàn thành các dự án web đầu tiên.
- Có nhóm tham gia đội tuyển và hoạt động STEM.
- Lưu lại ảnh, video, file âm thanh và liên kết kỷ niệm theo từng năm.
`,
  media: [
    {
      type: "IMAGE" as const,
      url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
      title: "Khoảnh khắc lớp học",
    },
    {
      type: "AUDIO" as const,
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
      title: "Một đoạn ghi âm kỷ niệm",
    },
  ],
};

const sampleStudents = [
  {
    id: "demo-1",
    name: "Nguyễn Minh Anh",
    nickname: "Min",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "demo-2",
    name: "Trần Quốc Bảo",
    nickname: "BaoJS",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "demo-3",
    name: "Lê Gia Hân",
    nickname: "Hana",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "demo-4",
    name: "Phạm Đức Long",
    nickname: "LongPy",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=80",
  },
];

export default async function ClassPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const className = slug.toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-slate-950/50" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <Sparkles aria-hidden className="h-4 w-4" />
            Trang lớp học
          </p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">
            {className}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">
            “Code có thể sai rồi sửa, nhưng thanh xuân thì phải lưu lại thật
            đẹp.”
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:px-10">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <BookOpenText aria-hidden className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase text-emerald-700">
                Bài viết giới thiệu
              </p>
              <h2 className="text-2xl font-semibold">{classArticle.title}</h2>
            </div>
          </div>
          <RichContent content={classArticle.content} />
          <MediaStrip items={classArticle.media} />
        </article>

        <div className="grid gap-4">
          <BackgroundCard
            backgroundImage="https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?auto=format&fit=crop&w=900&q=80"
            className="min-h-52 p-5"
            overlayClassName="bg-emerald-950/60"
          >
            <Camera aria-hidden className="mb-10 h-6 w-6 text-emerald-100" />
            <h2 className="text-2xl font-semibold text-white">Album lớp</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50">
              Ảnh bìa, Google Drive, Flickr hoặc link media ngoài sẽ nằm ở
              khối này.
            </p>
          </BackgroundCard>
          <BackgroundCard
            backgroundImage="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80"
            className="min-h-52 p-5"
            overlayClassName="bg-slate-950/60"
          >
            <Headphones aria-hidden className="mb-10 h-6 w-6 text-emerald-100" />
            <h2 className="text-2xl font-semibold text-white">Ký ức media</h2>
            <p className="mt-2 text-sm leading-6 text-slate-100">
              Nội dung dài có thể kèm hình ảnh, video, audio và liên kết trong
              từng bài viết.
            </p>
          </BackgroundCard>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8 lg:px-10">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase text-emerald-700">
            Thành viên
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Gương mặt trong lớp</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sampleStudents.map((student) => (
            <Link
              key={student.id}
              href={`/student/${student.id}`}
              className="group block transition hover:-translate-y-1"
            >
              <BackgroundCard
                backgroundImage={student.avatar}
                className="min-h-80 p-5 shadow-xl shadow-slate-900/15 group-hover:ring-emerald-300"
                overlayClassName="bg-slate-950/42 group-hover:bg-slate-950/32"
              >
                <div className="flex min-h-64 flex-col justify-end">
                  <div className="rounded-lg bg-white/92 p-4 shadow-lg backdrop-blur">
                    <h3 className="text-lg font-semibold text-slate-950">
                      {student.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-emerald-700">
                      {student.nickname}
                    </p>
                  </div>
                </div>
              </BackgroundCard>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
