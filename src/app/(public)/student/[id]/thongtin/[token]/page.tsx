import { StudentPageScope } from "@prisma/client";
import { notFound } from "next/navigation";

import { StudentInputForm } from "@/components/content/student-input-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function IndependentStudentInfoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; token: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id, token } = await params;
  const query = await searchParams;
  const studentPage = await prisma.studentPage.findFirst({
    include: { studentProfile: { include: { user: { select: { email: true } } } } },
    where: {
      inputToken: token,
      scope: StudentPageScope.INDEPENDENT,
      studentSlug: id,
    },
  });

  if (!studentPage) {
    notFound();
  }

  const profile = studentPage.studentProfile;
  const publicHref = `/student/${studentPage.studentSlug}`;

  return (
    <StudentInputForm
      contextLabel="Hồ sơ cá nhân"
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
