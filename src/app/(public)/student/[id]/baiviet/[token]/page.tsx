import { StudentPageScope } from "@prisma/client";
import { notFound } from "next/navigation";

import { StudentArticleForm } from "@/components/content/student-article-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IndependentStudentArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; token: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id, token } = await params;
  const query = await searchParams;
  const studentPage = await prisma.studentPage.findFirst({
    include: { studentProfile: { select: { fullName: true } } },
    where: {
      inputToken: token,
      scope: StudentPageScope.INDEPENDENT,
      studentSlug: id,
    },
  });

  if (!studentPage) {
    notFound();
  }

  const publicHref = `/student/${studentPage.studentSlug}`;

  return (
    <StudentArticleForm
      contextLabel="Hồ sơ cá nhân"
      pageId={studentPage.id}
      publicHref={publicHref}
      saved={query.saved === "1"}
      studentName={studentPage.studentProfile.fullName}
      token={token}
    />
  );
}

