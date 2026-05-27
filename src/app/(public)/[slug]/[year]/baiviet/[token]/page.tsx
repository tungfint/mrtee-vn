import { notFound } from "next/navigation";

import { StudentArticleForm } from "@/components/content/student-article-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClassStudentArticlePage({
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
      studentProfile: { select: { fullName: true } },
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

  const publicHref = `/${studentPage.class.slug}/${studentPage.studentSlug}`;

  return (
    <StudentArticleForm
      contextLabel={`Lớp ${studentPage.class.name}`}
      pageId={studentPage.id}
      publicHref={publicHref}
      saved={query.saved === "1"}
      studentName={studentPage.studentProfile.fullName}
      token={token}
    />
  );
}
