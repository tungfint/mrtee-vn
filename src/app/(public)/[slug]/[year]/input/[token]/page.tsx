import { notFound } from "next/navigation";

import { StudentInputForm } from "@/components/content/student-input-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function ClassStudentInputPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; token: string; year: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { slug, token, year: studentSlug } = await params;
  const query = await searchParams;
  const studentPage = await prisma.studentPage.findFirst({
    include: {
      class: { select: { name: true, slug: true } },
      studentProfile: { include: { user: { select: { email: true } } } },
    },
    where: {
      class: { slug },
      inputToken: token,
      studentSlug,
    },
  });

  if (!studentPage?.class) {
    notFound();
  }

  const profile = studentPage.studentProfile;
  const publicHref = `/${studentPage.class.slug}/${studentPage.studentSlug}`;

  return (
    <StudentInputForm
      contextLabel={`Lớp ${studentPage.class.name}`}
      initialData={{
        avatar: profile.avatar,
        cityCountry: profile.cityCountry,
        company: profile.company,
        coverImage: profile.coverImage,
        customPhoto1: profile.customPhoto1,
        customPhoto2: profile.customPhoto2,
        contactMethod: profile.contactMethod,
        dob: dateValue(profile.dob),
        email: profile.user.email,
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
