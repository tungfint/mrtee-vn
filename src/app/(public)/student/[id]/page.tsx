import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  GraduationCap,
  Heart,
  Sparkles,
} from "lucide-react";
import { StudentPageScope } from "@prisma/client";
import Link from "next/link";

import { MediaStrip } from "@/components/content/media-strip";
import { RichContent } from "@/components/content/rich-content";
import { BackgroundCard } from "@/components/ui/background-card";
import { ImageLightboxButton } from "@/components/ui/image-lightbox";
import { displayImageUrl } from "@/lib/media-urls";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallbackAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80";

const fallbackStudent = {
  avatar: fallbackAvatar,
  cityCountry: "",
  company: "",
  contactMethod: "",
  coverImage: fallbackAvatar,
  customPhoto1:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  customPhoto2:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  dob: "12/08/2008",
  email: "",
  fullName: "Nguyễn Minh Anh",
  futureGoal: "Khoa học máy tính - Đại học Bách khoa",
  hobbies: "Thiết kế web, chụp ảnh, đọc truyện khoa học viễn tưởng",
  nickname: "Min",
  photoWithTeacher:
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
  postGraduateWork: "",
  university: "Đại học Bách khoa",
  workField: "",
  yearbookFormat: "MARKDOWN" as const,
  yearbookMessage:
    "Em nhớ nhất là những buổi cả nhóm ở lại sửa project đến khi trời tối.",
};

const fallbackPosts = [
  {
    content: `
Em nhớ nhất là những buổi cả nhóm ở lại sửa project đến khi trời tối. Có lúc
code chạy sai rất lâu, nhưng khi tìm được lỗi thì cả bàn cùng reo lên.

> Cảm ơn thầy vì đã cho tụi em được thử, được sai và được làm lại.
`,
    contentFormat: "MARKDOWN" as const,
    id: "fallback-yearbook",
    media: [
      {
        title: "Góc làm project",
        type: "IMAGE" as const,
        url: fallbackStudent.customPhoto1,
      },
      {
        title: "Thư mục ảnh kỷ niệm",
        type: "LINK" as const,
        url: "https://drive.google.com",
      },
    ],
    title: "Một buổi chiều ở phòng Tin",
  },
];

type MediaItemInput = {
  caption?: string | null;
  title?: string | null;
  type: "IMAGE" | "VIDEO" | "AUDIO" | "LINK" | "FILE";
  url: string;
};

function mediaItems(items: MediaItemInput[]) {
  return items.map((item) => ({
    caption: item.caption ?? undefined,
    title: item.title ?? undefined,
    type: item.type,
    url: item.url,
  }));
}

function formatDate(value?: Date | null) {
  return value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(value)
    : "";
}

async function loadStudent(id: string) {
  try {
    const studentPage = await prisma.studentPage.findFirst({
      select: { studentProfileId: true },
      where: {
        scope: StudentPageScope.INDEPENDENT,
        studentSlug: id,
      },
    });

    return await prisma.studentProfile.findFirst({
      include: {
        memoryPosts: {
          include: { media: { orderBy: { sortOrder: "asc" } } },
          orderBy: { updatedAt: "desc" },
          where: { publishedAt: { not: null } },
        },
        user: true,
      },
      where: {
        OR: [{ id }, { userId: id }, ...(studentPage ? [{ id: studentPage.studentProfileId }] : [])],
      },
    });
  } catch {
    return null;
  }
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await loadStudent(id);
  const student = profile
    ? {
        avatar: profile.avatar ?? fallbackAvatar,
        coverImage: profile.coverImage ?? profile.avatar ?? fallbackAvatar,
        customPhoto1: profile.customPhoto1 ?? fallbackStudent.customPhoto1,
        customPhoto2: profile.customPhoto2 ?? fallbackStudent.customPhoto2,
        contactMethod: profile.contactMethod ?? "",
        dob: formatDate(profile.dob),
        email: profile.user.email,
        fullName: profile.fullName,
        cityCountry: profile.cityCountry ?? "",
        company: profile.company ?? "",
        futureGoal: profile.futureGoal ?? "",
        hobbies: profile.hobbies ?? "",
        nickname: profile.nickname ?? "",
        photoWithTeacher:
          profile.photoWithTeacher ?? fallbackStudent.photoWithTeacher,
        postGraduateWork: profile.postGraduateWork ?? "",
        university: profile.university ?? "",
        workField: profile.workField ?? "",
        yearbookFormat: profile.yearbookFormat,
        yearbookMessage: profile.yearbookMessage ?? "",
      }
    : fallbackStudent;
  const posts = profile?.memoryPosts.length ? profile.memoryPosts : fallbackPosts;

  const imageSlots = [
    {
      label: "Ảnh đại diện",
      position: profile?.avatarCrop ?? "center",
      url: student.avatar,
    },
    {
      label: "Ảnh cùng thầy",
      position: profile?.photoWithTeacherCrop ?? "center",
      url: student.photoWithTeacher,
    },
    {
      label: "Khoảnh khắc 1",
      position: profile?.customPhoto1Crop ?? "center",
      url: student.customPhoto1,
    },
    {
      label: "Khoảnh khắc 2",
      position: profile?.customPhoto2Crop ?? "center",
      url: student.customPhoto2,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${displayImageUrl(student.coverImage) ?? student.coverImage})`,
            backgroundPosition: profile?.coverImageCrop ?? "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/40 to-transparent" />
        <ImageLightboxButton
          className="absolute right-5 top-5 z-20"
          imageUrl={student.coverImage}
          label="Xem ảnh bìa"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-100 ring-1 ring-white/15">
            <Sparkles aria-hidden className="h-4 w-4" />
            Hồ sơ học sinh #{profile?.id ?? id}
          </p>
          <h1 className="mt-5 text-4xl font-semibold sm:text-6xl">
            {student.fullName}
          </h1>
          {student.nickname ? (
            <p className="mt-3 text-xl text-emerald-100">{student.nickname}</p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-md bg-white/12 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/20"
              href="/"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Trang chủ
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {imageSlots.map((slot) => (
            <BackgroundCard
              backgroundImage={slot.url}
              backgroundPosition={slot.position}
              className="aspect-[4/5] p-4 shadow-xl shadow-slate-900/15"
              key={slot.label}
              overlayClassName="bg-gradient-to-t from-slate-950/12 via-transparent to-transparent"
              showImageAction
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
              {student.email ? (
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    aria-hidden
                    className="mt-0.5 h-4 w-4 text-emerald-700"
                  />
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="font-medium">{student.email}</dd>
                  </div>
                </div>
              ) : null}
              {student.dob ? (
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
              ) : null}
              {student.hobbies ? (
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
              ) : null}
              {student.university ? (
                <div className="flex gap-3">
                  <GraduationCap
                    aria-hidden
                    className="mt-0.5 h-4 w-4 text-emerald-700"
                  />
                  <div>
                    <dt className="text-slate-500">Đại học</dt>
                    <dd className="font-medium">{student.university}</dd>
                  </div>
                </div>
              ) : null}
              {student.postGraduateWork ? (
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    aria-hidden
                    className="mt-0.5 h-4 w-4 text-emerald-700"
                  />
                  <div>
                    <dt className="text-slate-500">
                      Sau đại học / Công việc
                    </dt>
                    <dd className="font-medium">{student.postGraduateWork}</dd>
                  </div>
                </div>
              ) : null}
              {student.cityCountry ? (
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    aria-hidden
                    className="mt-0.5 h-4 w-4 text-emerald-700"
                  />
                  <div>
                    <dt className="text-slate-500">Thành phố - Quốc gia</dt>
                    <dd className="font-medium">{student.cityCountry}</dd>
                  </div>
                </div>
              ) : null}
              {student.workField ? (
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    aria-hidden
                    className="mt-0.5 h-4 w-4 text-emerald-700"
                  />
                  <div>
                    <dt className="text-slate-500">Lĩnh vực đang làm</dt>
                    <dd className="font-medium">{student.workField}</dd>
                  </div>
                </div>
              ) : null}
              {student.company ? (
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    aria-hidden
                    className="mt-0.5 h-4 w-4 text-emerald-700"
                  />
                  <div>
                    <dt className="text-slate-500">Công ty đang làm</dt>
                    <dd className="font-medium">{student.company}</dd>
                  </div>
                </div>
              ) : null}
              {student.contactMethod ? (
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    aria-hidden
                    className="mt-0.5 h-4 w-4 text-emerald-700"
                  />
                  <div>
                    <dt className="text-slate-500">Cách thức liên lạc</dt>
                    <dd className="font-medium whitespace-pre-line">{student.contactMethod}</dd>
                  </div>
                </div>
              ) : null}
              {student.futureGoal ? (
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
              ) : null}
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
            {student.yearbookMessage ? (
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
                <h3 className="text-xl font-semibold">Lưu bút ngắn</h3>
                <RichContent
                  className="mt-4"
                  content={student.yearbookMessage}
                  format={student.yearbookFormat}
                />
              </article>
            ) : null}
            {posts.map((post) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5"
                key={post.id}
              >
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <RichContent
                  className="mt-4"
                  content={post.content}
                  format={post.contentFormat}
                />
                <MediaStrip items={mediaItems(post.media)} />
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
