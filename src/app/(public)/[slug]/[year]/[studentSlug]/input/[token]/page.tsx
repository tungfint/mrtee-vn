import { notFound } from "next/navigation";

import { StudentInputForm } from "@/components/content/student-input-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function categoryFromSlug(slug: string) {
  if (slug === "hsg-tin") return "HSG_TIN";
  if (slug === "ftc") return "FTC";
  if (slug === "ai") return "AI";
  return null;
}

export default async function TeamStudentInputPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; year: string; studentSlug: string; token: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug, studentSlug, token, year } = await params;
  const query = await searchParams;
  const category = categoryFromSlug(slug);
  const yearNumber = Number(year);

  if (!category || !Number.isInteger(yearNumber)) {
    notFound();
  }

  const studentPage = await prisma.studentPage.findFirst({
    include: {
      studentProfile: true,
      team: { select: { category: true, year: true } },
    },
    where: {
      inputToken: token,
      studentSlug,
      team: {
        category: category as "HSG_TIN" | "FTC" | "AI",
        year: yearNumber,
      },
    },
  });

  if (!studentPage?.team) {
    notFound();
  }

  const profile = studentPage.studentProfile;
  const publicHref = `/${slug}/${year}/${studentPage.studentSlug}`;

  return (
    <StudentInputForm
      contextLabel={`Đội tuyển ${slug}/${year}`}
      initialData={{
        avatar: profile.avatar,
        cityCountry: profile.cityCountry,
        company: profile.company,
        coverImage: profile.coverImage,
        customPhoto1: profile.customPhoto1,
        customPhoto2: profile.customPhoto2,
        dob: dateValue(profile.dob),
        fullName: profile.fullName,
        futureGoal: profile.futureGoal,
        hobbies: profile.hobbies,
        nickname: profile.nickname,
        photoWithTeacher: profile.photoWithTeacher,
        postGraduateWork: profile.postGraduateWork,
        school: profile.school,
        university: profile.university,
        workField: profile.workField,
        yearbookFormat: profile.yearbookFormat,
        yearbookMessage: profile.yearbookMessage,
      }}
      pageId={studentPage.id}
      publicHref={publicHref}
      saved={query.saved === "1"}
      token={token}
    />
  );
}
